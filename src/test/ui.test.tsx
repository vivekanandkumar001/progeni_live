import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App';

function renderAt(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renders the hero headline and search input', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /one platform/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /search tools/i })).toBeInTheDocument();
  });

  it('renders the Progeni logo in the header and footer', () => {
    renderAt('/');
    expect(screen.getAllByRole('link', { name: /progeni home/i }).length).toBeGreaterThanOrEqual(2);
  });

  it('renders featured products from the registry (not hardcoded)', () => {
    renderAt('/');
    // Bench and WaKit appear in Featured AND the All Tools preview.
    expect(screen.getAllByRole('heading', { name: 'Progeni Bench' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('heading', { name: /wakit/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('links products to their live apps with safe external attributes', () => {
    renderAt('/');
    const openLinks = screen.getAllByRole('link', { name: /^open progeni bench$|^open wakit/i });
    expect(openLinks.length).toBeGreaterThanOrEqual(2);
    expect(openLinks.some((a) => a.getAttribute('href')?.includes('bench.progeni.live'))).toBe(true);
    expect(openLinks.some((a) => a.getAttribute('href')?.includes('wakit.progeni.live'))).toBe(true);
    for (const link of openLinks) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('renders category cards with accurate tool counts', () => {
    renderAt('/');
    const communicationCard = screen.getByRole('link', { name: /communication & messaging/i });
    expect(within(communicationCard).getByText(/1 tool/)).toBeInTheDocument();
  });

  it('has accessible navigation landmarks', () => {
    renderAt('/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('does not expose internal/developer terminology to visitors', () => {
    const { container } = renderAt('/');
    const text = container.textContent ?? '';
    for (const jargon of ['subdomain', 'hosting', 'registry', 'canonical', 'slug']) {
      expect(text.toLowerCase()).not.toContain(jargon);
    }
  });
});

describe('ToolsPage', () => {
  it('renders all public tools', () => {
    renderAt('/tools');
    expect(screen.getByRole('heading', { name: 'Progeni Bench' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /wakit/i })).toBeInTheDocument();
  });

  it('filters results when a query is provided via URL', () => {
    renderAt('/tools?q=whatsapp');
    expect(screen.getByRole('heading', { name: /wakit/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Progeni Bench' })).not.toBeInTheDocument();
  });

  it('shows a friendly empty state for zero-result queries', () => {
    renderAt('/tools?q=xyzzyplughnotatool');
    expect(screen.getByRole('heading', { name: /no tools found/i })).toBeInTheDocument();
  });

  it('filters by category via URL parameter', () => {
    renderAt('/tools?category=communication-messaging');
    expect(screen.getByRole('heading', { name: /wakit/i })).toBeInTheDocument();
  });
});

describe('ProductDetailPage', () => {
  it('renders product details for a known slug', () => {
    renderAt('/tools/bench');
    expect(screen.getByRole('heading', { name: 'Progeni Bench' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open progeni bench/i })).toHaveAttribute(
      'href',
      'https://bench.progeni.live/'
    );
  });

  it('renders a friendly not-found message for unknown slugs', () => {
    renderAt('/tools/does-not-exist');
    expect(screen.getByRole('heading', { name: /couldn.t find that page/i })).toBeInTheDocument();
  });
});

describe('CategoryPage', () => {
  it('renders a known category with its tools', () => {
    renderAt('/categories/communication-messaging');
    expect(
      screen.getByRole('heading', { level: 1, name: /communication & messaging/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /wakit/i })).toBeInTheDocument();
  });

  it('renders a not-found page for unknown categories', () => {
    renderAt('/categories/nope');
    expect(screen.getByRole('heading', { name: /couldn.t find that page/i })).toBeInTheDocument();
  });
});

describe('Navigation & routing', () => {
  it('navigates from home to the tools directory via header link', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getAllByRole('link', { name: 'All Tools' })[0]);
    expect(screen.getByRole('heading', { name: 'All Tools', level: 1 })).toBeInTheDocument();
  });

  it('shows search suggestions while typing and navigates on click', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const searchbox = screen.getByRole('combobox', { name: /search tools/i });
    await user.type(searchbox, 'bench');
    const suggestion = await screen.findByRole('option');
    await user.click(within(suggestion).getByRole('button', { name: /progeni bench/i }));
    expect(screen.getByRole('heading', { name: 'Progeni Bench' })).toBeInTheDocument();
  });

  it('supports keyboard navigation through suggestions', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const searchbox = screen.getByRole('combobox', { name: /search tools/i });
    await user.type(searchbox, 'bench');
    await screen.findByRole('option');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Progeni Bench' })).toBeInTheDocument();
  });
});

describe('NotFoundPage', () => {
  it('renders for unknown routes', () => {
    renderAt('/completely/unknown');
    expect(screen.getByRole('heading', { name: /couldn.t find that page/i })).toBeInTheDocument();
  });
});

describe('Legal & info pages', () => {
  it('renders the privacy page', () => {
    renderAt('/privacy');
    expect(screen.getByRole('heading', { level: 1, name: /privacy/i })).toBeInTheDocument();
  });

  it('renders the terms page', () => {
    renderAt('/terms');
    expect(screen.getByRole('heading', { name: /terms of use/i })).toBeInTheDocument();
  });

  it('renders the about page', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { name: /about progeni/i })).toBeInTheDocument();
  });

  it('renders the contact page', () => {
    renderAt('/contact');
    expect(screen.getByRole('heading', { name: /contact & help/i })).toBeInTheDocument();
  });

  it('renders the whats-new page', () => {
    renderAt('/new');
    expect(screen.getByRole('heading', { name: /what.s new/i })).toBeInTheDocument();
  });
});
