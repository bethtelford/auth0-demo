import React, { Component } from 'react';
import {HashRouter as Router, Switch, Route} from 'react-router-dom';

import Auth from './Auth';
import Dash from './Dash';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path='/' component={Auth} />
            <Route path='/dashboard' component={Dash} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
