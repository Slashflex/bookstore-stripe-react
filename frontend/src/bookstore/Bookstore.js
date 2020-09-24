import React from 'react'
import * as api from '../Api'
import Cart from './cart/Cart'
import Orders from './orders/Orders'
import Stock from './stock/Stock'

class Bookstore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cartContent: [],
      stockContent: [],
      ordersContent: [],
    }
  }

  componentDidMount() {
    this.refreshContents()
  }

  render() {
    return (
      <div className="Bookstore">
        <Cart
          content={this.state.cartContent}
          refreshContents={() => { this.refreshContents() }}
        />
        <hr />
        <Stock
          content={this.state.stockContent}
          refreshContents={() => { this.refreshContents() }}
        />
        <hr />
        <Orders content={this.state.ordersContent} />
      </div>
    )
  }

  refreshContents() {
    api.cart().then((cartContent) => {
      this.setState({ cartContent: cartContent })
    })
    api.stock().then((stockContent) => {
      this.setState({ stockContent: stockContent })
    })
    api.orders().then((ordersContent) => {
      this.setState({ ordersContent: ordersContent })
    })
  }
}

export default Bookstore
