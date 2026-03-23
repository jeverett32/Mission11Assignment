import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Book } from "../types/books";
import type { CartItem } from "../types/cart";

type CartContextValue = {
  cart: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "bookstore:cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCartFromSession(): CartItem[] {
  try {
    const savedCart = sessionStorage.getItem(STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsed = JSON.parse(savedCart) as CartItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item?.book?.bookId && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromSession());

  const persist = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
  };

  const addToCart = (book: Book) => {
    const existing = cart.find((item) => item.book.bookId === book.bookId);

    if (existing) {
      persist(
        cart.map((item) =>
          item.book.bookId === book.bookId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      return;
    }

    persist([...cart, { book, quantity: 1 }]);
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      persist(cart.filter((item) => item.book.bookId !== bookId));
      return;
    }

    persist(cart.map((item) => (item.book.bookId === bookId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (bookId: number) => {
    persist(cart.filter((item) => item.book.bookId !== bookId));
  };

  const clearCart = () => {
    persist([]);
  };

  const itemCount = useMemo(
    () => cart.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
    [cart]
  );

  const total = useMemo(
    () => cart.reduce((runningTotal, item) => runningTotal + item.book.price * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, itemCount, total, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
