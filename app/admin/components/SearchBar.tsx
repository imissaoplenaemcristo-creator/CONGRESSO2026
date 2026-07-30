type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-amber-400/20 bg-white/5 py-3 pl-12 pr-4 text-white outline-none transition focus:border-amber-400"
      />
    </div>
  );
}