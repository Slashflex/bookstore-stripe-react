import React from 'react'
import * as api from '../../Api'

class StockEntry extends React.Component {
  render() {
    return (
      <span className="StockEntry" onClick={this.props.onClick}>
        <span className="StockEntry-title">{this.props.title}</span>
        <span className="StockEntry-count">{this.props.quantity}</span>
      </span>
    )
  }
}

class Stock extends React.Component {
  render() {
    const listItems = this.props.content.map(
      ({ id, isbn, title, quantity, unit_price, currency }) => (
        <li key={id}>
          <StockEntry
            ISBN={isbn}
            title={title}
            quantity={quantity}
            unitPrice={unit_price}
            currency={currency}
            onClick={this.addOneToCart(id)}
          />
        </li>
      )
    )

    return (
      <div className="Stock">
        <h2>Stock</h2>
        <ul>{listItems}</ul>
      </div>
    )
  }

  addOneToCart(stockEntryId) {
    return () => {
      api.addOneToCart(stockEntryId).then(this.props.refreshContents)
    }
  }
}

export default Stock
