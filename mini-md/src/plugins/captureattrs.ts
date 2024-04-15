import { _assert } from '@naturalcycles/js-lib'
import { Nesting, Rule, TagType } from '../types'
import { attrSplitRegex, findToken, logger } from '../util'

/**
 * Captures <body ...> and <html ...> tags, removes them, and stores their attributes
 * in their respective tokens.
 */
export const captureAttrsPlugin: Rule = {
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
    logger.log(
      'Tokens',
      tokens.map((t) => ({
        type: t.type,
        attrs: t.attrs,
        content: t.content,
        children: t.children
      }))
    )
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

            const attrs = token.content
              .split(' ')
              .slice(1)
              .flatMap((attr) => {
                const [key, val] =
                  attr.split(attrSplitRegex)
                return [[key, val?.replace(/"/g, '')]]
              })
              .filter((attrs) =>
                attrs.every((attr) => !!attr)
              )

            logger.log('Attrs', attrs)
            tag.attrs = [
              ...(tag.attrs ?? []),
              ...attrs.map((attr) => {
                const [key, val] = attr
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
