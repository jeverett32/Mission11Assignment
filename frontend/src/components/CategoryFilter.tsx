type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="accordion" id="categoryAccordion">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#categoryCollapse"
            aria-expanded="true"
            aria-controls="categoryCollapse"
          >
            Categories
          </button>
        </h2>
        <div
          id="categoryCollapse"
          className="accordion-collapse collapse show"
          data-bs-parent="#categoryAccordion"
        >
          <div className="accordion-body">
            <div className="list-group">
              <button
                type="button"
                className={`list-group-item list-group-item-action ${selectedCategory === "" ? "active" : ""}`}
                onClick={() => onCategoryChange("")}
              >
                All Categories
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`list-group-item list-group-item-action ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryFilter;
