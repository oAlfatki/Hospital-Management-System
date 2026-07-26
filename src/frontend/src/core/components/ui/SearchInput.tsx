import { Search } from "lucide-react";
import { cn } from "../../utils/cn";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchInput = ({
  value,
  placeholder,
  onChange,
  className,
}: SearchInputProps) => {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-md
          border
          border-border
          bg-surface-card
          py-2.5
          pl-10
          pr-4
          text-sm
          text-text
          outline-none
          transition-all
          duration-normal
          placeholder:text-text-light
          focus:border-brand
          focus:ring-2
          focus:ring-brand/15
        "
      />
    </div>
  );
}