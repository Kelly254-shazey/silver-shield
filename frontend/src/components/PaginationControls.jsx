const PAGE_SIZES = [10, 25, 50, 100];

function getPageItems(currentPage, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= pageCount - 2) {
    pages.add(pageCount - 1);
    pages.add(pageCount - 2);
    pages.add(pageCount - 3);
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  return sorted.reduce((acc, page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) acc.push("ellipsis");
    acc.push(page);
    return acc;
  }, []);
}

function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZES,
  label = "items",
}) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);
  const pageItems = getPageItems(safePage, pageCount);

  return (
    <nav className="pagination-shell" aria-label={`${label} pagination`}>
      <div className="pagination-meta">
        <span className="pagination-count">
          {totalItems === 0 ? "No" : start}–{end}
        </span>
        <span className="pagination-label">of {totalItems} {label}</span>
      </div>

      <div className="pagination-list">
        <button
          type="button"
          className="pagination-button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </button>

        <div className="pagination-pages">
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis" aria-hidden="true">
                ⋯
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pagination-button ${item === safePage ? "pagination-active" : ""}`}
                aria-current={item === safePage ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="pagination-button"
          disabled={safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      <div className="pagination-page-size">
        <label className="pagination-size-label">
          Show
          <select
            className="page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label={`${label} per page`}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          per page
        </label>
      </div>
    </nav>
  );
}

export default PaginationControls;
