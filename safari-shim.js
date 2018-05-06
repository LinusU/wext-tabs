function handleMessage (ev) {
  const name = ev.name
  const data = ev.message

  if (name === 'executeScript') {
    const details = data.args[0]

    if (details.code) {
      const returnValue = eval(details.code)
      safari.self.tab.dispatchMessage(data.returnId, { returnValue })
      return
    }
  }
}

document.addEventListener('readystatechange', (ev) => {
  if (document.readyState === 'complete') {
    safari.self.tab.dispatchMessage('readystatechange', 'complete')
  }
})

safari.self.addEventListener("message", handleMessage, false)
