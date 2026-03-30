import { Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import BooksPage from "./pages/BooksPage";
import AdminBooksPage from "./pages/AdminBooksPage";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/adminbooks" element={<AdminBooksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
