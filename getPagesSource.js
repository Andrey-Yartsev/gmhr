chrome.runtime.sendMessage({
  action: "getSource",
  source: window.document.getElementsByTagName('body')[0].innerHTML
});
