import { Rule, TagType } from '../types'
import { logger } from '../util'

export const renderHeadPlugin: Rule = {
  type: 'renderer',
  token: TagType.head,
  rule: (tokens, index, options, env, self) => {
    const token = tokens[index]
    logger.log('Running renderHead plugin', token.children)
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
