## esbuild

`esbuild.js` will build JavaScript code (`.es6` files in `static/`) using
`esbuild` tool. The final bundle is output to `bundle.js`. 

Hooks have to be used to properly redirect absolute `"st/..."` import paths to `static/js`, as well as process `.es6` files as `jsx`.

Libraries are also bundled, `lib.es6` hack was needed to properly reference them so they end up being bundled properly. `esbuild` hook will redirect all `import ... from "lib"` to `lib.es6`. Yikes.

## Remote ~~debugging~~ logging

See `main.html` - there's an inline script to overwrite `console` methods to
log remotely by POST-ing to `/debug` endpoint, that's listened on in
`listen.js`.

## scss building

There's a `Makefile` in `static/scss` to build `.scss` files using `sass` (installed by npm, defined in `package.json`). The final bundle is created by `cat`-ing all output css files together.

## How to bundle / run

*In progress*

- `node esbuild.js`
- `make -C static/scss`
- `node listen.js`
- visit `localhost:8000` in browser.
