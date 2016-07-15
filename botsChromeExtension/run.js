chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('hello');
  console.log(tab);
  console.log(window);
  // chrome.tabs.executeScript(tab.id, {
  //   code: 'console.log("hello mayne")'
  // })
});
chrome.browserAction.onClicked.removeListener();