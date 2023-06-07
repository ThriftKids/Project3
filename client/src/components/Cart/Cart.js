
import React, { useEffect } from 'react'
import './Cart.css'
import CartCard from './Card'
import one from "../images/one.jpg";
import testImage from "../images/testImage.jpg";
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery } from '@apollo/client';
import { useStoreContext } from '../../utils/GlobalState';
import { QUERY_CHECKOUT } from '../../utils/queries';
import { idbPromise } from '../../utils/helpers';
import { ADD_MULTIPLE_TO_CART } from '../../utils/actions';
import { v4 as uuidv4 } from 'uuid';

const stripePromise = loadStripe('pk_test_51NDyqbLqFdFAiVSCxI8bLlgSQlitxKVUwsigIH88RBslnH6uOD3Xbngk6xeK2F9ZD7kW4KSJKplWZaeLlLeesOBt00F9uUclmB');

const Cart = (props) => {
 

  const [state, dispatch] = useStoreContext();
  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);

  // We check to see if there is a data object that exists, if so this means that a checkout session was returned from the backend
  // Then we should redirect to the checkout with a reference to our session id
  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

   // If the cart's length or if the dispatch function is updated, check to see if the cart is empty.
  // If so, invoke the getCart method and populate the cart with the existing from the session
  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise('cart', 'get');
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    }

    if (!state.cart.length) {
      getCart();
    }
  }, [state.cart.length, dispatch]);

  // When the submit checkout method is invoked, loop through each item in the cart
  // Add each item id to the productIds array and then invoke the getCheckout query passing an object containing the id for all our products
  function submitCheckout() {
    const productIds = [];

    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });

    getCheckout({
      variables: { products: productIds },
    });
  }
  if (!props.show) {
    return null;
   }

  return (
    <div className={`modal`} onClick={props.onClose}>
      <div className={`cartContent`} onClick={(e) => e.stopPropagation()}>
        <div className="closeCartButtonContainer">
        <button onClick={props.onClose} className="closeCartButton">
        <i className="fa-solid fa-square-xmark fa-xl"></i>
        </button>
        </div>
        <h2 className="shoppingCartTitle">Your Shopping Cart</h2>
        <div className='column cardContainer'>
            {state.cart.map((product) => (
              <CartCard
                key={uuidv4()}
                id={product._id}
                title={product.title}
                price={`$${product.price}`}
                img={product.image}
                desc={product.desc}
                product = {product}
              />
            ))}
        </div>
        <div className="cartFooterContainer">
          <p>Total: $100</p>
          <button className="purchaseCartButton" onClick={submitCheckout}>Purchase</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
