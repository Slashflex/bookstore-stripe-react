import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Bookstore from './bookstore/Bookstore'
import Checkout from './checkout/Checkout'
import SucceededCheckout from './checkout/outcomes/Success'
import FailedCheckout from './checkout/outcomes/Failure'
import './App.css'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/checkout/success">
          <SucceededCheckout />
        </Route>
        <Route path="/checkout/failure">
          <FailedCheckout />
        </Route>
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/">
          <Bookstore />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
