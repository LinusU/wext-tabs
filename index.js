/* globals browser chrome */

const hasBrowserGlobal = (typeof browser === 'object')

function promisifyChromeCall (call) {
  return new Promise((resolve, reject) => {
    call((result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(result)
      }
    })
  })
}

function mapTab (tab) {
  return {
    active: tab.active,
    favIconUrl: tab.favIconUrl,
    id: tab.id,
    incognito: ('incognito' in tab ? tab.incognito : tab.inPrivate),
    index: tab.index,
    pinned: tab.pinned,
    status: tab.status,
    title: tab.title,
    url: tab.url,
    windowId: tab.windowId
  }
}

function mapTabs (tabs) {
  return tabs.map(mapTab)
}

exports.create = function (createProperties) {
  // FireFox
  if (hasBrowserGlobal) {
    return browser.tabs.create(createProperties).then(mapTab)
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.create(createProperties, cb)).then(mapTab)
}

exports.executeScript = function (tabId, details) {
  if (arguments.length === 1) {
    details = tabId
    tabId = null
  }

  if (details && details.file && !details.file.startsWith('/')) {
    throw new Error('The "file" parameter must be an absolut URL')
  }

  // FireFox
  if (hasBrowserGlobal) {
    return browser.tabs.executeScript(tabId, details)
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.executeScript(tabId, details, cb))
}

exports.remove = function (tabIds) {
  // FireFox
  if (hasBrowserGlobal) {
    return browser.tabs.remove(tabIds)
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.remove(tabIds, cb))
}

exports.update = function (tabId, updateProperties) {
  if (arguments.length === 1) {
    updateProperties = tabId
    tabId = null
  }

  // FireFox
  if (hasBrowserGlobal) {
    return browser.tabs.update(tabId, updateProperties).then(mapTab)
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.update(tabId, updateProperties, cb)).then(mapTab)
}

exports.query = function (queryInfo) {
  // FireFox
  if (hasBrowserGlobal) {
    return browser.tabs.query(queryInfo).then(mapTabs)
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.query(queryInfo, cb)).then(mapTabs)
}

exports.onUpdated = {
  addListener (fn) {
    return (hasBrowserGlobal ? browser : chrome).tabs.onUpdated.addListener(fn)
  },
  hasListener (fn) {
    return (hasBrowserGlobal ? browser : chrome).tabs.onUpdated.hasListener(fn)
  },
  removeListener (fn) {
    return (hasBrowserGlobal ? browser : chrome).tabs.onUpdated.removeListener(fn)
  }
}
