import async from 'async'

export default class DdpClient {

  constructor ({onReceive}) {
    this.onReceive = onReceive

    const Ddp = require('ddp-client')

    const serverUrl = 'ws://127.0.0.1:3000/websocket'

    this.client = new Ddp({
      url: serverUrl,
      autoReconnect: true,
      autoReconnectTimer: 500,
      maintainCollections: true
    })
  }

  run () {
    this.client.connect(err => {
      if (err) {
        console.error(err)
        return
      }
      async.series([
        this.login.bind(this),
        this.receive.bind(this)
      ], (err, result) => {
        if (err) {
          throw new Error(JSON.encode(err))
        }
        this.onReceive(result[1])
      })
    })
  }

  login (cb) {
    console.log('login as admin')
    this.client.call('login', [
      { user : { email : 'admin@unicorn.uno' }, password : "a131313!" }
    ], function (err, result) {
      if (err) {
        console.error(err)
        return
      }
      cb(null, result)
    })
  }

  receive (cb) {
    console.log('receive')
    this.client.subscribe(
      'games',
      [
        {
          // startsAt: { '$gt': '' }
          googleLink: { $regex: '^http.*' }
        }
      ],
      () => {
        if (!this.client.collections.games) {
          console.error('no games found for now')
          cb(null)
        }
        cb(null,
          Object.entries(this.client.collections.games.items)
            .map(v => v[1])
        )
      }
    )
  }

  updateScores (id, scores, cb) {
    this.client.call
    (
      'games.patch',
      [
        id,
        {
          googleUpdateAt: new Date(),
          leftTeam: {
            score: scores[0],
            corners: 0,
            redCards: 0,
            yellowCards: 0
          },
          rightTeam: {
            score: scores[1],
            corners: 0,
            redCards: 0,
            yellowCards: 0
          }
        }
      ],
      function (err, result) {
        if (err) {
          cb(err)
        }
        cb(null, result)
      }
    )
  }

}