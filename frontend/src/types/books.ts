export type Book = {
  bookId: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
};

export type SortOrder = "asc" | "desc";

export type BookPageResponse = {
  books: Book[];
  totalBooks: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  sortOrder: SortOrder;
};
