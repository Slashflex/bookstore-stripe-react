import React from 'react'
import { Link } from 'react-router-dom'

class Success extends React.Component {
  render() {
    return (
      <>
        <h1>Payment made successfully</h1>
        <Link to="/" className="button">Go back to the store</Link>
      </>
    )
  }
}

export default Success
