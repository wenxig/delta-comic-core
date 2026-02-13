import pkg from './package.json' with { type: 'json' }

export default {
  branches: ['main'],
  repositoryUrl: pkg.repository.url,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
   ['@semantic-release/npm', { npmPublish: true }],
    '@semantic-release/github'
  ],
  tagFormat: '${version}'
}