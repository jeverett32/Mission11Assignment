import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartSummary() {
  const { itemCount, total } = useCart();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h6 mb-1">Cart Summary</h2>
            <p className="mb-0 text-secondary">
              {itemCount} item(s) | Total: <span className="fw-semibold">${total.toFixed(2)}</span>
            </p>
          </div>
          <Link className="btn btn-outline-primary" to="/cart" state={{ returnTo }}>
            View Cart
          </Link>
        </div>
      </div>

      <button
        className="btn btn-primary d-md-none position-fixed bottom-0 end-0 m-3"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#mobileCart"
        aria-controls="mobileCart"
      >
        Cart ({itemCount})
      </button>

      <div className="offcanvas offcanvas-end" tabIndex={-1} id="mobileCart" aria-labelledby="mobileCartLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileCartLabel">
            Cart Summary
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p className="mb-3">
            {itemCount} item(s) in cart<br />
            Total: <strong>${total.toFixed(2)}</strong>
          </p>
          <Link className="btn btn-primary w-100" to="/cart" state={{ returnTo }}>
            Go To Cart
          </Link>
        </div>
      </div>
    </>
  );
}

export default CartSummary;
