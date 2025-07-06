import type { Category } from "@/types/category";
import { capitalizeFirst } from "@/helpers/capitalizeFirst";

type PropTypes = {
  categories: Category[] | undefined;
  selectedCategory: Category;
  categoryError: boolean;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const SelectCategoryDropdown = ({
  categories,
  selectedCategory,
  handleSelectChange,
  categoryError
}: PropTypes) => {
  return (
    <section className="flex justify-between items-center">
      <label htmlFor="category">Choose category</label>
      <select
        name="category"
        className={`border border-1 p-2 rounded-md text-sm ${
          selectedCategory.name === "Category" ? "text-gray-700" : ""
        } ${categoryError ? "border-red-500" : ""}`}
        value={selectedCategory.id}
        onChange={handleSelectChange}
      >
        <option value={-1} className="text-sm">
          Category
        </option>
        {categories &&
          categories.map((value, _) => (
            <option key={value.id} value={value.id} className="text-sm">
              {capitalizeFirst(value.name)}
            </option>
          ))}
      </select>
    </section>
  );
};

export default SelectCategoryDropdown;
