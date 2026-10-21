import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { Logo } from '../Logo';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/tools', label: 'All Tools', end: false },
  { to: '/new', label: 'New', end: false },
  { to: '/about', label: 'About', end: false },
];

const Header: React.FC<HeaderProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/tools"
            className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-700 md:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white md:hidden"
        >
          <div className="page-container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/tools"
              className="mt-1 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search tools
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
