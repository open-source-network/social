import React, { Component } from 'react';
import './App.css';

import fetch from 'node-fetch';

class App extends Component {
  componentDidMount() {
    
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to Code Communituy</h2>
        </div>
        <p className="App-intro">
          <a href="https://github.com/login/oauth/authorize?scope=user:email&client_id=2a52aa1b0588c80c211d">Log in with Github to begin</a>
        </p>
      </div>
    );
  }
}

export default App;
