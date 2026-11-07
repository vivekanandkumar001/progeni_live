import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderAt } from './utils';

describe('Search control layout', () => {
  it('keeps the input and the buttons side by side instead of overlapping', () => {
    renderAt('/');
    const input = screen.getByRole('combobox', { name: /search tools/i });
    const submit = screen.getByRole('button', { name: 'Search' });

    const control = input.parentElement as HTMLElement;
    const group = submit.parentElement as HTMLElement;

    // Both live inside the same bordered control...
    expect(control).toContainElement(group);
    // ...as siblings, so the field can never sit underneath the buttons.
    expect(group.parentElement).toBe(control);
    // The group is in normal flow, not floating on top of the text.
    expect(group.className).not.toMatch(/\babsolute\b/);
    expect(group.className).toMatch(/shrink-0/);
    // The field flexes, the buttons do not.
    expect(input.className).toMatch(/flex-1/);
    expect(input.className).toMatch(/min-w-0/);
    expect(control.className).toMatch(/\bflex\b/);
  });

  it('lets clicks on the magnifier reach the input', () => {
    renderAt('/');
    const input = screen.getByRole('combobox', { name: /search tools/i });
    const icon = input.parentElement?.querySelector('svg') as SVGElement;
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('class')).toMatch(/pointer-events-none/);
  });

  it('shows exactly one search field in the page content', () => {
    renderAt('/');
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('does not place a search trigger in the header to keep navigation clean', () => {
    renderAt('/');
    const header = screen.getByRole('banner');
    expect(within(header).queryAllByRole('button', { name: /open search/i })).toHaveLength(0);
  });

  it('never gives two buttons the same accessible name', () => {
    renderAt('/');
    const names = Array.from(document.querySelectorAll('button')).map(
      (b) => (b.getAttribute('aria-label') || b.textContent || '').replace(/\s+/g, ' ').trim()
    );
    const meaningful = names.filter(Boolean);
    expect(meaningful.length).toBeGreaterThan(0);
    expect(new Set(meaningful).size).toBe(meaningful.length);
  });
});

describe('Duplicate identifiers', () => {
  it('never renders the same DOM id twice', () => {
    renderAt('/');
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('renders the shared logo asset for every logo mark', () => {
    renderAt('/');
    const logos = Array.from(document.querySelectorAll('img[src="/favicon.svg"]'));
    expect(logos.length).toBeGreaterThanOrEqual(2);
  });
});

