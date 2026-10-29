import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { countryList, flagSvgUrlFor } from '../../constants/countries';

// Multi-select with country flags, built on the existing countryList/
// flagSvgUrlFor single source of truth in constants/countries.js (no new
// country data duplicated here). Used by Register.jsx's "Source Country"
// agent field — intentionally generic/reusable rather than one-off, since
// nothing else in the codebase combines a searchable list with flags and
// multi-select chips (specializedCountries elsewhere is a plain
// comma-separated text input, which doesn't fit "select from ~70 with
// flags").
const CountryMultiSelect = ({ value = [], onChange, placeholder = 'Select countries...' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCountry = (country) => {
    if (value.includes(country)) {
      onChange(value.filter((c) => c !== country));
    } else {
      onChange([...value, country]);
    }
  };

  const filtered = countryList.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setOpen(true)}
        className="w-full min-h-[3.25rem] bg-white border border-ink-200 hover:border-ink-300 focus-within:border-primary-500 rounded-2xl px-3 py-2 flex flex-wrap items-center gap-1.5 cursor-text transition-all"
      >
        {value.length === 0 && (
          <span className="text-ink-400 text-base px-1.5">{placeholder}</span>
        )}
        {value.map((country) => (
          <span
            key={country}
            className="inline-flex items-center gap-1.5 bg-cream-100 border border-ink-200 rounded-full pl-1.5 pr-2 py-1 text-xs font-medium text-ink-700"
          >
            <img src={flagSvgUrlFor(country)} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
            {country}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCountry(country);
              }}
              className="text-ink-400 hover:text-ink-700"
              aria-label={`Remove ${country}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <ChevronDown className="w-4 h-4 text-ink-400 ml-auto shrink-0" />
      </div>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-ink-200 rounded-2xl shadow-theme-lg p-2">
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-cream-50 rounded-xl pl-8 pr-3 py-2 text-sm text-ink-900 placeholder-ink-400 outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-ink-400 text-sm px-3 py-2">No countries found.</p>
            )}
            {filtered.map((country) => {
              const selected = value.includes(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-colors ${
                    selected ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-cream-50'
                  }`}
                >
                  <img src={flagSvgUrlFor(country)} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                  <span className="flex-1 truncate">{country}</span>
                  {selected && <span className="text-xs font-semibold">Selected</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryMultiSelect;
