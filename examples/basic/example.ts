import express from 'express'
import { miniMd } from 'mini-md'

const app = express()
app.engine('md', miniMd())
app.set('views', 'md')

app.get('/', (_, res) => {
  res.render('index.md')
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
