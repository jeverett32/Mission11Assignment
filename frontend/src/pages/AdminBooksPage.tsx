import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createBook, deleteBook, fetchBooksPage, updateBook } from "../api/booksApi";
import BookForm, { type BookFormValues } from "../components/BookForm";
import PaginationControls from "../components/PaginationControls";
import type { Book, SortOrder } from "../types/books";

const DEFAULT_PAGE_SIZE = 10;

const emptyValues: BookFormValues = {
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  classification: "",
  category: "",
  pageCount: 1,
  price: 0,
};

function AdminBooksPage() {
  const location = useLocation();
  const returnTo = useMemo(() => {
    const lastBrowse = sessionStorage.getItem("bookstore:lastBrowse") ?? "/";
    return lastBrowse === "/adminbooks" ? "/" : lastBrowse;
  }, []);

  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("bookstore:lastBrowse", `${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchBooksPage({ page, pageSize, sortOrder })
      .then((data) => {
        if (!isMounted) return;
        setBooks(data.books);
        setTotalPages(data.totalPages);

        if (data.totalPages > 0 && page > data.totalPages) {
          setPage(data.totalPages);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Could not load books. Make sure backend is running.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, sortOrder]);

  const refreshPage = async () => {
    const data = await fetchBooksPage({ page, pageSize, sortOrder });
    setBooks(data.books);
    setTotalPages(data.totalPages);
  };

  const handleDelete = async (bookId: number) => {
    const confirmDelete = window.confirm("Delete this book?");
    if (!confirmDelete) return;

    try {
      await deleteBook(bookId);
      await refreshPage();
    } catch {
      alert("Failed to delete book. Please try again.");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-0">Admin Books</h1>
          <div className="text-secondary">Add, edit, and delete books in the database.</div>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to={returnTo}>
            Back
          </Link>
          <button className="btn btn-success" onClick={() => setShowCreate(true)} disabled={isSaving}>
            Add Book
          </button>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap align-items-end mb-3">
        <div>
          <label className="form-label mb-1">Page size</label>
          <select
            className="form-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            disabled={isLoading || isSaving}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
            setPage(1);
          }}
          disabled={isLoading || isSaving}
        >
          Sort Title: {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {isLoading ? <div className="alert alert-info">Loading books...</div> : null}

      {showCreate ? (
        <BookForm
          title="Add a new book"
          submitLabel="Create"
          initialValues={emptyValues}
          isSubmitting={isSaving}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (values) => {
            try {
              setIsSaving(true);
              await createBook(values);
              setShowCreate(false);
              await refreshPage();
            } catch {
              alert("Failed to create book. Please try again.");
            } finally {
              setIsSaving(false);
            }
          }}
        />
      ) : null}

      {editing ? (
        <BookForm
          title={`Edit: ${editing.title}`}
          submitLabel="Save changes"
          initialValues={{
            title: editing.title,
            author: editing.author,
            publisher: editing.publisher,
            isbn: editing.isbn,
            classification: editing.classification,
            category: editing.category,
            pageCount: editing.pageCount,
            price: editing.price,
          }}
          isSubmitting={isSaving}
          onCancel={() => setEditing(null)}
          onSubmit={async (values) => {
            try {
              setIsSaving(true);
              await updateBook({ ...editing, ...values });
              setEditing(null);
              await refreshPage();
            } catch {
              alert("Failed to update book. Please try again.");
            } finally {
              setIsSaving(false);
            }
          }}
        />
      ) : null}

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th style={{ width: 110 }}>Price</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.bookId}>
                <td>{b.bookId}</td>
                <td className="fw-semibold">{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category}</td>
                <td>${b.price.toFixed(2)}</td>
                <td>
                  <div className="d-grid gap-1">
                    <button className="btn btn-sm btn-primary" onClick={() => setEditing(b)} disabled={isSaving}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(b.bookId)}
                      disabled={isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={6}>
                  <div className="text-center text-secondary py-3">No books found.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        isLoading={isLoading || isSaving}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}

export default AdminBooksPage;

