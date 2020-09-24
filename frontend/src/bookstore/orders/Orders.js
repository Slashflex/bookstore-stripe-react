import React from 'react'

class OrderLines extends React.Component {
  render() {
    const listItems = this.props.content.map(
      ({ id, quantity, unit_price, title }) => (
        <li key={id} className="OrderLines-line">
          <span className="OrderLines-title">{title}</span>
          <span className="OrderLines-price">{quantity} x {unit_price / 100} €</span>
        </li>
      )
    )

    return (<div className="OrderLines"><ul>{listItems}</ul></div>)
  }
}

class Order extends React.Component {
  constructor(props) {
    super(props)
    this.state = { displayDetails: false }
  }

  render() {
    return (
      <div
        className="Order"
        data-state={this.props.order.state}
        onClick={() => this.toggleDetails()}
      >
        <div className="Order-summary">
          <span className="Order-date">
            On {this.createdAt()}
          </span>
          <span className="Order-lines-count">
            {this.props.order.lines.length} book(s)
          </span>
          <span className="Order-total">
            {this.props.order.total_price / 100} €
          </span>
          <span className="Order-state">
            {this.props.order.state}
          </span>
          <span className="Order-total">
            Order ID :{this.props.order.id}
          </span>
        </div>
        { this.state.displayDetails
        ? <OrderLines content={this.props.order.lines} />
        : null}
      </div>
    )
  }

  createdAt() {
    var createdAt = new Date()
    createdAt.setTime(this.props.order.created_at * 1000)
    return createdAt.toUTCString()
  }

  toggleDetails() {
    this.setState({
      displayDetails: !this.state.displayDetails,
    })
  }
}

class Orders extends React.Component {
  render() {
    const listItems = this.props.content.map(
      (order) => (
        <li key={order.id}><Order order={order} /></li>
      )
    )

    return (
      <div className="Orders">
        <h2>Orders</h2>
        <ul>{listItems}</ul>
      </div>
    )
  }
}

export default Orders
