import { AnyObject } from '@naturalcycles/js-lib'
import { Rule, Nesting } from '../types'
import {
  logger,
  hrefSplitRegex,
  attrSplitRegex,
  mdLinkRegex
} from '../util'

/**
 * Modification to allow link_open tokens to have attributes.
 * Attributes are declared as [](href, attr1=val1, attr2=val2).
 */
export const linkWithAttrsPlugin: Rule = {
  type: 'core',
  rule: (state) => {
    const { tokens } = state
    logger.log('Running linkWithAttrs plugin')
    tokens.forEach((token) => {
      if (token.type === 'inline') {
        token.children?.forEach((child, i) => {
          if (
            child.type === 'text' &&
            child.content.match(mdLinkRegex)
          ) {
            logger.log('Found text token', child)
            child.type = 'link_open'
            child.nesting = Nesting.open
            child.tag = 'a'
            const match = child.content
              .slice(1, -1)
              .trim()
              .split(hrefSplitRegex)
            logger.log('Match', match)
            const [unparsedHref, ...attrs] = match
            const hrefMatch = mdLinkRegex.exec(
              unparsedHref + ')'
            )
            const href = hrefMatch?.[2]?.trim()
            if (!href) {
              return
            }

            child.content = ''
            child.attrSet('href', href)
            logger.log('Setting href', href)
            child.meta = {
              ...(child.meta ?? {}),
              attrs: {
                ...(child.meta?.attrs ?? {}),
                ...attrs.reduce<AnyObject>((acc, attr) => {
                  const [key, val] =
                    attr.split(attrSplitRegex)
                  acc[key.trim()] = val.trim()
                  return acc
                }, {})
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
