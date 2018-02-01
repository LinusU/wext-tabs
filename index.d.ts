/** The type Tab contains information about a tab. This provides access to information about what content is in the tab, how large the content is, what special states or restrictions are in effect, and so forth. */
export interface Tab {
  /** Whether the tab is active in its window. This may be true even if the tab's window is not currently focused. */
  active: boolean
  /** The URL of the tab's favicon. Only present if the extension has the "tabs" permission. It may also be an empty string if the tab is loading. */
  favIconUrl?: string
  /** The tab's ID. Tab IDs are unique within a browser session. The tab ID may also be set to tabs.TAB_ID_NONE for browser windows that don't host content tabs (for example, devtools windows). */
  id?: number
  /** Whether the tab is in a private browsing window. */
  incognito: boolean
  /** The zero-based index of the tab within its window. */
  index: number
  /** Whether the tab is pinned. */
  pinned: boolean
  /** The current status of the tab */
  status?: 'loading' | 'complete'
  /** The title of the tab. Only present if the extension has the "tabs" permission. */
  title?: string
  /** The URL of the document that the tab is displaying. Only present if the extension has the "tabs" permission. */
  url?: string
  /** The ID of the window that hosts this tab. */
  windowId: number
}

/** Properties to give the new tab. */
export interface CreateProperties {
  /** Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see windows.update). Defaults to true. */
  active?: boolean
  /** The position the tab should take in the window. The provided value will be clamped to between zero and the number of tabs in the window. */
  index?: number
  /** The URL to navigate the tab to initially. Defaults to the New Tab Page. */
  url?: string
  /** The window to create the new tab in. Defaults to the current window. */
  windowId?: number
}

/** Creates a new tab. */
declare function create(createProperties: CreateProperties): Promise<Tab>
export { create }

/** An object describing the script to run. */
export interface ExecuteScriptDetails {
  /** Code to inject, as a text string. */
  code?: string
  /** Path to a file containing the code to inject. Only absolute URLs are supported. */
  file?: string
}

/** Injects JavaScript code into a page. */
declare function executeScript<T = any> (details: ExecuteScriptDetails): Promise<T[]>
declare function executeScript<T = any> (tabId: number | null, details: ExecuteScriptDetails): Promise<T[]>
export { executeScript }

/** Closes one or more tabs. */
declare function remove (tabIds: number | number[]): Promise<void>
export { remove }

/** The set of properties to update for this tab. */
export interface UpdateProperties {
  /** Whether the tab should be active. Does not affect whether the window is focused (see windows.update). */
  active?: boolean
  /** A URL to navigate the tab to. */
  url?: string
}

/** Navigate the tab to a new URL, or modify other properties of the tab. */
declare function update (updateProperties: UpdateProperties): Promise<Tab>
declare function update (tabId: number | null, updateProperties: UpdateProperties): Promise<Tab>
export { update }

/** The query() function will only get tabs whose properties match the properties included here. */
export interface QueryInfo {
  /** Whether the tabs are active in their windows. */
  active?: boolean
  /** Whether the tabs are in the current window. */
  currentWindow?: boolean
  /** The position of the tabs within their windows. */
  index?: number
  /** Whether the tabs are in the last focused window. */
  lastFocusedWindow?: boolean
  /** Whether the tabs have completed loading. */
  status?: 'loading' | 'complete'
  /** Match page titles against a pattern. */
  title?: string
  /** Match tabs against one or more match patterns. Note that fragment identifiers are not matched. */
  url?: string | string[]
  /** The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window. */
  windowId?: number
  /** The type of window the tabs are in. */
  windowType?: 'normal'
}

/** Gets all tabs that have the specified properties, or all tabs if no properties are specified. */
declare function query (queryInfo: QueryInfo): Promise<Tab[]>
export { query }

export interface Event<T extends () => void> {
  addListener (callback: T): void
  hasListener (callback: T): boolean
  removeListener (callback: T): void
}

/** Contains properties for the tab properties that have changed. */
export interface ChangeInfo {
  /** The tab's new audible state. */
  audible?: boolean
  /** Whether the tab is discarded. A discarded tab is one whose content has been unloaded from memory, but is still visible in the tab strip. Its content gets reloaded the next time it's activated. */
  discarded?: boolean
  /** The tab's new favicon URL. */
  favIconUrl?: string
  /** The tab's new pinned state. */
  pinned?: boolean
  /** The status of the tab. */
  status?: 'loading' | 'complete'
  /** The tab's new title. */
  title?: string
  /** The tab's URL if it has changed. */
  url?: string
}

/** Fired when a tab is updated. */
export const onUpdated: Event<(tabId: number, changeInfo: ChangeInfo, tab: Tab) => void>
