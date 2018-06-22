import React, { Component } from 'react';
import axios from 'axios';

class Dash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
    }
  }
  componentDidMount() {
    axios.get('/auth/user').then(res => {
      this.setState({
        user: res.data
      })
    }).catch(err => this.props.history.push('/'))
  }
  render() {
    return (
      <div className='Dash'>
        {JSON.stringify(this.state.user)}
        <a href={process.env.REACT_APP_LOGOUT}>logout</a>
      </div>
    )
  }
}

export default Dash