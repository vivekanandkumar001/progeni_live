import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from './utils';

describe('Header search overlay', () => {
  it('opens a modal search panel from the header magnifier', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open search/i }));

    const dialog = screen.getByRole('dialog', { name: /search tools/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('combobox', { name: /search tools/i })).toBeInTheDocument();
  });

  it('moves focus into the search field when it opens', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: /open search/i }));
    const input = within(screen.getByRole('dialog')).getByRole('combobox');
    expect(input).toHaveFocus();
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const trigger = screen.getByRole('button', { name: /open search/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: /open search/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(document.querySelector('[aria-hidden="true"].backdrop-blur-sm') as HTMLElement);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('locks page scrolling while open and restores it on close', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: /open search/i }));
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('searches from the overlay without losing the panel', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: /open search/i }));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByRole('combobox', { name: /search tools/i });

    await user.type(input, 'bench');
    const suggestion = await within(dialog).findByRole('option');
    await user.click(within(suggestion).getByRole('button', { name: /progeni bench/i }));

    expect(screen.getByRole('heading', { name: 'Progeni Bench' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

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

  it('shows exactly one search trigger in the header', () => {
    renderAt('/');
    const header = screen.getByRole('banner');
    expect(within(header).queryAllByRole('button', { name: /open search/i })).toHaveLength(1);
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

  it('names the trigger and the search field differently', () => {
    renderAt('/');
    const trigger = screen.getByRole('button', { name: /open search/i });
    const field = screen.getByRole('combobox', { name: /search tools/i });
    expect(trigger).not.toHaveAccessibleName(field.getAttribute('aria-label') ?? '');
  });
});

describe('Duplicate identifiers', () => {
  it('never renders the same DOM id twice', () => {
    renderAt('/');
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every logo mark its own gradient id', () => {
    renderAt('/');
    const gradients = Array.from(document.querySelectorAll('linearGradient')).map((g) => g.id);
    expect(gradients.length).toBeGreaterThanOrEqual(2);
    expect(new Set(gradients).size).toBe(gradients.length);
    for (const id of gradients) {
      expect(id).toMatch(/^progeni-logo-gradient-[a-zA-Z0-9_-]+$/);
    }
  });
});
