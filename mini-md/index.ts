import {
  _assert,
  _jsonEquals,
  _objectAssign
} from '@naturalcycles/js-lib'
import { fs2 } from '@naturalcycles/nodejs-lib'
import MarkdownIt from 'markdown-it'
import path from 'node:path'

const options: any = {}

const getSetting = (
  option: string | number | symbol,
  defaultValue?: any
) => {
  return options.settings?.[option] ?? defaultValue
}

const clearOptions = () => {
  var props = Object.getOwnPropertyNames(options)
  for (var i = 0; i < props.length; i++) {
    delete options[props[i]]
  }
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

const getRendererRule = (
  md: MarkdownIt
): MarkdownIt.Renderer.RenderRule => {
  return (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const href = token.attrGet('href')
    if (href && href.startsWith('md:')) {
      log(
        '[miniMd] Found reference to another markdown file',
        href
      )

      const referencedFile = readMarkdownFile(href.slice(3))
      log('[miniMd] Referenced file', referencedFile)

      if (referencedFile) {
        return md.render(referencedFile, { ...env })
      }
    }
    return self.renderToken(tokens, idx, options)
  }
}

let log: (...args: any[]) => void = () => {}

const miniMdPlugin = (md: MarkdownIt) => {
  md.renderer.rules.link_open = getRendererRule(md)
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
  plugins.forEach((plugin) => {
    md.use(plugin)
  })

  log = verbose ? console.log : () => {}

  md.use(miniMdPlugin)

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
