import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';
import { searchCatalog } from '../../lib/search';
import { IconRenderer } from '../IconRenderer';

interface SearchBoxProps {
  /** Where to redirect on submit. Query is always synced to ?q= on the given path. */
  submitPath?: string;
  autoFocus?: boolean;
  large?: boolean;
  initialQuery?: string;
  /** Called after the search navigates somewhere — used to dismiss a host panel. */
  onNavigate?: () => void;
}

const POPULAR_SEARCHES = [
  'Avery Labels',
  'WhatsApp Splitter',
  'PDF Translator',
  'AI Interview',
  'Audio Converter',
  'CSV Cleaner',
];

/**
 * Flipkart-style universal search input with soft ice-blue surface,
 * live suggestions, keyboard navigation, clear button, and shareable ?q= URLs.
 */
const SearchBox: React.FC<SearchBoxProps> = ({
  submitPath = '/tools',
  autoFocus = false,
  large = false,
  initialQuery = '',
  onNavigate,
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
      onNavigate?.();
    },
    [navigate, submitPath, onNavigate]
  );

  const goToProduct = useCallback(
    (slug: string) => {
      setShowSuggestions(false);
      navigate(`/tools/${slug}`);
      onNavigate?.();
    },
    [navigate, onNavigate]
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
      goToProduct(suggestions[activeIndex].slug);
    }
  };

  const inputSize = large
    ? 'h-14 text-base sm:text-lg'
    : 'h-11 text-sm';
  const buttonSize = large
    ? 'h-10 rounded-xl px-5 text-sm'
    : 'h-8 rounded-lg px-3.5 text-xs';
  const clearSize = large ? 'h-10 w-10' : 'h-8 w-8';
  const clearIconSize = large ? 'h-4 w-4' : 'h-3.5 w-3.5';
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
        {/*
          Flipkart-style search control with signature soft ice-blue surface,
          crisp blue focus state, integrated buttons in normal flow, and
          high-contrast search trigger.
        */}
        <div className="relative flex items-center rounded-xl sm:rounded-2xl border border-slate-200/90 bg-[#f0f5ff] shadow-sm transition-all duration-200 hover:border-blue-400/80 hover:bg-[#e9f0fe] focus-within:border-[#2874f0] focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-[#2874f0]/15">
          <Search
            className={`pointer-events-none absolute ${iconPos} top-1/2 -translate-y-1/2 text-[#2874f0] ${iconClass}`}
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
            placeholder="Search for tools, features, categories and more..."
            className={`min-w-0 flex-1 border-0 bg-transparent pl-12 pr-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden ${inputSize}`}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex shrink-0 items-center gap-1.5 pr-2">
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                className={`flex ${clearSize} items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0]`}
              >
                <X className={clearIconSize} aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-[#2874f0] font-semibold text-white shadow-sm transition-all hover:bg-[#1a62d6] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0] ${buttonSize}`}
            >
              <span className="hidden sm:inline">Search</span>
              <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      {/* Live suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5"
        >
          <div className="border-b border-slate-100 bg-[#f8faff] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Suggested Tools
          </div>
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  index === activeIndex ? 'bg-[#f0f5ff] text-blue-900' : 'hover:bg-[#f0f5ff]/60'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goToProduct(product.slug)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2874f0]">
                    <IconRenderer name={product.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {product.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {product.shortDescription}
                    </span>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 sm:inline-flex">
                  in {product.categoryIds[0]?.replace('cat-', '') || 'Tools'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Flipkart-style Popular Searches when query is empty */}
      {showSuggestions && trimmedQuery.length < MIN_SUGGESTION_LENGTH && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl ring-1 ring-black/5"
        >
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-[#2874f0]" />
            Popular Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  submitSearch(term);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-[#f0f5ff] hover:text-[#2874f0]"
              >
                <Search className="h-3 w-3 text-slate-400" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No matches yet */}
      {showSuggestions &&
        trimmedQuery.length > 0 &&
        trimmedQuery.length >= MIN_SUGGESTION_LENGTH &&
        suggestions.length === 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 shadow-2xl">
            <p>No tools match &ldquo;{trimmedQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => submitSearch(trimmedQuery)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2874f0] hover:underline"
            >
              Search all tools for &ldquo;{trimmedQuery}&rdquo; &rarr;
            </button>
          </div>
        )}
    </div>
  );
};

export default SearchBox;

