import release from 'github-pr-release'

release({
  token: process.env.GITHUB_TOKEN,
  owner: 'frodi-karlsson',
  repo: 'mini-md',
  head: 'prod',
  base: 'main'
})
