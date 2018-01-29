import React, {Component} from 'react';

class App extends Component {

  componentDidMount () {
    chrome.runtime.onMessage.addListener(function(request, sender) {
      if (request.action == "getSource") {
        message.innerText = request.source;
      }
    });

    const message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
      file: 'getPagesSource.js'
    }, function() {
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });

  }

  render() {
    return (
      <div>
        <div id="message">Injecting script...</div>
      </div>
    );
  }

  handleChange(event) {
    alert(event.target.value);
  }

}

export default App;
