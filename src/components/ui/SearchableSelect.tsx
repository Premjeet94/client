import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check } from "lucide-react";

interface SearchableSelectProps {
  options: { _id: string; cityName: string; officeAddress: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select location...",
  disabled = false,
  className
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt._id === value);

  const filteredOptions = options.filter((opt) =>
    opt.cityName.toLowerCase().includes(search.toLowerCase()) ||
    opt.officeAddress.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-left",
          isOpen && "ring-2 ring-primary/20 border-primary/30"
        )}
      >
        <div className="truncate flex-1">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 capitalize">{selectedOption.cityName}</span>
              <span className="text-slate-400 text-xs hidden sm:inline truncate">— {selectedOption.officeAddress}</span>
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[300px] sm:min-w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              className="h-10 w-full rounded-xl border-none bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="Search city or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt._id}
                  type="button"
                  onClick={() => {
                    onValueChange(opt._id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 group",
                    value === opt._id ? "bg-primary/5 text-primary" : "text-slate-700"
                  )}
                >
                   <div className="flex flex-col text-left truncate pr-4">
                    <span className="font-semibold capitalize">{opt.cityName}</span>
                    <span className="text-[10px] text-slate-400 truncate">{opt.officeAddress}</span>
                  </div>
                  {value === opt._id && <Check className="h-4 w-4 flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-10 text-center text-sm text-slate-400">
                No matching locations found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
