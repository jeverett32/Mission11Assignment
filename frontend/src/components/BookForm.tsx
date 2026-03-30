import { useMemo, useState } from "react";
import type { Book } from "../types/books";

export type BookFormValues = Omit<Book, "bookId">;

type BookFormProps = {
  title: string;
  submitLabel: string;
  initialValues: BookFormValues;
  isSubmitting: boolean;
  onSubmit: (values: BookFormValues) => void;
  onCancel: () => void;
};

function normalizeText(value: string) {
  return value.trim();
}

function BookForm({
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(initialValues);

  const hasRequiredFields = useMemo(() => {
    return (
      normalizeText(values.title).length > 0 &&
      normalizeText(values.author).length > 0 &&
      normalizeText(values.publisher).length > 0 &&
      normalizeText(values.isbn).length > 0 &&
      normalizeText(values.classification).length > 0 &&
      normalizeText(values.category).length > 0 &&
      Number.isFinite(values.pageCount) &&
      values.pageCount > 0 &&
      Number.isFinite(values.price) &&
      values.price >= 0
    );
  }, [values]);

  return (
    <form
      className="card shadow-sm mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!hasRequiredFields || isSubmitting) return;

        onSubmit({
          ...values,
          title: normalizeText(values.title),
          author: normalizeText(values.author),
          publisher: normalizeText(values.publisher),
          isbn: normalizeText(values.isbn),
          classification: normalizeText(values.classification),
          category: normalizeText(values.category),
        });
      }}
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="fw-semibold">{title}</div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>
          Close
        </button>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label">Author</label>
            <input
              className="form-control"
              value={values.author}
              onChange={(e) => setValues((v) => ({ ...v, author: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label">Publisher</label>
            <input
              className="form-control"
              value={values.publisher}
              onChange={(e) => setValues((v) => ({ ...v, publisher: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label">ISBN</label>
            <input
              className="form-control"
              value={values.isbn}
              onChange={(e) => setValues((v) => ({ ...v, isbn: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-4">
            <label className="form-label">Classification</label>
            <input
              className="form-control"
              value={values.classification}
              onChange={(e) => setValues((v) => ({ ...v, classification: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-4">
            <label className="form-label">Category</label>
            <input
              className="form-control"
              value={values.category}
              onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-2">
            <label className="form-label">Pages</label>
            <input
              className="form-control"
              type="number"
              min={1}
              value={values.pageCount}
              onChange={(e) => setValues((v) => ({ ...v, pageCount: Number(e.target.value) }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="col-12 col-lg-2">
            <label className="form-label">Price</label>
            <input
              className="form-control"
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!hasRequiredFields || isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default BookForm;

