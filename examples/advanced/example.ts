import express from 'express'
import { miniMd } from 'mini-md'
import markdownItAttrs from 'markdown-it-attrs'
import { RequestHandler } from 'express-serve-static-core'
import hljs from 'highlight.js'

const app = express()

app.engine(
  'md',
  miniMd({
    mdOptions: {
      html: true,
      xhtmlOut: true
    },
    verbose: true,
    plugins: [markdownItAttrs]
  })
)
app.set('views', 'md')
app.use(express.static('public'))

const notFound: RequestHandler = (_, res) => {
  res.status(404).send('Not found')
}

app.get('/', (_, res) => {
  res.render('index.md', {
    bindings: {
      msg: 'Hello, world!'
    }
  })
})

app.use(notFound)

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
