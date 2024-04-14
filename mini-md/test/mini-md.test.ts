import { miniMd } from '../src/index'
import * as rules from '../src/rules'
import { options } from '../src/util'

describe('miniMd', () => {
  beforeEach(() => {
    options.settings = {
      views: 'test/test-md'
    }
  })

  afterEach(() => {
    options.settings = {}
  })

  it('should render markdown', () => {
    const md = miniMd()
    const callback = jest.fn()
    md('helloworld.md', {}, callback)
    expect(callback).toHaveBeenCalledWith(
      null,
      '<!DOCTYPE html><html ><head></head><body ><p>Hello, World!</p>\n</body></html>'
    )
  })

  it('should bind attrs to a markdown file', () => {
    const md = miniMd()
    const callback = jest.fn()
    md(
      'helloworld-bound.md',
      {
        bindings: {
          hello: 'Hello',
          world: 'World'
        }
      },
      callback
    )
    expect(callback).toHaveBeenCalledWith(
      null,
      '<!DOCTYPE html><html ><head></head><body ><p>Hello, World!</p>\n</body></html>'
    )
  })

  it('should register and add rules on initialization', () => {
    const register = jest.spyOn(rules, 'registerRules')
    const apply = jest.spyOn(rules, 'applyRules')

    miniMd()
    expect(register).toHaveBeenCalled()
    expect(apply).toHaveBeenCalled()
  })
})
