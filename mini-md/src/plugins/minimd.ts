import { _assert } from '@naturalcycles/js-lib'
import { Rule } from '../types'
import {
  logger,
  mdLinkRegex,
  readMarkdownFile
} from '../util'

/**
 * The meat of the templating engine. It injects other markdown files into the current one.
 *
 * \[md:file.md\] will be replaced with the contents of file.md.
 */
export const miniMdPlugin: Rule = {
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
              return md
                .parse(markdownFile, {
                  skipCustom: true
                })
                .map((token) => {
                  token.meta = {
                    ...(token.meta ?? {})
                  }
                  return token
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
