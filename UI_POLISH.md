# UI Polish Instructions — MotoCare Dashboard

## Goal

Improve the MotoCare Dashboard frontend UI so it looks modern, clean, premium, professional, and ready for presentation.

This is UI/UX polish only. The app is already connected to the deployed Railway backend and deployed on Vercel.

## Important Rules

Do not break existing functionality.

Do not change:

* API endpoints
* authentication logic
* token/localStorage behavior
* role-based access logic
* backend response assumptions
* VITE_API_BASE_URL usage
* CRUD logic
* routing logic unless needed for UI consistency

Do not hardcode API URLs.

Do not remove required pages or features:

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
* Export CSV / Excel-compatible feature

Do not install heavy UI libraries.

Do not commit `.env`.

## Design Concept

Theme: Premium Garage Dashboard / Modern Automotive Admin Panel.

Style:

* Clean dashboard
* Professional automotive feel
* Spacious layout
* Modern cards
* Beautiful tables
* Clear status badges
* Consistent spacing
* Responsive desktop and mobile layout

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

## Areas to Improve

### Login and Register

* Improve background with gradient or split layout.
* Improve auth card spacing, shadow, border radius, typography, inputs, buttons, and error messages.
* Add MotoCare branding and tagline.
* Make it responsive.

### Dashboard

* Improve dashboard header and welcome section.
* Improve statistic cards with icons and hover effect.
* Improve chart containers.
* Keep all data from API, do not hardcode.

### Sidebar and Topbar

* Improve brand area.
* Improve active menu state.
* Improve icon alignment.
* Improve logout placement.
* Improve responsive behavior.

### Services Table

* Improve table header, row hover, spacing, badges, buttons, search/filter area, sorting, pagination, loading state, and empty state.
* Keep at least these columns: ID, Name, Category, Price, Duration, Status, Actions.

### Service Detail

* Make the detail page look like a clean professional information card.
* Improve spacing, typography, and action buttons.

### Create/Edit Forms

* Improve card layout, labels, inputs, select, textarea, validation messages, and submit/cancel buttons.
* Do not change payload shape.

### Bookings

* Improve table/list layout.
* Improve status badges for pending, confirmed, in_progress, completed, and cancelled.

### Dark Mode

* Keep dark mode working.
* Improve readability for sidebar, cards, tables, forms, modals, badges, and buttons.

### Export

* Keep export feature working.
* If current export is CSV, keep CSV compatible with Excel.
* Do not add xlsx or exceljs.

## After Changes

Run:

* npm run build

Then explain:

* changed files
* UI improvements made
* pages I should manually test
