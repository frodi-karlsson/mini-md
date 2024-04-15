import {
  Rule,
  MiniMdMeta,
  TagType,
  Nesting
} from '../types'
import { logger, isMiniMdToken, buildToken } from '../util'

/**
 * Creates an html structure for the document.
 * Simply creates opening and closing tags for the head, body, and html tags.
 */
export const htmlPlugin: Rule = {
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
