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
   * MarkdownIt instance to use. If not provided, a new instance will be created.
   * This is useful if you want to customize the markdown rendering or provide plugins.
   */
  md?: MarkdownIt
  /**
   * If true, various information will be console.logged.
   */
  verbose?: boolean
  /**
   * Glob for matching files that shouldn't be paths.
   * Defaults to '\*\*\/fragments\/\*\*\/\*.md'.
   */
  fragments?: string
  /**
   * Whether the paths should have markdown extensions.
   */
  markdownExtensions?: boolean
  /**
   * Options for the markdown-it instance.
   */
  mdOptions?: MarkdownIt.Options
  /**
   * Plugins you want to add to the markdown-it instance.
   */
  plugins?: MarkdownIt.PluginSimple[]
}

interface MarkdownFile {
  path: string
  content: string
}

const trimSlashes = (s: string) =>
  s.replace(/^\/+|\/+$/g, '')

const resolveMarkdownFiles = (
  rootPath: string
): MarkdownFile[] => {
  const files: MarkdownFile[] = []
  const filePaths = fs2
    .readdir(rootPath, {
      recursive: true,
      encoding: 'utf8',
      withFileTypes: true
    })
    .filter((f) => f.isFile() && f.name.endsWith('.md'))
    .map((f) => path.resolve(f.path, f.name))
  for (const filePath of filePaths) {
    const content = fs2.readText(filePath)
    files.push({
      path: path.relative(rootPath, filePath),
      content
    })
  }
  return files
}

/**
 * Express middleware that serves markdown files from the specified root directory.
 */
export const miniMd = ({
  rootDir,
  mdOptions = {},
  md = new MarkdownIt(mdOptions),
  verbose,
  fragments = '**/fragments/**/*.md',
  markdownExtensions = false,
  plugins = []
}: MiniMdProps): RequestHandler => {
  plugins.forEach((plugin) => md.use(plugin))
  const log = verbose ? console.log : () => {}
  const resolved = path.resolve(rootDir)
  const isDir = path.extname(resolved) === ''
  _assert(isDir, `rootDir must be a directory: ${rootDir}`)

  let markdownFiles = resolveMarkdownFiles(resolved)

  const miniMdPlugin: PluginSimple = (md) => {
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
        const referencedFile = markdownFiles.find(
          (f) => f.path === filePath
        )
        if (referencedFile) {
          const content = referencedFile.content
          return md.render(content, { ...env })
        }
      }
      return defaultRender(tokens, idx, options, env, self)
    }
  }

  md.use(miniMdPlugin)

  return async (req, res, next) => {
    markdownFiles = resolveMarkdownFiles(resolved)
    log('[miniMd] req.path', req.path)
    const globResult = minimatch(req.path, fragments)
    log('[miniMd] globResult', globResult)
    if (globResult) {
      // Do not serve files that match the fragments glob
      return next()
    }

    const filePath =
      trimSlashes(
        path.resolve(
          resolved,
          req.path === '/' ? '/index' : req.path
        )
        // We add markdown extensions if we don't expect them to be in the paths
      ) + (markdownExtensions ? '' : '.md')
    log('[miniMd] filePath', filePath)
    const markdownFile = markdownFiles.find(
      (f) => f.path === filePath
    )
    log('[miniMd] markdownFile', markdownFile)
    if (!markdownFile) {
      log('[miniMd] markdownFiles', markdownFiles)
    }

    if (markdownFile) {
      const stream = res.send(
        md.render(markdownFile.content)
      )
      stream.on('end', () => {
        log('[miniMd] stream end')
      })
      stream.on('finish', () => {
        log('[miniMd] stream finish')
      })
      stream.on('close', () => {
        log('[miniMd] stream close')
      })
      stream.on('error', (err) => {
        log('[miniMd] stream error', err)
      })

      return stream
    }
    next()
  }
}
