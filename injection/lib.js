var bop = {}
bop.run = function () {

  console.log('try to run')
  // attempts++

  // var container = window.document.querySelector('.imso_mh__tm-a-sts')
  var container = window.document.querySelector('.imso_mh__ma-sc-cont')
  // imso_mh__sep imso_mh__scr-it imso-light-font


  if (!container) {
    // if (attempts === 5) {
    //   throw new Error('max attempts number has reached. co container ".imso_mh__tm-a-sts" found')
    // }
    console.log('container not found. next attempt after 1 sec')
    return
  }

  // class="imso_mh__l-tm-sc imso_mh__scr-it imso-light-font"

  // clearInterval(intervalId)

  var leftScore = container.querySelector('.imso_mh__l-tm-sc')
  var rightScore = container.querySelector('.imso_mh__r-tm-sc')

  if (!leftScore) {
    throw new Error('left score not found')
  }

  leftScore = leftScore.innerText
  rightScore = rightScore.innerText

  console.log('scores:', [leftScore, rightScore])

  chrome.runtime.sendMessage({
    action: 'scoresParsed',
    scores: [leftScore, rightScore]
  })
}
