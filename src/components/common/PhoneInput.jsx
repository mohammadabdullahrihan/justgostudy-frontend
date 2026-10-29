import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { dialCodes } from '../../constants/dialCodes';
import { flagSvgUrlFor } from '../../constants/countries';

// Minimal phone-number-with-country-code input. No react-phone-number-input
// / libphonenumber-js or equivalent exists in this codebase (checked
// package.json), and no existing component combines a dial-code+flag
// dropdown with a number field, so this is new — built to be reused by any
// future phone field (currently: Register.jsx's founderPhone and
// contactPersonPhone). Value is stored/submitted as a single string
// ("+880 1XXXXXXXXX") so it fits the backend's plain String phone fields
// unchanged.
const DEFAULT_DIAL = dialCodes.find((d) => d.country === 'Bangladesh') || dialCodes[0];

const parseValue = (value) => {
  const match = dialCodes
    .slice()
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((d) => value?.startsWith(d.dial));
  if (match) {
    return { dial: match, number: value.slice(match.dial.length).trim() };
  }
  return { dial: DEFAULT_DIAL, number: value || '' };
};

const PhoneInput = ({ value, onChange, placeholder = 'Phone number', required = false, id }) => {
  const initial = parseValue(value);
  const [dial, setDial] = useState(initial.dial);
  const [number, setNumber] = useState(initial.number);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emit = (nextDial, nextNumber) => {
    onChange(nextNumber ? `${nextDial.dial} ${nextNumber}` : '');
  };

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-white border border-ink-200 hover:border-ink-300 rounded-l-full pl-4 pr-2.5 text-ink-700 text-sm shrink-0"
      >
        <img src={flagSvgUrlFor(dial.country)} alt="" className="w-4 h-4 rounded-full object-cover" />
        <span>{dial.dial}</span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
      </button>
      <input
        id={id}
        type="tel"
        value={number}
        onChange={(e) => {
          setNumber(e.target.value);
          emit(dial, e.target.value);
        }}
        className="flex-1 min-w-0 bg-white border border-l-0 border-ink-200 hover:border-ink-300 focus:border-primary-500 rounded-r-full pl-3 pr-5 py-4 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-primary-500/15 transition-all outline-none text-base"
        placeholder={placeholder}
        required={required}
      />

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-white border border-ink-200 rounded-2xl shadow-theme-lg p-1.5">
          {dialCodes.map((d) => (
            <button
              key={`${d.country}-${d.dial}`}
              type="button"
              onClick={() => {
                setDial(d);
                setOpen(false);
                emit(d, number);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-700 hover:bg-cream-50 text-left"
            >
              <img src={flagSvgUrlFor(d.country)} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              <span className="truncate flex-1">{d.country}</span>
              <span className="text-ink-400 shrink-0">{d.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
