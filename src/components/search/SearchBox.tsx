import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchCatalog } from '../../lib/search';
import { IconRenderer } from '../IconRenderer';

interface SearchBoxProps {
  /** Where to redirect on submit. Query is always synced to ?q= on the given path. */
  submitPath?: string;
  autoFocus?: boolean;
  large?: boolean;
  initialQuery?: string;
}

/**
 * Universal search input with live suggestions, keyboard navigation,
 * a clear button, and shareable ?q= URLs.
 */
const SearchBox: React.FC<SearchBoxProps> = ({
  submitPath = '/tools',
  autoFocus = false,
  large = false,
  initialQuery = '',
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable, DOM-safe ids so the combobox can point at its listbox and the
  // active option. React's useId() output can contain colons, which are not
  // safe to use as CSS selectors, so they are stripped here.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = `progeni-search-${uid}`;
  const listboxId = `${inputId}-listbox`;

  // A single character matches almost every description, so the dropdown would
  // just list the whole catalog. Wait for at least two characters before
  // offering suggestions.
  const MIN_SUGGESTION_LENGTH = 2;
  const trimmedQuery = query.trim();
  const suggestions =
    trimmedQuery.length >= MIN_SUGGESTION_LENGTH
      ? searchCatalog(query, { minQueryLength: MIN_SUGGESTION_LENGTH })
          .slice(0, 5)
          .map((r) => r.product)
      : [];

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      setShowSuggestions(false);
      const target = trimmed
        ? `${submitPath}?q=${encodeURIComponent(trimmed)}`
        : submitPath;
      navigate(target);
    },
    [navigate, submitPath]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
      return;
    }

    if (suggestions.length === 0 || !showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(`/tools/${suggestions[activeIndex].slug}`);
    }
  };

  const inputSize = large
    ? 'h-14 pl-12 pr-28 text-base sm:text-lg rounded-2xl'
    : 'h-11 pl-10 pr-20 text-sm rounded-xl';
  const iconPos = large ? 'left-4' : 'left-3.5';
  const iconClass = large ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
      >
        <div className="relative">
          <Search
            className={`absolute ${iconPos} top-1/2 -translate-y-1/2 text-slate-400 ${iconClass}`}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            autoFocus={autoFocus}
            role="combobox"
            aria-label="Search tools"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 && showSuggestions ? `${listboxId}-option-${activeIndex}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
            placeholder="What would you like to do today?"
            className={`w-full border border-slate-300 bg-white text-slate-900 shadow-sm placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none ${inputSize}`}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      {/* Live suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index === activeIndex ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigate(`/tools/${product.slug}`)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <IconRenderer name={product.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {product.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {product.shortDescription}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* No matches yet */}
      {showSuggestions &&
        trimmedQuery.length > 0 &&
        trimmedQuery.length >= MIN_SUGGESTION_LENGTH &&
        suggestions.length === 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
            No tools match &ldquo;{trimmedQuery}&rdquo;. Press Enter to search anyway.
          </div>
        )}

      {/* Too-short query */}
      {showSuggestions && trimmedQuery.length === 1 && (
        <div
          role="status"
          className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg"
        >
          Keep typing &mdash; suggestions start at {MIN_SUGGESTION_LENGTH} characters.
        </div>
      )}
    </div>
  );
};

export default SearchBox;
