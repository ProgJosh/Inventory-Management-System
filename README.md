# Inventory Management System

StockPilot is a responsive, local-first inventory management application for small and medium-sized teams. It includes a role-aware workspace, product catalog, stock operations, suppliers, categories, reporting, exports, inventory alerts, and a complete audit trail.

## Initial local accounts

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Admin | `admin@ims.io` | `admin123` | Full workspace, including audit log and demo reset |
| Manager | `manager@ims.io` | `manager123` | Catalog, supplier, category, stock, and report management |
| Staff | `staff@ims.io` | `staff123` | Dashboard, read-only catalog, stock transactions, and reports |

For security, these accounts are not displayed or prefilled on the login screen. Sign in as Admin to create additional accounts and assign Admin, Manager, or Staff access from **Users & roles**.

Local-mode registration can create an active **Admin**, **Manager**, or **Staff** account, and login requires the matching role selection. Public Admin/Manager registration is provided for demonstration only; production deployments should require administrator approval. The **Keep me signed in** option uses persistent browser storage; when it is cleared, the session lasts only for the current browser session. Password recovery uses a six-digit, ten-minute verification code displayed in the UI while the project is running in local mode. Connect the same service methods to email delivery when a backend is introduced.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Test and build

```bash
# Run workflow and business-rule tests
npm test

# Type-check and create the production bundle
npm run build

# Preview the production bundle locally
npm run preview
```

The automated suite covers authentication, role permissions, product creation, duplicate SKU protection, stock-in, stock-out, negative stock prevention, search, filters, sorting, and stock alerts.

## Deployment

The production output is written to `dist/`. Deploy that folder to any static host such as Netlify, Vercel, Cloudflare Pages, Azure Static Web Apps, or an Nginx server. Configure the host to send unknown routes to `index.html` so client-side routing works after a refresh.

Example build settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20.19` or newer

## Architecture

```text
src/
├── components/
│   ├── layout/       # Responsive application shell
│   └── ui/           # Reusable buttons, cards, forms, dialogs, tables, toasts
├── context/          # Authentication and inventory state orchestration
├── data/             # Realistic demo seed data
├── lib/              # Formatting, filtering, CSV export, stock status helpers
├── pages/            # Complete feature routes
├── services/         # Replaceable local/mock API and business rules
├── test/             # Main workflow tests
└── types/            # Shared TypeScript domain models
```

All mutations go through `InventoryService`, so a real backend can replace browser storage without rewriting the UI. Local data is persisted under `stockpilot_inventory_v1` in `localStorage`. An Admin can restore the seed dataset from **Audit log → Reset demo data**.

## Reports and exports

The Reports screen includes current inventory, stock movement, and low-stock reports. **Export CSV** downloads the selected report. **Print / PDF** opens the browser print dialog; choose “Save as PDF” for a clean PDF export.

## Production security note

This repository intentionally uses a local mock service because no backend credentials were provided. It demonstrates guarded routes and role-based capabilities, but frontend-only credentials are not appropriate for production authentication. Before handling real business data, connect the service layer to a server that provides:

- Password hashing and server-side sessions or short-lived tokens
- Authorization checks on every mutation
- A transactional database for atomic stock updates
- Append-only audit retention and backups
- Rate limiting, CSRF protection where relevant, and secure transport

The UI and domain types are already separated from persistence to make that migration straightforward.
