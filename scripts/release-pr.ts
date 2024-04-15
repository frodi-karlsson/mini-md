import axios from 'axios'

const token = process.env.GITHUB_TOKEN
const owner = 'frodi-karlsson'
const repo = 'mini-md'
const prTitle = 'Release'

const head = 'main'
const base = 'prod'

const githubBaseUrl = 'https://api.github.com'

type PR = {
  title: string
  head: {
    ref: string
  }
  base: {
    ref: string
  }
}

const alreadyHasPr = async () => {
  const res = await axios
    .get(`${githubBaseUrl}/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `token ${token}`
      }
    })
    .catch((err) => {
      console.error('Error fetching PRs', err.response.data)
      process.exit(1)
    })

  return res.data.some(
    (pr: PR) =>
      pr.title === prTitle &&
      pr.head.ref === head &&
      pr.base.ref === base
  )
}

const createPr = async () => {
  await axios
    .post(
      `${githubBaseUrl}/repos/${owner}/${repo}/pulls`,
      {
        title: prTitle,
        head,
        base
      },
      {
        headers: {
          Authorization: `token ${token}`
        }
      }
    )
    .catch((err) => {
      console.error('Error creating PR', err.response.data)
      process.exit(1)
    })
}

const main = async () => {
  if (await alreadyHasPr()) {
    console.log('PR already exists')
    return
  }

  await createPr()
  console.log('PR created')
}

main()
