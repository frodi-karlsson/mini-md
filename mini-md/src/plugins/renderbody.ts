import { _isNullish, _assert } from '@naturalcycles/js-lib'
import { Rule, TagType } from '../types'
import { logger } from '../util'

export const renderBodyPlugin: Rule = {
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
    logger.log('Running renderBody plugin', token.attrs)
    logger.log('Rendered attrs', self.renderAttrs(token))
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
