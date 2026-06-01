# Screenshots

Add PNG or JPG captures of the running application for your README and assessment submission.

## Required Screenshots

| File name | Page | How to capture |
|-----------|------|----------------|
| `01-home.png` | Home | Open `/` — hero, banner, featured products |
| `02-login.png` | Login | Open `/login` |
| `03-signup.png` | Signup | Open `/signup` — show "Server connected" if API is running |
| `04-dashboard.png` | Dashboard | Login → `/dashboard` |
| `05-products.png` | Products | `/products` list with search/filter |
| `06-customers.png` | Customers | `/customers` |
| `07-orders.png` | Orders | `/orders` |
| `08-inventory.png` | Inventory | `/inventory` |
| `09-reports.png` | Reports | `/reports` |
| `10-about.png` | About Us | `/about` |
| `11-contact.png` | Contact Us | `/contact` |

## Steps

1. Run `START_AUTH.bat` or `docker-compose up --build`.
2. Open http://localhost:5173 (or http://localhost:3000 with Docker).
3. Use **Win + Shift + S** (Windows) or your OS screenshot tool.
4. Save files in this folder with the names above.
5. Reference them in the root `README.md`:

```markdown
![Dashboard](./screenshots/04-dashboard.png)
```

## Placeholder

Until you add real screenshots, the README uses descriptive sections without images.
