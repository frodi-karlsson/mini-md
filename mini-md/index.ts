import {
  _assert,
  _jsonEquals,
  _objectAssign
} from '@naturalcycles/js-lib'
import { fs2 } from '@naturalcycles/nodejs-lib'
import MarkdownIt, { Token } from 'markdown-it'
import path from 'node:path'

const options: any = {}

const getSetting = (
  option: string | number | symbol,
  defaultValue?: any
) => {
  return options.settings?.[option] ?? defaultValue
}

interface MiniMdProps {
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

type ViewEngine = (
  path: string,
  options: any,
  callback: (e: any, rendered?: string | undefined) => void
) => void

const readMarkdownFile = (
  filePath: string
): string | null => {
  const views = getSetting('views', '')
  log('[miniMd] views', views)

  const resolved = path.resolve(
    process.cwd(),
    views,
    filePath
  )

  log('[miniMd] resolved', resolved)

  if (
    !fs2.pathExists(resolved) ||
    !resolved.endsWith('.md')
  ) {
    log(
      '[miniMd] File does not exist or is not an .md file'
    )
    return null
  }

  return fs2.readText(resolved)
}

let log: (...args: any[]) => void = () => {}

/**
 * Creates an empty head html_block token at the beginning of the tokens array.
 */
const headPlugin = (md: MarkdownIt) => {
  md.core.ruler.push('head', (state) => {
    log('[miniMd] Running head plugin')

    const { env } = state
    if (env.skipCustom) {
      console.log('[miniMd] Skipping head plugin')
      return
    }
    const { tokens } = state
    const existsAlready = tokens.some(
      (token) =>
        token.type === 'html_block' &&
        token.meta?.miniMdHead
    )
    if (existsAlready) {
      log('[miniMd] head token already exists')
      return
    }
    log('[miniMd] Creating head token')
    tokens.unshift({
      type: 'html_block',
      content: '<head></head>',
      block: true,
      meta: {
        miniMdHead: true
      }
    } as Token)
  })
}

/**
 * Moves the contents of <head> html_block tokens to the mini-md head
 */
const moveToHeadPlugin = (md: MarkdownIt) => {
  md.core.ruler.push('moveHead', (state) => {
    log('[miniMd] Running moveToHead plugin')

    const { env } = state
    if (env.skipCustom) {
      console.log('[miniMd] Skipping moveToHead plugin')
      return
    }
    const { tokens } = state
    log('[miniMd] tokens', tokens)
    const miniMdHead = tokens.find(
      (token) =>
        token.type === 'html_block' &&
        token.meta?.miniMdHead
    )

    if (!miniMdHead) {
      console.warn(
        '[miniMd] Could not find miniMd head token. Make sure that the head plugin is enabled.'
      )
      return
    }

    const headTokens = tokens
      .map((token, i) => ({ token, i }))
      .filter(
        ({ token }) =>
          token.type === 'html_block' &&
          !token.meta?.miniMdHead
      )
      .map(({ token, i }) => ({
        token: {
          ...token,
          content: token.content
            .replace('<head>', '')
            .replace('</head>', '')
        } as Token,
        i
      }))
    log('[miniMd] headTokens', headTokens)
    headTokens.forEach(({ token, i }) => {
      tokens.splice(i, 1)
      log('[miniMd] head before', miniMdHead.content)
      miniMdHead.content = miniMdHead.content.replace(
        '</head>',
        token.content + '</head>'
      )
      log('[miniMd] head after', miniMdHead.content)
    })
  })
}

/**
 * The meat of the templating engine. It injects other markdown files into the current one.
 *
 * \[md:file.md\] will be replaced with the contents of file.md.
 */
const miniMdPlugin = (md: MarkdownIt) => {
  md.core.ruler.push('miniMd', (state) => {
    log('[miniMd] Running miniMd plugin')
    const { tokens } = state
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.type === 'inline') {
        const { children } = token
        const newChildren: Token[] = []
        const open = children?.find(
          (child) =>
            child.type === 'link_open' &&
            child.attrGet('href')?.startsWith('md:')
        )
        if (open) {
          const href = open.attrGet('href')
          _assert(href)
          const filePath = href.slice(3)
          const markdownFile = readMarkdownFile(filePath)
          if (markdownFile) {
            tokens.splice(
              i,
              1,
              ...[
                ...md.parse(markdownFile, {
                  skipCustom: true
                })
              ]
            )
          }
        }
      }
    }
  })
}

/**
 * Express middleware that serves markdown files from the specified root directory.
 */
export const miniMd = (props?: MiniMdProps): ViewEngine => {
  const {
    mdOptions = {},
    verbose,
    plugins = []
  } = props ?? {}
  const md = new MarkdownIt(mdOptions)
  md.use(miniMdPlugin)
  md.use(headPlugin)
  md.use(moveToHeadPlugin)

  plugins.forEach((plugin) => {
    md.use(plugin)
  })

  log = verbose ? console.log : () => {}

  return async (
    path: string,
    rendererOptions,
    callback
  ) => {
    log('[miniMd] Received options', rendererOptions)
    _objectAssign(options, rendererOptions)
    log('[miniMd] Received path', path)
    const markdownFile = readMarkdownFile(path)
    log('[miniMd] markdownFile', markdownFile)

    if (markdownFile) {
      try {
        const rendered = md.render(markdownFile)
        console.log('[miniMd] rendered', rendered)
        callback(null, rendered)
      } catch (e) {
        callback(e)
      }
    }
  }
}
