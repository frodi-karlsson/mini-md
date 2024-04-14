import {
  _stringEnumKeyOrUndefined,
  _assert,
  _isNullish,
  _stringEnumValues,
  _first,
  _last,
  _numberEnumValue,
  _numberEnumEntries
} from '@naturalcycles/js-lib'
import MarkdownIt, { Token } from 'markdown-it'
import { MiniMdMeta, TagType, Nesting, Rule } from './types'
import {
  buildToken,
  findToken,
  isMiniMdToken,
  isContiguous,
  logger,
  readMarkdownFile
} from './util'
import { PluginOrder } from './const'

let ruleRegister: Record<PluginOrder, Rule> | null = null

/**
 * Creates an html structure for the document.
 * Simply creates opening and closing tags for the head, body, and html tags.
 */
export const getHtmlPlugin = (): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      logger.log('Running html plugin')
      if (state.env.skipCustom) {
        logger.log('Skipping custom rules for html plugin')
        return false
      }
      const { tokens } = state
      const htmlExists = tokens.some((token) =>
        isMiniMdToken(token, MiniMdMeta.html)
      )
      if (htmlExists) {
        logger.log('Html tag already exists')
        return false
      }

      const html = buildToken(
        TagType.html,
        Nesting.selfClose,
        state
      )

      const head = buildToken(
        TagType.head,
        Nesting.selfClose,
        state
      )

      const body = buildToken(
        TagType.body,
        Nesting.selfClose,
        state
      )
      html.children = [head, body]
      tokens.unshift(html)
      return false
    }
  }
}

/**
 * Captures <body ...> and <html ...> tags, removes them, and stores their attributes
 * in their respective tokens.
 */
export const getCaptureAttrsPlugin = (): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      logger.log('Running captureAttrs plugin')
      if (state.env.skipCustom) {
        logger.log(
          'Skipping custom rules for captureAttrs plugin'
        )
        return false
      }
      const { tokens } = state
      tokens.forEach((token) => {
        if (token.type === 'html_block') {
          logger.log('Found html_block token', token)
          if (token.content?.trim().startsWith('<html')) {
            const htmlToken = findToken(
              tokens,
              Nesting.selfClose,
              TagType.html
            )
            _assert(htmlToken)
            htmlToken.attrs = [
              ...(htmlToken.attrs ?? []),
              ...(token.attrs ?? [])
            ]
          } else if (
            token.content?.trim().startsWith('<body')
          ) {
            const bodyToken = findToken(
              tokens,
              Nesting.selfClose,
              TagType.body
            )
            _assert(bodyToken)
            bodyToken.attrs = [
              ...(bodyToken.attrs ?? []),
              ...(token.attrs ?? [])
            ]
          }
        }
      })
      return false
    }
  }
}

/**
 * Moves tokens into the specified tag if they match the specified criteria.
 */
export const insertIntoTag = (
  tokens: Token[],
  tagType: TagType,
  nesting: Nesting,
  range: number[],
  processTokens?: (tokens: Token[]) => Token[]
) => {
  const tag = findToken(tokens, nesting, tagType)
  _assert(
    tag?.children,
    'Tag should be initialized with children: ' + tagType
  )

  if (!range.length) {
    return
  }

  const resolvedRange = tokens.slice(
    _first(range),
    _last(range) + 1
  )
  const readyTokens = processTokens
    ? processTokens(resolvedRange)
    : resolvedRange

  tag.children.push(...readyTokens)
  tokens.splice(_first(range), range.length)
}

export const initMovePluginInternal = (
  intoTag: TagType,
  takeTokens: (tokens: Token[]) => number[],
  name: string,
  processTokens?: (tokens: Token[]) => Token[]
) => {
  return (tokens: Token[]) => {
    logger.log(
      `Running move:${name} plugin with intoTag: ${intoTag}`
    )
    const newTokens = takeTokens(tokens)
    _assert(
      isContiguous(newTokens),
      'Tokens should be range-like'
    )
    insertIntoTag(
      tokens,
      intoTag,
      Nesting.selfClose,
      newTokens,
      processTokens
    )
  }
}

/**
 * Moves html tokens into the specified tag
 * if they match the specified criteria.
 */
export const getMovePlugin = (
  intoTag: TagType,
  takeTokens: (tokens: Token[]) => number[],
  plugin: PluginOrder,
  processTokens?: (tokens: Token[]) => Token[]
): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      if (state.env.skipCustom) {
        logger.log(
          'Skipping custom rules for',
          PluginOrder[plugin]
        )
        return false
      }
      const { tokens } = state
      initMovePluginInternal(
        intoTag,
        takeTokens,
        PluginOrder[plugin],
        processTokens
      )(tokens)
      return false
    }
  }
}

const getRenderHeadPlugin = (): Rule => {
  return {
    type: 'renderer',
    token: TagType.head,
    rule: (tokens, index, options, env, self) => {
      const token = tokens[index]
      logger.log('Running renderHead plugin')
      return `<head>${
        token.children?.length
          ? self.render(token.children, options, {
              ...env,
              skipCustom: true
            })
          : ''
      }</head>`
    }
  }
}
const getRenderBodyPlugin = (): Rule => {
  return {
    type: 'renderer',
    token: TagType.body,
    rule: (tokens, index, options, env, self) => {
      const token = tokens[index]
      const nullishTokens = tokens.filter((token) =>
        _isNullish(token)
      )
      _assert(
        !nullishTokens.length,
        'Nullish tokens found:\n' +
          JSON.stringify(nullishTokens, null, 2)
      )
      logger.log('Running renderBody plugin')
      return `<body ${self.renderAttrs(token)}>${
        token.children?.length
          ? self.render(token.children, options, {
              ...env,
              skipCustom: true
            })
          : ''
      }</body>`
    }
  }
}

const getRenderHtmlPlugin = (): Rule => {
  return {
    type: 'renderer',
    token: TagType.html,
    rule: (tokens, index, options, env, self) => {
      const token = tokens[index]
      logger.log('Running renderHtml plugin')
      return `<!DOCTYPE html><html ${self.renderAttrs(
        token
      )}>${
        token.children?.length
          ? self.render(token.children, options, {
              ...env,
              skipCustom: true
            })
          : ''
      }</html>`
    }
  }
}

/**
 * The meat of the templating engine. It injects other markdown files into the current one.
 *
 * \[md:file.md\] will be replaced with the contents of file.md.
 */
export const getMiniMdPlugin = (): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      logger.log('Running miniMd plugin')
      const { tokens, md } = state
      const handleToken = (token: number): void => {
        logger.log('Found token', tokens[token])
        const hrefs = tokens[token].children
          ?.filter(
            (child) =>
              child.type === 'link_open' &&
              child.attrGet('href')?.startsWith('md:')
          )
          ?.map((child) => child.attrGet('href'))
        _assert(hrefs?.length, 'No hrefs found')
        tokens.splice(
          token,
          1,
          ...hrefs
            .map((href) => {
              _assert(href, 'Href should be defined')
              logger.log('Found href', href)
              const filePath = href.slice(3)
              const markdownFile =
                readMarkdownFile(filePath)
              if (markdownFile) {
                return md.parse(markdownFile, {
                  skipCustom: true
                })
              }
              return []
            })
            .flat()
        )
      }
      tokens
        .map((_, i) => i)
        .filter(
          (token) =>
            tokens[token].type === 'inline' &&
            tokens[token].children?.some(
              (child) =>
                child.type === 'link_open' &&
                child.attrGet('href')?.startsWith('md:')
            )
        )
        .forEach((token) => {
          handleToken(token)
        })
      return false
    }
  }
}

/**
 * Registers all rules in our ruleRegister record.
 * Order is predetermined by the pluginOrder array.
 */
export const registerRules = () => {
  ruleRegister = {
    [PluginOrder['html-structure']]: getHtmlPlugin(),
    [PluginOrder['capture-attrs']]: getCaptureAttrsPlugin(),
    [PluginOrder.miniMd]: getMiniMdPlugin(),
    [PluginOrder['move-head']]: getMovePlugin(
      TagType.head,
      (tokens) =>
        tokens
          .map((_, i) => i)
          .filter(
            (token) =>
              tokens[token].type === 'html_block' &&
              tokens[token].content
                ?.trim()
                .startsWith('<head>')
          ),
      PluginOrder['move-head'],
      (tokens) =>
        tokens.map(
          (token) =>
            ({
              ...token,
              content: token.content
                ?.replace('<head>', '')
                .replace('</head>', '')
            }) as Token
        )
    ),
    [PluginOrder['move-body']]: getMovePlugin(
      TagType.body,
      (tokens) =>
        tokens
          .map((_, i) => i)
          .filter(
            (token) =>
              !_stringEnumValues(MiniMdMeta).some((meta) =>
                isMiniMdToken(tokens[token], meta)
              )
          ),
      PluginOrder['move-body']
    ),
    [PluginOrder['render-html:head']]:
      getRenderHeadPlugin(),
    [PluginOrder['render-html:body']]:
      getRenderBodyPlugin(),
    [PluginOrder['render-html:html']]: getRenderHtmlPlugin()
  }
}

/**
 * Applies all rules in order to the markdown-it instance.
 */
export const applyRules = (md: MarkdownIt) => {
  _assert(
    ruleRegister,
    'Rules should be registered before applying'
  )
  _numberEnumEntries(PluginOrder).forEach(
    ([name, value]) => {
      const rule =
        ruleRegister![_numberEnumValue(PluginOrder, name)]
      const previousOfType = _numberEnumEntries(PluginOrder)
        .filter(([_, v]) => v < value)
        .reverse()
        .find((n) => ruleRegister![n[1]].type === rule.type)
      switch (rule.type) {
        case 'core':
          if (previousOfType) {
            md.core.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.core.ruler.push(name, rule.rule)
          }
          break
        case 'block':
          if (previousOfType) {
            md.block.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.block.ruler.push(name, rule.rule)
          }
          break
        case 'inline':
          if (previousOfType) {
            md.inline.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.inline.ruler.push(name, rule.rule)
          }
          break
        case 'renderer':
          md.renderer.rules[rule.token] = rule.rule
          break
      }
    }
  )
}
