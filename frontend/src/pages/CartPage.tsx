import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

type ReturnState = {
  returnTo?: string;
};

function CartPage() {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const location = useLocation();

  const locationState = (location.state ?? {}) as ReturnState;
  const continueShoppingTarget =
    locationState.returnTo ?? sessionStorage.getItem("bookstore:lastBrowse") ?? "/";

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Your Shopping Cart</h1>
        <Link className="btn btn-outline-secondary" to={continueShoppingTarget}>
          Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="alert alert-info">Your cart is currently empty.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.book.bookId}>
                    <td>
                      <div className="fw-semibold">{item.book.title}</div>
                      <small className="text-secondary">{item.book.author}</small>
                    </td>
                    <td>${item.book.price.toFixed(2)}</td>
                    <td>
                      <div className="btn-group" role="group" aria-label={`Quantity controls for ${item.book.title}`}>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.book.bookId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="btn btn-light disabled">{item.quantity}</span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.book.bookId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>${(item.book.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.book.bookId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 gap-3 flex-wrap">
            <button className="btn btn-outline-danger" onClick={clearCart}>
              Clear Cart
            </button>
            <div className="fs-5">
              Total: <span className="fw-bold">${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
