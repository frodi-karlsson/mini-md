import {
  _stringEnumKeyOrUndefined,
  _assert,
  _isNullish,
  _stringEnumValues,
  _first,
  _last,
  _numberEnumValue,
  _numberEnumEntries
} from '@naturalcycles/js-lib'
import MarkdownIt, { Token } from 'markdown-it'
import { MiniMdMeta, TagType, Rule, Nesting } from './types'
import { isMiniMdToken } from './util'
import { PluginOrder } from './const'
import { getMovePlugin } from './plugins/builders/moveplugin'
import { htmlPlugin } from './plugins/gethtml'
import { linkWithAttrsPlugin } from './plugins/linkwithattrs'
import { captureAttrsPlugin } from './plugins/captureattrs'
import { renderBodyPlugin } from './plugins/renderbody'
import { renderHeadPlugin } from './plugins/renderhead'
import { renderHtmlPlugin } from './plugins/renderhtml'
import { miniMdPlugin } from './plugins/minimd'

let ruleRegister: Record<PluginOrder, Rule> | null = null

/**
 * Registers all rules in our ruleRegister record.
 * Order is predetermined by the pluginOrder array.
 */
export const registerRules = () => {
  ruleRegister = {
    [PluginOrder['html-structure']]: htmlPlugin,
    [PluginOrder['link-with-attrs']]: linkWithAttrsPlugin,
    [PluginOrder['capture-attrs']]: captureAttrsPlugin,
    [PluginOrder.miniMd]: miniMdPlugin,
    [PluginOrder['move-head']]: getMovePlugin(
      TagType.head,
      (tokens) =>
        tokens
          .map((_, i) => i)
          .filter((token) =>
            tokens[token].content
              ?.trim()
              .startsWith('<head>')
          ),
      PluginOrder['move-head'],
      (tokens, state) =>
        tokens.map((token) => {
          const newToken = new state.Token(
            'html_block',
            '',
            Nesting.selfClose
          )
          newToken.content = token.content
            ?.replace('<head>', '')
            .replace('</head>', '')
          return newToken
        })
    ),
    [PluginOrder['move-body']]: getMovePlugin(
      TagType.body,
      (tokens) =>
        tokens
          .map((_, i) => i)
          .filter(
            (token) =>
              !_stringEnumValues(MiniMdMeta).some((meta) =>
                isMiniMdToken(tokens[token], meta)
              )
          ),
      PluginOrder['move-body']
    ),
    [PluginOrder['render-html:head']]: renderHeadPlugin,
    [PluginOrder['render-html:body']]: renderBodyPlugin,
    [PluginOrder['render-html:html']]: renderHtmlPlugin
  }
}

/**
 * Applies all rules in order to the markdown-it instance.
 */
export const applyRules = (md: MarkdownIt) => {
  _assert(
    ruleRegister,
    'Rules should be registered before applying'
  )
  _numberEnumEntries(PluginOrder).forEach(
    ([name, value]) => {
      const rule =
        ruleRegister![_numberEnumValue(PluginOrder, name)]
      const previousOfType = _numberEnumEntries(PluginOrder)
        .filter(([_, v]) => v < value)
        .reverse()
        .find((n) => ruleRegister![n[1]].type === rule.type)
      switch (rule.type) {
        case 'core':
          if (previousOfType) {
            md.core.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.core.ruler.push(name, rule.rule)
          }
          break
        case 'block':
          if (previousOfType) {
            md.block.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.block.ruler.push(name, rule.rule)
          }
          break
        case 'inline':
          if (previousOfType) {
            md.inline.ruler.after(
              previousOfType[0],
              name,
              rule.rule
            )
          } else {
            md.inline.ruler.push(name, rule.rule)
          }
          break
        case 'renderer':
          md.renderer.rules[rule.token] = rule.rule
          break
      }
    }
  )
}
