interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export default function CategoryFilter({ value, onChange, categories }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filtrar por categoría"
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-56"
    >
      <option value="">Todas</option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
