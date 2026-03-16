import type { SortOrder } from "../types/books";

type BookControlsProps = {
  pageSize: number;
  sortOrder: SortOrder;
  onPageSizeChange: (pageSize: number) => void;
  onToggleSort: () => void;
};

function BookControls({ pageSize, sortOrder, onPageSizeChange, onToggleSort }: BookControlsProps) {
  return (
    <div className="d-flex gap-2 align-items-end flex-wrap">
      <div>
        <label htmlFor="pageSize" className="form-label mb-1">
          Results per page
        </label>
        <select
          id="pageSize"
          className="form-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      <button className="btn btn-outline-primary" onClick={onToggleSort}>
        Sort Title: {sortOrder === "asc" ? "A-Z" : "Z-A"}
      </button>
    </div>
  );
}

export default BookControls;
