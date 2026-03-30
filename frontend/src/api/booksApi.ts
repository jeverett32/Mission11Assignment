import type { Book, BookPageResponse, SortOrder } from "../types/books";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://bookstore-a2d9eva0e0ayfac9.westus2-01.azurewebsites.net/api/Books";

export async function fetchBooksPage(options: {
  page: number;
  pageSize: number;
  sortOrder: SortOrder;
  category?: string | null;
}): Promise<BookPageResponse> {
  const params = new URLSearchParams({
    page: String(options.page),
    pageSize: String(options.pageSize),
    sortOrder: options.sortOrder,
  });

  if (options.category) {
    params.set("category", options.category);
  }

  const response = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch books (status ${response.status})`);
  }

  return (await response.json()) as BookPageResponse;
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/books/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories (status ${response.status})`);
  }

  return (await response.json()) as string[];
}

export async function createBook(book: Omit<Book, "bookId">): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`Failed to create book (status ${response.status})`);
  }

  return (await response.json()) as Book;
}

export async function updateBook(book: Book): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${book.bookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`Failed to update book (status ${response.status})`);
  }
}

export async function deleteBook(bookId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete book (status ${response.status})`);
  }
}

