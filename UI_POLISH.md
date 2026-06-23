# UI_POLISH.md — MotoCare Dashboard

## Goal

Polish the MotoCare Dashboard frontend UI so it looks modern, clean, premium, professional, and ready for presentation.

This is UI/UX polish only. The app already works with:

* Backend: Railway
* Frontend: Vercel
* Database: Supabase

## Main Rules

Do not break existing functionality.

Do not change:

* API endpoints
* VITE_API_BASE_URL usage
* authentication logic
* token/localStorage behavior
* role-based access logic
* CRUD logic
* backend response assumptions
* routing logic unless only needed for layout consistency

Do not:

* hardcode API URLs
* commit `.env`
* install xlsx or exceljs
* install heavy UI libraries
* rewrite the whole app
* remove existing pages or features

Keep these features working:

* Login
* Register
* Dashboard
* Services list
* Service detail
* Create service
* Edit service
* Delete confirmation
* Bookings
* Profile
* Logout
* Search
* Filter
* Pagination
* Sorting
* Chart
* Dark mode
* Export CSV / Excel-compatible export

## Design Direction

Theme: Premium Garage Dashboard / Modern Automotive Admin Panel.

Style:

* clean dashboard
* professional automotive feel
* spacious layout
* modern cards
* polished forms
* beautiful tables
* clear status badges
* consistent spacing
* responsive desktop and mobile layout

Color palette:

* Background: #F8FAFC
* Sidebar: #0F172A
* Primary: #2563EB
* Accent: #F97316
* Text: #0F172A
* Muted text: #64748B
* Success: #16A34A
* Warning: #F59E0B
* Danger: #DC2626
* Border: #E2E8F0
* Card: #FFFFFF

## Visual Inspiration

Use the uploaded motorcycle dashboard reference only as visual inspiration, not as an exact copy.

Apply this style:
- Dark premium automotive dashboard
- Orange accent highlights
- Futuristic but still clean admin interface
- Thin borders and glass/dark cards
- Premium stat cards
- Dashboard hero card with MotoCare branding
- Chart area with clean dark panel
- Professional garage/service management feel

Important:
- Keep the left sidebar dashboard layout.
- Do not replace the sidebar with top navigation tabs.
- Do not copy the exact logo, text, layout, motorcycle image, or Russian content from the reference.
- Keep all existing admin features visible and usable.
- Tables and forms must stay readable.

## Polish Scope

### Login and Register

Improve:

* background gradient or split layout
* auth card spacing, shadow, radius, typography
* inputs, buttons, alerts, and validation messages
* MotoCare branding and tagline
* mobile responsiveness

Suggested tagline:
“Manage services, bookings, and garage operations in one dashboard.”

### Dashboard

Improve:

* header and welcome section
* statistic cards with icons and hover states
* chart containers
* spacing and responsive layout

Do not hardcode dashboard data. Keep API data.

### Sidebar and Topbar

Improve:

* brand area
* active menu state
* icon alignment
* logout placement
* responsive behavior
* user/role display if already available

### Services

Improve:

* table header
* row hover
* search/filter/sort layout
* pagination
* action buttons
* loading state
* empty state
* active/inactive badges

Keep at least these columns:
ID, Name, Category, Price, Duration, Status, Actions.

### Service Detail

Improve:

* information card layout
* spacing and typography
* back/edit buttons
* status display

### Create/Edit Forms

Improve:

* card layout
* labels
* inputs/select/textarea
* validation messages
* submit/cancel buttons

Do not change payload shape.

### Bookings

Improve:

* table/list layout
* status badges for pending, confirmed, in_progress, completed, cancelled
* loading and empty state
* responsive layout

### Dark Mode

Keep dark mode working and improve readability for:

* sidebar
* topbar
* cards
* tables
* forms
* badges
* buttons
* modals/confirmation UI

### Export

Keep export working.
If current export is CSV, keep it CSV and Excel-compatible.
Do not add xlsx or exceljs.

## Final Checks

After changes:

* run npm run build
* make sure no .env is committed
* make sure no hardcoded localhost:8080 remains
* make sure VITE_API_BASE_URL is still used
* explain changed files
* explain UI improvements
* list pages to manually test
