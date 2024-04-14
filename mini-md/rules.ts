import {
  _stringEnumKeyOrUndefined,
  _assert,
  _isNullish,
  _stringEnumValues,
  _first,
  _last
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
import { pluginOrder } from './const'

const ruleRegister: Partial<
  Record<(typeof pluginOrder)[number], Rule>
> = {}

const registerRule = (
  name: (typeof pluginOrder)[number],
  rule: Rule
) => {
  ruleRegister[name] = rule
}

/**
 * Creates an html structure for the document.
 * Simply creates opening and closing tags for the head, body, and html tags.
 */
export const registerHtmlPlugin = () => {
  registerRule('html-structure', {
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
  })
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
export const registerMovePlugin = (
  intoTag: TagType,
  takeTokens: (tokens: Token[]) => number[],
  name: (typeof pluginOrder)[number],
  processTokens?: (tokens: Token[]) => Token[]
) => {
  registerRule(name, {
    type: 'core',
    rule: (state) => {
      if (state.env.skipCustom) {
        logger.log('Skipping custom rules for', name)
        return false
      }
      const { tokens } = state
      initMovePluginInternal(
        intoTag,
        takeTokens,
        name,
        processTokens
      )(tokens)
      return false
    }
  })
}

/**
 * Renders the html token during rendering.
 */
export const registerRenderHtmlPlugin = () => {
  registerRule('render-html:head', {
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
  })

  registerRule('render-html:body', {
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
  })

  registerRule('render-html:html', {
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
  })
}

/**
 * The meat of the templating engine. It injects other markdown files into the current one.
 *
 * \[md:file.md\] will be replaced with the contents of file.md.
 */
export const registerMiniMdPlugin = () => {
  registerRule('miniMd', {
    type: 'core',
    rule: (state) => {
      logger.log('Running miniMd plugin')
      const { tokens, md } = state
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
          logger.log('Found token', tokens[token])
          const href = tokens[token].children
            ?.find(
              (child) =>
                child.type === 'link_open' &&
                child.attrGet('href')?.startsWith('md:')
            )
            ?.attrGet('href')
          _assert(href)
          const filePath = href.slice(3)
          const markdownFile = readMarkdownFile(filePath)
          if (markdownFile) {
            tokens.splice(
              token,
              1,
              ...[
                ...md.parse(markdownFile, {
                  skipCustom: true
                })
              ]
            )
          }
        })
      return false
    }
  })
}

/**
 * Registers all rules in our ruleRegister record.
 * Order is predetermined by the pluginOrder array.
 */
export const registerRules = () => {
  registerHtmlPlugin()
  registerMovePlugin(
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
    'move-head',
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
  )
  registerMovePlugin(
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
    'move-body'
  )
  registerRenderHtmlPlugin()
  registerMiniMdPlugin()
}

/**
 * Applies all rules in order to the markdown-it instance.
 */
export const applyRules = (md: MarkdownIt) => {
  pluginOrder.forEach((name) => {
    const rule = ruleRegister[name]
    _assert(rule, 'Rule not registered yet: ' + name)
    const previousOfType = pluginOrder
      .slice(0, pluginOrder.indexOf(name))
      .reverse()
      .find((n) => ruleRegister[n]!.type === rule.type)
    switch (rule.type) {
      case 'core':
        if (previousOfType) {
          md.core.ruler.after(
            previousOfType,
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
            previousOfType,
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
            previousOfType,
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
  })
}
