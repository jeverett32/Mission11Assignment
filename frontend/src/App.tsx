import { useEffect, useMemo, useState } from "react";
import BookControls from "./components/BookControls";
import BooksTable from "./components/BooksTable";
import PaginationControls from "./components/PaginationControls";
import type { Book, BookPageResponse, SortOrder } from "./types/books";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(pageSize),
          sortOrder,
        });

        const response = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: BookPageResponse = await response.json();
        setBooks(data.books);
        setTotalBooks(data.totalBooks);
        setTotalPages(data.totalPages);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setError("Could not load books. Make sure backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();

    return () => {
      controller.abort();
    };
  }, [currentPage, pageSize, sortOrder]);

  const pageLabel = useMemo(() => {
    if (totalBooks === 0) {
      return "No books found";
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalBooks);
    return `Showing ${start}-${end} of ${totalBooks}`;
  }, [currentPage, pageSize, totalBooks]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Online Bookstore</h1>
          <p className="text-secondary mb-0">{pageLabel}</p>
        </div>

        <BookControls
          pageSize={pageSize}
          sortOrder={sortOrder}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
          onToggleSort={() => {
            setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
            setCurrentPage(1);
          }}
        />
      </div>

      {isLoading ? <div className="alert alert-info">Loading books...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {!isLoading && !error ? <BooksTable books={books} /> : null}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        onPrevious={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
        onNext={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
      />
    </div>
  );
}

export default App;
