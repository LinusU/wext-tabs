# Web Extensions polyfill: `tabs`

Web Extensions polyfill for the `browser.tabs.*` API.

The goal with this package is to implmenet a subset of the Web Extensions API that works for Chrome, Firefox, Safari and Edge.

Since this is a subset of the Web Extensions API, not all properties will be abailable. The best way right now is to look in the `index.d.ts` which holds TypeScript definitions of the properties available. The interface specificed in the TypeScript definitions should work on all platforms.

PRs welcome 🚀

## Installation

```sh
npm install --save @wext/tabs
```

## Usage

```js
const tabs = require('@wext/tabs')

tabs.create({ active: true, url: 'https://google.com' }).then((tab) => {
  // A tab with google is now open and focused
})
```

## Implemented methods

| Feature | Chrome | Firefox | Safari | Edge |
| ------- | :----: | :-----: | :----: | :--: |
| `create` | ✅ | ✅ | ✅ | ❌ |
| `executeScript` | ✅ | ✅ | 🐝 | ❌ |
| `remove` | ✅ | ✅ | ✅ | ❌ |
| `update` | ✅ | ✅ | ✅ | ❌ |
| `query` | ✅ | ✅ | ✅ | ❌ |

## Implemented events

| Feature | Chrome | Firefox | Safari | Edge |
| ------- | :----: | :-----: | :----: | :--: |
| `onUpdated` | ✅ | ✅ | 🐝 | ❌ |

## 🐝 Safari support

Since Safari has a significantly different API than all other browsers, some APIs are only implemented as closely as possible.

A small shim is required to be loaded for the following functionality to work properly:

| Feature | Part |
| ------- | ---- |
| `executeScript` | Entire API |
| `onUpdated` | Updates to the `status` property |

The shim needs to be loaded on _every site_ that you intend to use any of the mentioned APIs. This means that you need to request the `<all_urls>` permission to run `executeScript` on the currently focused page, something that isn't needed in the other browsers.

The source is in the file `safari-shim.js`, it should be loaded as a content script that runs at the start of every page.

Here is an example on how to include it with WebPack:

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WextManifestWebpackPlugin = require('@wext/manifest/webpack')

// ...

module.exports = {
  // ...

  plugins: [
    new CopyWebpackPlugin([
      { from: require.resolve('@wext/tabs/safari-shim'), to: 'safari-shim.js' }
    ]),

    new WextManifestWebpackPlugin('safari', {
      // ...

      content_scripts: [{
        matches: ['*://*/*'],
        run_at: 'document_start',
        js: ['safari-shim.js']
      }]
    })
  ]
}
```
