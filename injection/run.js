if (bop) {
  chrome.runtime.sendMessage({
    action: 'bop exists'
  })
  setTimeout(bop.run, 2000)
} else {
  chrome.runtime.sendMessage({
    action: 'bop does not exists'
  })
}