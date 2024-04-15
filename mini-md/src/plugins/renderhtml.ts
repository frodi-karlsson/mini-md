import { Rule, TagType } from '../types'
import { logger } from '../util'

export const renderHtmlPlugin: Rule = {
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
