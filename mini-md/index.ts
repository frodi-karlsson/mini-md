import {
  _assert,
  _isNullish,
  _jsonEquals,
  _max,
  _maxBy,
  _objectAssign,
  _objectEntries,
  _objectKeys,
  _stringEnumKeyOrUndefined,
  _stringEnumKeys,
  _stringEnumValues
} from '@naturalcycles/js-lib'
import MarkdownIt from 'markdown-it'
import { MiniMdProps, ViewEngine } from './types'
import { logger, options, readMarkdownFile } from './util'
import { applyRules, registerRules } from './rules'

/**
 * Express middleware that serves markdown files from the specified root directory.
 */
export const miniMd = (props?: MiniMdProps): ViewEngine => {
  const {
    mdOptions = {},
    verbose,
    plugins = []
  } = props ?? {}
  logger.log = verbose
    ? (...args) => console.log('[mini-md]', ...args)
    : () => {}

  const md = new MarkdownIt(mdOptions)
  // Initializes our custom rules into a record.
  registerRules()
  // Applies all of our custom rules to the markdown-it instance in correct order.
  md.use(applyRules)

  // Adds any additional plugins to the markdown-it instance.
  plugins.forEach((plugin) => {
    md.use(plugin)
  })

  return async (
    path: string,
    rendererOptions,
    callback
  ) => {
    logger.log('Received options', rendererOptions)
    options.settings = rendererOptions.settings
    logger.log('Received path', path)
    const markdownFile = readMarkdownFile(path)

    if (markdownFile) {
      try {
        const rendered = md.render(markdownFile)
        logger.log('rendered', rendered)
        callback(null, rendered)
      } catch (e) {
        callback(e)
      }
    }
  }
}
