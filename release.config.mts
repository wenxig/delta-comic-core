import { GlobalConfig } from 'semantic-release'

import pkg from './package.json' with { type: 'json' }

export default {
  branches: ['main'],
  repositoryUrl: pkg.repository.url,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.', // 若你的 package.json 在项目根以外（例如构建产物在 dist），可改为 "dist"
        tarballDir: 'dist' // 可选：把生成的 tgz 写到某目录用于其他用途
      }
    ],
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ],
  tagFormat: '${nextRelease.version}'
} as GlobalConfig