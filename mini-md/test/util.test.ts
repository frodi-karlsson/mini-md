import {
  options,
  getSetting,
  buildToken,
  findToken,
  isMiniMdToken,
  readMarkdownFile
} from '../src/util'
import { MiniMdMeta, Nesting, TagType } from '../src/types'
import MarkdownIt from 'markdown-it'

describe('util', () => {
  beforeAll(() => {
    options.settings = {
      views: 'test/test-md'
    }
  })

  afterAll(() => {
    options.settings = {}
    options.bindings = {}
  })

  const md = new MarkdownIt()
  const state = new md.core.State('', md, {})
  it('should build a token', () => {
    const token = buildToken(TagType.head, 1, state)
    expect(token.type).toBe(TagType.head)
    expect(token.nesting).toBe(1)
    expect(token.children).toStrictEqual([])
    expect(token.meta).toStrictEqual({
      [MiniMdMeta.head]: true
    })
  })

  it('should find a token', () => {
    const tokens = [
      buildToken(TagType.head, Nesting.selfClose, state),
      buildToken(TagType.body, Nesting.selfClose, state),
      buildToken(TagType.html, Nesting.selfClose, state)
    ]
    const token = findToken(
      tokens,
      Nesting.selfClose,
      TagType.body
    )
    expect(token?.type).toBe(TagType.body)
  })

  it('should determine if a token is a mini-md token', () => {
    const token = buildToken(TagType.head, 1, state)
    expect(isMiniMdToken(token)).toBe(true)
  })

  it('should read a markdown file', () => {
    const markdown = readMarkdownFile('helloworld.md')
    expect(markdown).toBe('Hello, World!\n')
  })

  it('should bind attrs to a markdown file', () => {
    options.bindings = {
      hello: 'Hello',
      world: 'World'
    }
    const markdown = readMarkdownFile('helloworld-bound.md')
    expect(markdown).toBe('Hello, World!\n')
  })

  it('should bind attrs params to a markdown file', () => {
    options.bindings = {}
    const markdown = readMarkdownFile(
      'helloworld-bound.md',
      {
        hello: 'Hello',
        world: 'World'
      }
    )
    expect(markdown).toBe('Hello, World!\n')
  })

  it('should get a setting', () => {
    const setting = getSetting('views')
    expect(setting).toBe('test/test-md')
  })
})
