import { StateCore, Token } from 'markdown-it'
import { PluginOrder } from '../../const'
import { TagType, Rule, Nesting } from '../../types'
import { findToken, logger } from '../../util'
import { _assert } from '@naturalcycles/js-lib'

/**
 * Moves tokens into the specified tag if they match the specified criteria.
 */
export const insertIntoTag = (
  tokens: Token[],
  tagType: TagType,
  nesting: Nesting,
  tokenIndices: number[],
  state: StateCore,
  processTokens?: (
    tokens: Token[],
    state: StateCore
  ) => Token[]
) => {
  const tag = findToken(tokens, nesting, tagType)
  _assert(
    tag?.children,
    'Tag should be initialized with children: ' + tagType
  )

  const readyTokens = processTokens
    ? processTokens(
        tokenIndices.map((i) => tokens[i]),
        state
      )
    : tokenIndices.map((i) => tokens[i])

  tag.children.push(...readyTokens)
  const sorted = [...tokenIndices].sort((a, b) => b - a)
  sorted.forEach((i) => {
    tokens.splice(i, 1)
  })
}

export const initMovePluginInternal = (
  intoTag: TagType,
  takeTokens: (
    tokens: Token[],
    state: StateCore
  ) => number[],
  name: string,
  processTokens?: (
    tokens: Token[],
    state: StateCore
  ) => Token[]
) => {
  return (tokens: Token[], state: StateCore) => {
    logger.log(
      `Running move:${name} plugin with intoTag: ${intoTag}`
    )
    const newTokens = takeTokens(tokens, state)
    insertIntoTag(
      tokens,
      intoTag,
      Nesting.selfClose,
      newTokens,
      state,
      processTokens
    )
  }
}

/**
 * Moves html tokens into the specified tag
 * if they match the specified criteria.
 */
export const getMovePlugin = (
  intoTag: TagType,
  takeTokens: (
    tokens: Token[],
    state: StateCore
  ) => number[],
  plugin: PluginOrder,
  processTokens?: (
    tokens: Token[],
    state: StateCore
  ) => Token[]
): Rule => {
  return {
    type: 'core',
    rule: (state) => {
      if (state.env.skipCustom) {
        logger.log(
          'Skipping custom rules for',
          PluginOrder[plugin]
        )
        return false
      }
      const { tokens } = state
      initMovePluginInternal(
        intoTag,
        takeTokens,
        PluginOrder[plugin],
        processTokens
      )(tokens, state)
      return false
    }
  }
}
