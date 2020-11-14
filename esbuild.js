const sightreadingResolve = {
  name: 'example',
  setup(build) {
    const path = require('path')
    const fs = require('fs')

    // Redirect all paths starting with "st/" to "./static/js/"
    build.onResolve({ filter: /^st\// }, (args) => {
      const p = args.path.split(path.sep).slice(1)
      const ret = { path: path.join(module.path, 'static/js', ...p) + '.es6' }
      return ret
    })

    build.onResolve({ filter: /^lib$/ }, (args) => {
      return { path: module.path + '/static/lib.es6' }
    })

    build.onLoad({ filter: /\.es6$/ }, async (args) => {
      return {
        contents: await fs.promises.readFile(args.path, 'utf8'),
        loader: 'jsx',
      }
    })
  },
}

require('esbuild').build({
  entryPoints: ['static/js/main.es6'],
  platform: 'browser',
  target: 'safari11',
  bundle: true,
  outfile: 'bundle.js',
  plugins: [sightreadingResolve]
}).catch(() => process.exit(1))