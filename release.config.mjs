import pkg from './package.json' with { type: 'json' }

const includeChangelog = process.env.SEM_CHANGES === '1'

export default {
  branches: ['main'],
  repositoryUrl: pkg.repository.url,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    // 仅在最终 changelog job 中加入下面两个插件
    ...(includeChangelog
      ? [
          ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
          [
            '@semantic-release/git',
            {
              assets: ['package.json', 'CHANGELOG.md', '**/package.json'],
              message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
          ]
        ]
      : [
          ['@semantic-release/npm', { npmPublish: true, pkgRoot: '.', tarballDir: 'dist' }],
          '@semantic-release/github'
        ])
  ],
  tagFormat: '${version}'
}