import { type RequestHandler } from 'express'
import { _assert } from '@naturalcycles/js-lib'
import path from 'node:path'
import { fs2 } from '@naturalcycles/nodejs-lib'
import MarkdownIt, { PluginSimple } from 'markdown-it'
import { minimatch } from 'minimatch'

interface MiniMdProps {
  /**
   * Root directory where markdown files are located.
   */
  rootDir: string
  /**
   * If true, various information will be console.logged.
   * Defaults to false.
   */
  verbose?: boolean
  /**
   * Glob for matching files that shouldn't be paths.
   * Defaults to '\*\*\/fragments\/\*\*\/\*.md'.
   */
  fragments?: string
  /**
   * Whether the paths should have markdown extensions.
   * Defaults to false.
   */
  markdownExtensions?: boolean
  /**
   * Options for the markdown-it instance.
   * Defaults to an empty object.
   */
  mdOptions?: MarkdownIt.Options
  /**
   * Plugins you want to add to the markdown-it instance.
   * Defaults to an empty array.
   */
  plugins?: (MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions | MarkdownIt.PluginWithParams)[]
}

const trimSlashes = (s: string) =>
  s.replace(/^\/+|\/+$/g, '')

const readMarkdownFile = (filePath: string): string | null => {
  if (!fs2.pathExists(filePath) || !filePath.endsWith('.md')) {
    return null
  }

  return fs2.readText(filePath)
}

let log: (...args: any[]) => void = () => {}

const getMiniMdPlugin = (resolved: string) => (md: MarkdownIt) => {
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
  md.renderer.rules.link_open = function (
    tokens,
    idx,
    options,
    env,
    self
  ) {
    log(
      '[miniMd] found link',
      tokens[idx].attrGet('href')
    )
    const href = tokens[idx].attrGet('href')
    if (href && href.startsWith('md:')) {
      // replace the link with the parsed markdown content
      // of the referenced file
      const filePath = href.slice(3)
      log('[miniMd] referenced file', filePath)
      const referencedFile = readMarkdownFile(
        path.resolve(resolved, filePath)
      )
      if (referencedFile) {
        return md.render(referencedFile, { ...env })
      }
    }
    return defaultRender(tokens, idx, options, env, self)
  }
}

/**
 * Express middleware that serves markdown files from the specified root directory.
 */
export const miniMd = ({
  rootDir,
  mdOptions = {},
  verbose,
  fragments = '**/fragments/**/*.md',
  markdownExtensions = false,
  plugins = []
}: MiniMdProps): RequestHandler => {
  const md = new MarkdownIt(mdOptions)
  plugins.forEach((plugin) => {
    md.use(plugin)
  })

  log = verbose ? console.log : () => {}

  const resolved = path.resolve(rootDir)
  log('[miniMd] resolved rootDir', resolved)

  const isDir = path.extname(resolved) === ''
  _assert(isDir, `rootDir must be a directory: ${rootDir}`)

  md.use(getMiniMdPlugin(resolved))

  return async (req, res, next) => {
    log('[miniMd] req.path', req.path)
    const filePath =
        path.resolve(
          resolved,
        // We add markdown extensions if we don't expect them to be in the paths
          trimSlashes(req.path === '/' ? '/index' : req.path)+ (markdownExtensions ? '' : '.md')
        )
    if (minimatch(filePath, fragments)) {
      log('[miniMd] skipping fragments')
      return next()
    }
    log('[miniMd] filePath', filePath)
    const markdownFile = readMarkdownFile(filePath)
    log('[miniMd] markdownFile', markdownFile)

    if (markdownFile) {
      const stream = res.send(
        md.render(markdownFile)
      )
      stream.on('error', (err) => {
        log('[miniMd] stream error', err)
      })
      return stream
    }
    next()
  }
}
