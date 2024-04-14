import {
  _stringEnumKeyOrUndefined,
  _assert,
  _isNullish,
  _stringEnumValues,
  _first,
  _last,
  _numberEnumValue,
  _numberEnumEntries,
  AnyObject
} from '@naturalcycles/js-lib'
import MarkdownIt, { Token } from 'markdown-it'
import { MiniMdMeta, TagType, Nesting, Rule } from './types'
import {
  buildToken,
  findToken,
  isMiniMdToken,
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
 * Modification to allow link_open tokens to have attributes.
 * Attributes are declared as [](href, attr1=val1, attr2=val2).
 */
export const getLinkWithAttrsPlugin = (): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      const { tokens } = state
      const hrefSplitRegex = /(?<!\\),/
      const attrSplitRegex = /(?<!\\)=/
      const hrefContentRegex = /\((md:.*)\)/

      tokens.forEach((token) => {
        if (token.type === 'inline') {
          token.children?.forEach((child, i) => {
            if (
              child.type === 'text' &&
              child.content.match(hrefContentRegex)
            ) {
              logger.log('Found text token', child)
              child.type = 'link_open'
              child.nesting = Nesting.open
              child.tag = 'a'
              const [href, ...attrs] = child.content
                .match(hrefContentRegex)![1]
                .split(hrefSplitRegex)
              child.content = ''
              child.attrSet('href', href)
              logger.log('Setting href', href)
              child.meta = {
                ...(child.meta ?? {}),
                attrs: {
                  ...(child.meta?.attrs ?? {}),
                  ...attrs.reduce<AnyObject>(
                    (acc, attr) => {
                      const [key, val] =
                        attr.split(attrSplitRegex)
                      acc[key.trim()] = val.trim()
                      return acc
                    },
                    {}
                  )
                }
              }

              token.children?.splice(
                i + 1,
                0,
                new state.Token(
                  'link_close',
                  'a',
                  Nesting.close
                )
              )
            }
          })
        }
      })
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
      tokens.forEach((token, i) => {
        if (token.type === 'html_block') {
          logger.log('Found html_block token', token)
          let found = false
          ;[TagType.html, TagType.body].forEach((type) => {
            if (
              token.content?.trim().startsWith(`<${type}`)
            ) {
              const tag = findToken(
                tokens,
                Nesting.selfClose,
                type
              )
              _assert(tag)
              logger.log('Found tag', tag)

              const attrsRegex = /(\w+)=["']([^"']*)["']/g
              const attrs =
                token.content?.matchAll(attrsRegex)
              tag.attrs = [
                ...(tag.attrs ?? []),
                ...Array.from(attrs).map((attr) => {
                  const [_, key, val] = attr
                  return [key, val] as [string, string]
                })
              ]
              logger.log('Updated tag', tag.attrs)
              found = true
            }
          })
          if (found) {
            tokens.splice(i, 1)
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
  tokenIndices: number[],
  processTokens?: (tokens: Token[]) => Token[]
) => {
  const tag = findToken(tokens, nesting, tagType)
  _assert(
    tag?.children,
    'Tag should be initialized with children: ' + tagType
  )

  const readyTokens = processTokens
    ? processTokens(tokenIndices.map((i) => tokens[i]))
    : tokenIndices.map((i) => tokens[i])

  tag.children.push(...readyTokens)
  const sorted = tokenIndices.sort((a, b) => b - a)
  sorted.forEach((i) => {
    tokens.splice(i, 1)
  })
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
          ?.map((child) => ({
            href: child.attrGet('href'),
            meta: child.meta
          }))
        _assert(hrefs?.length, 'No hrefs found')
        tokens.splice(
          token,
          1,
          ...hrefs
            .map((child) => {
              const { href, meta } = child
              if (!href) {
                return []
              }
              logger.log('Found href', href)
              const { attrs } = meta ?? {}
              const markdownFile = readMarkdownFile(
                href.slice(3),
                attrs
              )
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
      let i = 0
      while (i < tokens.length) {
        if (
          tokens[i].type === 'inline' &&
          tokens[i].children?.some(
            (child) =>
              child.type === 'link_open' &&
              child.attrGet('href')?.startsWith('md:')
          )
        ) {
          handleToken(i)
        }
        i++
      }
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
    [PluginOrder['link-with-attrs']]:
      getLinkWithAttrsPlugin(),
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
