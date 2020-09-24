import React from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../Api'

class CartEntry extends React.Component {
  render() {
    return (
      <span className="CartEntry" onClick={this.props.onClick}>
        <span className="CartEntry-title">{this.props.title}</span>
        <span className="CartEntry-count">{this.props.quantity}</span>
      </span>
    )
  }
}

class Cart extends React.Component {
  render() {
    const listItems = this.props.content.map(
      ({ id, isbn, title, quantity, unit_price, currency }) => (
        <li key={id}>
          <CartEntry
            ISBN={isbn}
            title={title}
            quantity={quantity}
            unitPrice={unit_price}
            currency={currency}
            onClick={this.removeOneFromCart(id)}
          />
        </li>
      )
    )

    return (
      <div className="Cart">
        <h2>Cart</h2>
        <ul>{listItems}</ul>
        { this.totalAmount() > 0
        ? <>
            <div className="Cart-total">
              Total: {this.totalAmount() / 100} €
            </div>
            <div className="Cart-checkout">
              <Link to="/checkout" className="button">Checkout now!</Link>
            </div>
          </>
        : null
        }
      </div>
    )
  }

  removeOneFromCart(cartEntryId) {
    return () => {
      api.removeOneFromCart(cartEntryId).then(this.props.refreshContents)
    }
  }

  totalAmount() {
    return this.props.content.map(
      ({ quantity, unit_price, currency }) => {
        if (currency !== 'EUR')
          throw new Error('Only EUR are supported for now...')

        return unit_price * quantity
      }
    ).reduce((sum, amount) => sum + amount, 0)
  }
}

export default Cart
