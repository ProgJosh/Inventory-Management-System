// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { InventoryProvider } from '../context/InventoryContext';

const renderApp = () => render(<BrowserRouter><InventoryProvider><App /></InventoryProvider></BrowserRouter>);

describe('StockPilot UI workflows', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, '', '/login'); });
  afterEach(cleanup);

  it('shows the public landing page and links visitors to the live workspace', async () => {
    window.history.replaceState({}, '', '/');
    renderApp();
    expect(await screen.findByRole('heading', { name: /know what you have/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore the live demo/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /create a workspace/i })).toHaveAttribute('href', '/register');
  });

  it('logs in as Admin, navigates to products, and searches by SKU', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Sign in to your workspace' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^admin/i }));
    await user.type(screen.getByLabelText('Email address'), 'admin@ims.io');
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('heading', { name: /good (morning|afternoon|evening), josh/i })).toBeInTheDocument();
    expect(sessionStorage.getItem('stockpilot_session_v1')).not.toBeNull();
    expect(localStorage.getItem('stockpilot_session_v1')).toBeNull();
    await user.click(screen.getByRole('link', { name: /^products/i }));
    expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument();
    const search = screen.getByRole('textbox', { name: /search product, sku, or barcode/i });
    await user.type(search, 'ELE-MON-027');
    expect(await screen.findByText('ViewEdge 27” 4K Monitor')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('ErgoFlex Mesh Chair')).not.toBeInTheDocument());
  });

  it('enforces Staff read-only catalog navigation', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Sign in to your workspace' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Email address'), 'staff@ims.io');
    await user.type(screen.getByLabelText('Password'), 'staff123');
    await user.click(screen.getByLabelText('Keep me signed in'));
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('heading', { name: /good (morning|afternoon|evening), josh/i })).toBeInTheDocument();
    expect(localStorage.getItem('stockpilot_session_v1')).not.toBeNull();
    expect(screen.queryByRole('link', { name: /audit log/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /^products/i }));
    expect(await screen.findByText('View-only catalog access')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add product/i })).not.toBeInTheDocument();
  });
});
