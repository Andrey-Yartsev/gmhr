import React, {Component} from 'react';
import DdpClient from '../../utils/DdpClient'

class App extends Component {

  constructor (props) {
    super(props)
    this.tabId = null
    this.state = {
      message: '...'
    }
    this.currentGameIndex = -1
    this.games = []
    this.ddpClient = new DdpClient({
      onReceive: (games) => {
        this.games = games
        this.log(`received ${games.length} games`)
        this.processNextGame()
      }
    })
    this.libInjected = false
  }

  log (message) {
    this.setState({
      message: this.state.message + '\n' + message
    })
  }

  componentDidMount () {
    this.initExtention()
    this.ddpClient.run()
  }

  injectScript (tabId, file, cb) {
    this.log(`injecting script ${file}`)
    chrome.tabs.executeScript(tabId, {
      file
    }, () => {
      if (chrome.runtime.lastError) {
        this.log('There was an error injecting script : \n' + chrome.runtime.lastError.message)
        return
      }
      this.log(`${file} injected`)
      if (cb) cb()
    })
  }

  get isExtention () {
    return chrome.runtime && chrome.runtime.onMessage
  }

  initExtention () {
    if (!this.isExtention) {
      return
    }

    chrome.runtime.onMessage.addListener((request, sender) => {
      this.log(`action from injection: ` + request.action)

      if (request.action === 'scoresParsed') {
        this.log(`updating scores ${this.game._id} ` + request.scores[0] + ' - ' + request.scores[1])
        this.ddpClient.updateScores(this.game._id, request.scores, (err, result) => {
          if (err) {
            this.log(JSON.stringify(err))
            return
          }
          this.log('scores updated')
          this.processNextGame()
        })
      }
    })
  }

  processNextGame () {
    if (!this.games[this.currentGameIndex + 1]) {
      this.log('all games processed')
      return
    }
    this.currentGameIndex++
    this.log('processNextGame #' + (this.currentGameIndex + 1))
    this.processGame()
  }

  processGame () {
    this.game = this.games[this.currentGameIndex]
    this.processCurrentUrl()
  }

  processCurrentUrl () {
    if (!this.isExtention) {
      return
    }
    const url = this.game.googleLink

    this.log(`open tab with ${url}`)

    chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
      if (this.tabId !== tabId) return
      if (!info.status || info.status !== 'complete') return

      if (this.injectTimoutId) {
        clearTimeout(this.injectTimoutId)
      }
      this.injectTimoutId = setTimeout(() => {
        if (!this.libInjected) {
          this.injectScript(tabId, 'injectionLib.js', () => {
            this.libInjected = true
          })
        }
        this.injectScript(tabId, 'injection.js')
      }, 100)
    })

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      const tab = tabs[0]
      chrome.tabs.update(tab.id, {url}, (t) => {
        this.tabId = t.id
        this.log('wait til page loaded')
      })
    })
  }

  render() {
    return (
      <div className="container">
        <pre>{this.state.message}</pre>
      </div>
    )
  }

}

export default App;
