import React from 'react'
import { Link } from 'react-router-dom'

class Failure extends React.Component {
  render() {
    return (
      <>
        <h1>Payment wasn't made</h1>
        <Link to="/" className="button">Go back to the store</Link>
        <Link to="/checkout" className="button">Try to checkout again</Link>
      </>
    )
  }
}

export default Failure
