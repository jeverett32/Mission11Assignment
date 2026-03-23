import type { Book } from "./books";

export type CartItem = {
  book: Book;
  quantity: number;
};
