/* globals browser chrome safari */

const hasBrowserGlobal = (typeof browser === 'object')
const hasSafariGlobal = (typeof safari === 'object')

function getSafariTab (tabId) {
  return (tabId === null ? safari.application.activeBrowserWindow.activeTab : tabId)
}

let nextReturnId = 0
function runSafariShim (tabId, name, ...args) {
  return new Promise((resolve, reject) => {
    try {
      const tab = getSafariTab(tabId)
      const returnId = 'return-' + (++nextReturnId)

      tab.addEventListener('message', function listener (ev) {
        if (ev.name !== returnId) return

        resolve(ev.message.returnValue)
        tab.removeEventListener('message', listener)
      })

      tab.page.dispatchMessage(name, { args, returnId })
    } catch (err) {
      reject(err)
    }
  })
}

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
  // Firefox
  if (hasBrowserGlobal) {
    return browser.tabs.create(createProperties).then(mapTab)
  }

  // Safari
  if (hasSafariGlobal) {
    const visibility = (createProperties.active === false ? 'background' : 'foreground')
    const tab = safari.application.activeBrowserWindow.openTab(visibility, createProperties.index)

    if (createProperties.url) tab.url = createProperties.url

    return {
      active: (tab.browserWindow.activeTab === tab),
      id: tab,
      incognito: tab.private,
      index: tab.browserWindow.tabs.indexOf(tab),
      pinned: false,
      status: (createProperties.url ? 'loading' : 'complete'),
      url: tab.url,
      windowId: tab.browserWindow
    }
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

  // Firefox
  if (hasBrowserGlobal) {
    return browser.tabs.executeScript(tabId, details)
  }

  // Safari
  if (hasSafariGlobal) {
    return runSafariShim(tabId, 'executeScript', details).then((value) => [value])
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.executeScript(tabId, details, cb))
}

exports.remove = function (tabIds) {
  // Firefox
  if (hasBrowserGlobal) {
    return browser.tabs.remove(tabIds)
  }

  // Safari
  if (hasSafariGlobal) {
    [].concat(tabIds).map(id => getSafariTab(id)).forEach(tab => tab.close())
    return Promise.resolve()
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.remove(tabIds, cb))
}

exports.update = function (tabId, updateProperties) {
  if (arguments.length === 1) {
    updateProperties = tabId
    tabId = null
  }

  // Firefox
  if (hasBrowserGlobal) {
    return browser.tabs.update(tabId, updateProperties).then(mapTab)
  }

  // Safari
  if (hasSafariGlobal) {
    const tab = getSafariTab(tabId)

    if (updateProperties.active) tab.activate()
    if (updateProperties.url) tab.url = updateProperties.url

    return Promise.resolve()
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.update(tabId, updateProperties, cb)).then(mapTab)
}

exports.query = function (queryInfo) {
  // Firefox
  if (hasBrowserGlobal) {
    return browser.tabs.query(queryInfo).then(mapTabs)
  }

  // Safari
  if (hasSafariGlobal) {
    if (queryInfo.active && queryInfo.currentWindow) {
      const tab = getSafariTab(null)

      const result = {
        active: true,
        id: tab,
        incognito: tab.private,
        index: tab.browserWindow.tabs.indexOf(tab),
        pinned: false,
        status: 'complete',
        url: tab.url,
        windowId: tab.browserWindow
      }

      return Promise.resolve([result])
    }
  }

  // Chrome
  return promisifyChromeCall(cb => chrome.tabs.query(queryInfo, cb)).then(mapTabs)
}

if (hasSafariGlobal) {
  const listeners = new Set()

  safari.application.addEventListener('message', (ev) => {
    if (ev.name === 'readystatechange' && ev.message === 'complete') {
      listeners.forEach(fn => fn(ev.target, { status: 'complete' }))
    }
  })

  exports.onUpdated = {
    addListener (fn) { listeners.add(fn) },
    hasListener (fn) { listeners.has(fn) },
    removeListener (fn) { listeners.delete(fn) }
  }
} else {
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
}
