import React from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import * as api from "../Api";
import Cart from "./Cart";

const stripePromise = loadStripe(
  `${process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}`
);

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: [],
    };

    this.doStripeCheckout = this.doStripeCheckout.bind(this)
  }

  componentDidMount() {
    api.initiateOrder().then((content) => {
      this.setState({ content: content });
    });
  }

  componentWillUnmount() {
    console.log("leave checkout");
  }

  async doStripeCheckout () {
    const stripe = await stripePromise;
    // TODO
    api.confirmOrder().then((content) => {
      fetch("http://localhost:4567/confirm/order", {
        method: "POST",
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (session) {
          return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function (result) {
          // If redirectToCheckout fails due to a browser or network
          // error, you should display the localized error message to your
          // customer using error.message.
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
        });
    });
  };

  render() {
    return (
      <>
        <h1>Checkout</h1>
        <Cart content={this.state.content} refreshContents={() => {}} />
        
        {/* <script src="https://js.stripe.com/v3/"></script> */}
        <button onClick={this.doStripeCheckout}>Proceed to payment</button>
        <hr />
        <Link to="/" className="button">
          Go back to the store
        </Link>
      </>
    );
  }
}

export default Checkout;
