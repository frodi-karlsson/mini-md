export enum Nesting {
  open = 1,
  close = -1,
  selfClose = 0
}

export enum TagType {
  head = 'head',
  body = 'body',
  html = 'html'
}

export enum MiniMdMeta {
  head = 'miniMdHead',
  body = 'miniMdBody',
  html = 'miniMdHtml'
}

export interface MiniMdProps {
  /**
   * Options for the markdown-it instance.
   * Defaults to an empty object.
   */
  mdOptions?: MarkdownIt.Options
  /**
   * Plugins you want to add to the markdown-it instance.
   * Defaults to an empty array.
   */
  plugins?: (
    | MarkdownIt.PluginSimple
    | MarkdownIt.PluginWithOptions
    | MarkdownIt.PluginWithParams
  )[]
  /**
   * If true, various information will be console.logged.
   * Defaults to false.
   */
  verbose?: boolean
}

export type ViewEngine = (
  path: string,
  options: any,
  callback: (e: any, rendered?: string | undefined) => void
) => void

export interface InternalRuleTracker {
  name: string
  enabled: boolean
  fn: Function
  alt: string[]
}

export type Rule =
  | {
      type: 'core'
      rule: MarkdownIt.Core.RuleCore
    }
  | {
      type: 'block'
      rule: MarkdownIt.ParserBlock.RuleBlock
    }
  | {
      type: 'inline'
      rule: MarkdownIt.ParserInline.RuleInline2
    }
  | {
      type: 'renderer'
      token: string
      rule: MarkdownIt.Renderer.RenderRule
    }
