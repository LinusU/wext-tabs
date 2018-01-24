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

    if (details.file) {
      fetch(safari.extension.baseURI + details.file.slice(1))
        .then((res) => res.text())
        .then((src) => {
          const returnValue = eval(src)
          safari.self.tab.dispatchMessage(data.returnId, { returnValue })
        })
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
