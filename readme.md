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
| `create` | ✅ | ✅ | ❌ | ❌ |
| `executeScript` | ✅ | ✅ | ❌ | ❌ |
| `remove` | ✅ | ✅ | ❌ | ❌ |
| `update` | ✅ | ✅ | ❌ | ❌ |
| `query` | ✅ | ✅ | ❌ | ❌ |

## Implemented events

| Feature | Chrome | Firefox | Safari | Edge |
| ------- | :----: | :-----: | :----: | :--: |
| `onUpdated` | ✅ | ✅ | ❌ | ❌ |
