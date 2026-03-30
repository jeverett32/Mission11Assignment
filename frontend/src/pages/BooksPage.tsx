import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import BookControls from "../components/BookControls";
import BooksTable from "../components/BooksTable";
import CartSummary from "../components/CartSummary";
import CategoryFilter from "../components/CategoryFilter";
import PaginationControls from "../components/PaginationControls";
import { useCart } from "../context/CartContext";
import type { Book, BookPageResponse, SortOrder } from "../types/books";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://bookstore-a2d9eva0e0ayfac9.westus2-01.azurewebsites.net/api/Books";

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSortOrder(value: string | null): SortOrder {
  return value === "desc" ? "desc" : "asc";
}

function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();

  const currentPage = parseNumber(searchParams.get("page"), 1);
  const pageSize = parseNumber(searchParams.get("pageSize"), 5);
  const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
  const selectedCategory = searchParams.get("category") ?? "";

  const setParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams);
  };

  useEffect(() => {
    sessionStorage.setItem("bookstore:lastBrowse", `${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: string[] = await response.json();
        setCategories(data);
      } catch {
        // Ignore categories load errors and keep app usable.
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, []);

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

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

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

        if (data.totalPages > 0 && currentPage > data.totalPages) {
          setParams({ page: String(data.totalPages) });
        }
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
  }, [currentPage, pageSize, selectedCategory, sortOrder]);

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
      <CartSummary />

      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          {/* TA note: #notcoveredinthevideos Bootstrap attribute #1 is data-bs-toggle="collapse" in CategoryFilter. */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) =>
              setParams({
                category: category || null,
                page: "1",
              })
            }
          />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
            <div>
              <h1 className="h3 mb-1">Online Bookstore</h1>
              <p className="text-secondary mb-0">{pageLabel}</p>
            </div>

            <BookControls
              pageSize={pageSize}
              sortOrder={sortOrder}
              onPageSizeChange={(newPageSize) =>
                setParams({
                  pageSize: String(newPageSize),
                  page: "1",
                })
              }
              onToggleSort={() =>
                setParams({
                  sortOrder: sortOrder === "asc" ? "desc" : "asc",
                  page: "1",
                })
              }
            />
          </div>

          {isLoading ? <div className="alert alert-info">Loading books...</div> : null}
          {error ? <div className="alert alert-danger">{error}</div> : null}

          {!isLoading && !error ? (
            <BooksTable
              books={books}
              onAddToCart={(book) => {
                addToCart(book);
              }}
            />
          ) : null}

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoading}
            onPrevious={() => setParams({ page: String(Math.max(1, currentPage - 1)) })}
            onNext={() => setParams({ page: String(Math.min(totalPages, currentPage + 1)) })}
          />
        </div>
      </div>
    </div>
  );
}

export default BooksPage;
