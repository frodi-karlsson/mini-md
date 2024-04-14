import {
  StateInline,
  StateCore,
  StateBlock,
  Token
} from 'markdown-it'
import { TagType, Nesting, MiniMdMeta } from './types'
import path from 'node:path'
import { fs2 } from '@naturalcycles/nodejs-lib'
import {
  _jsonEquals,
  _mapToObject,
  _objectAssign,
  _stringEnumKeyOrUndefined,
  pupa
} from '@naturalcycles/js-lib'

export const logger: {
  log: (typeof console)['log']
} = {
  log: () => {}
}

export const options: any = {}

export const getSetting = (
  option: string | number | symbol,
  defaultValue?: any
) => {
  return options.settings?.[option] ?? defaultValue
}

export const buildToken = (
  type: TagType,
  nesting: Nesting,
  state: StateInline | StateCore | StateBlock
): Token => {
  const token = new state.Token(type, '', 0)
  token.type = type
  token.nesting = nesting
  token.children = []
  token.meta = {
    [MiniMdMeta[type]]: true
  }
  return token
}

export const readMarkdownFile = (
  filePath: string,
  attrs: Record<string, string> = {}
): string | null => {
  const views = getSetting('views', '')
  logger.log('views', views)
  logger.log('filePath', filePath)
  logger.log('attrs', attrs)

  const resolved = path.resolve(
    process.cwd(),
    views,
    filePath
  )

  logger.log('resolved', resolved)

  if (
    !fs2.pathExists(resolved) ||
    !resolved.endsWith('.md')
  ) {
    logger.log('File does not exist or is not an .md file')
    return null
  }

  const baseAttrs = {
    'curly-open': '{'
  }

  return pupa(
    fs2.readText(resolved),
    Object.assign(baseAttrs, attrs, options.bindings)
  )
}

export const isMiniMdToken = (
  token: Token,
  metaType?: MiniMdMeta
): boolean => {
  if (metaType) {
    return token.meta?.[metaType]
  }
  return !!_stringEnumKeyOrUndefined(TagType, token.type)
}

/**
 * Helper function to find a token in the tokens array.
 */
export const findToken = (
  tokens: Token[],
  nesting: Nesting,
  type: TagType
) => {
  const token = tokens
    .flatMap((token) => [token, ...(token.children ?? [])])
    .find(
      (token) =>
        isMiniMdToken(token) &&
        token.nesting === nesting &&
        token.type === type
    )
  return token ?? null
}
