import React from 'react';

let Auth = props => {
  return (
    <div className='Auth'>
      <a href={process.env.REACT_APP_LOGIN}>login</a>
    </div>
  )
}

export default Auth;