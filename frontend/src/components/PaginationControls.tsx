type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function PaginationControls({
  currentPage,
  totalPages,
  isLoading,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3 gap-2 flex-wrap">
      <button className="btn btn-secondary" disabled={currentPage <= 1 || isLoading} onClick={onPrevious}>
        Previous
      </button>

      <span className="fw-semibold">
        Page {currentPage} of {Math.max(totalPages, 1)}
      </span>

      <button
        className="btn btn-secondary"
        disabled={currentPage >= totalPages || isLoading || totalPages === 0}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;
