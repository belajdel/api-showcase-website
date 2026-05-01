# Inventory & Invoicing Dashboard - Setup Guide

## Overview

Your complete inventory management and invoice creation system is now ready! This dashboard provides a professional interface to interact with your REST API endpoints for product management and invoicing.

## Features Built

### 1. **Dashboard**
- Real-time stock value display (GET /valeur)
- Low stock alerts for products below threshold (GET /produits/alerte/:seuil)
- Recent invoices overview
- Product inventory summary with visual indicators

### 2. **Products Management**
- View all products from your inventory (GET /produits)
- Add new products via intuitive form dialog (POST /produits)
- Real-time stock values calculated (price × quantity)
- Visual low-stock indicators

### 3. **Invoice Creation Wizard**
- Multi-step guided invoice creation (3 steps)
- **Step 1**: Client information and invoice date
- **Step 2**: Dynamic line item management
  - Product dropdown with real-time stock levels
  - Quantity validation against available stock
  - Real-time subtotal calculations
  - Add/remove items functionality
- **Step 3**: Review and confirmation before submission
- Submit invoices via POST /factures endpoint
- Automatic invoice number generation

### 4. **API Settings**
- Configurable API base URL (settings button in sidebar)
- Supports any API endpoint
- Stores configuration in session
- Pre-configured endpoints documentation

## Getting Started

### Step 1: Configure API Base URL

1. Open the application (runs on http://localhost:3000)
2. Click the **API Settings** button in the sidebar
3. Enter your API server base URL (e.g., `http://localhost:3001`)
4. Click **Save Configuration**

### Step 2: Verify API Endpoints

Your API should have these endpoints ready:

```
GET  /produits              - List all products
POST /produits              - Create new product
GET  /valeur                - Get total stock value
GET  /produits/alerte/:seuil - Get low-stock products (e.g., /produits/alerte/5)
GET  /factures              - List all invoices
POST /factures              - Create new invoice
```

### Step 3: API Request/Response Format

**GET /produits** - Expected response:
```json
[
  {
    "id": 1,
    "nom": "Product Name",
    "prix": 29.99,
    "quantite": 50
  }
]
```

**POST /produits** - Request body:
```json
{
  "nom": "Product Name",
  "prix": 29.99,
  "quantite": 100
}
```

**GET /valeur** - Expected response:
```
12345.67
```
(A single number representing total stock value)

**GET /produits/alerte/:seuil** - Example: `/produits/alerte/5`
Expected response:
```json
[
  {
    "id": 2,
    "nom": "Low Stock Item",
    "prix": 19.99,
    "quantite": 3
  }
]
```

**GET /factures** - Expected response:
```json
[
  {
    "numFacture": "INV-001",
    "dateFacture": "2026-05-01",
    "numClient": "CLI-001",
    "ligneFactures": [
      {
        "produit": { "id": 1, "nom": "Product", "prix": 29.99 },
        "quantite": 2
      }
    ]
  }
]
```

**POST /factures** - Request body:
```json
{
  "numFacture": "INV-1234567890",
  "dateFacture": "2026-05-01",
  "numClient": "CLI-001",
  "ligneFactures": [
    {
      "produit": { "id": 1 },
      "quantite": 5
    }
  ]
}
```

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx           - Root layout with navigation
│   ├── page.tsx             - Home page (redirects to /dashboard)
│   ├── dashboard/
│   │   └── page.tsx         - Dashboard with stats and tables
│   ├── products/
│   │   └── page.tsx         - Products management page
│   └── invoices/
│       └── page.tsx         - Invoices list and wizard
├── components/
│   ├── navigation.tsx       - Sidebar navigation
│   ├── api-settings.tsx     - API configuration dialog
│   ├── add-product-dialog.tsx - Product creation form
│   ├── invoice-wizard.tsx   - Multi-step invoice creation
│   ├── loading-spinner.tsx  - Loading indicator
│   ├── api-showcase.tsx     - Original API showcase (optional)
│   └── ui/                  - shadcn/ui components
├── lib/
│   └── api.ts               - Centralized API client with fetch wrapper
└── public/                  - Static assets
```

## Key Components

### API Client (`lib/api.ts`)
- Centralized fetch wrapper with error handling
- Configurable base URL
- Functions: `getProducts()`, `addProduct()`, `getStockValue()`, `getLowStockProducts()`, `getInvoices()`, `createInvoice()`

### Navigation (`components/navigation.tsx`)
- Fixed left sidebar with route links
- Settings button to configure API base URL
- Active route highlighting

### Dashboard Page (`app/dashboard/page.tsx`)
- Stat cards with real-time data
- Low-stock products table
- Recent invoices table
- Error handling and loading states

### Products Page (`app/products/page.tsx`)
- Complete products listing
- Add product button with dialog modal
- Stock value calculations
- Low-stock indicators

### Invoice Wizard (`components/invoice-wizard.tsx`)
- 3-step guided flow
- Real-time validations
- Product availability checking
- Quantity verification against stock

## Customization

### Changing Default API URL
Edit `lib/api.ts` line 4:
```typescript
let API_BASE_URL = 'http://localhost:3001' // Change this
```

### Changing Low Stock Threshold
Edit `app/dashboard/page.tsx` line 47:
```typescript
const lowStock = await getLowStockProducts(5) // Change 5 to your threshold
```

### Styling & Theme
The app uses Tailwind CSS 4.2 with a dark theme. Colors and spacing can be customized in `app/globals.css`.

## Troubleshooting

### "Failed to load" errors
- Check that your API server is running
- Verify the API base URL in settings matches your server
- Check browser console for detailed error messages (F12)

### Products not showing
- Verify GET /produits endpoint returns proper JSON array
- Check API response format matches expected schema

### Invoice creation fails
- Ensure all products have proper `id`, `nom`, `prix`, `quantite` fields
- Verify POST /factures endpoint accepts the request format
- Check that quantities don't exceed available stock

### CORS errors
- Your API server needs to enable CORS for requests from localhost:3000
- Add proper CORS headers to your API responses

## Next Steps

1. Connect your API server
2. Configure the API base URL in settings
3. Test the Dashboard to see real inventory data
4. Create test products
5. Create test invoices
6. Deploy to production with your API endpoint

## Support

For issues with the dashboard UI, check the browser console (F12) for error messages. For API-related issues, verify your endpoint responses match the expected formats documented above.
