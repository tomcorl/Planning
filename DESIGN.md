# Design

## Source of truth
- Status: Draft
- Last refreshed: 2026-05-25
- Primary product surfaces: public SaaS landing page, pricing/payment mockup, login, planning workspace, admin users, admin companies.
- Evidence reviewed: `src/App.jsx`, `src/App.css`, `README.md`.

## Brand
- Personality: professional, calm, operational, made for construction planning teams.
- Trust signals: clear pricing, visible workflow benefits, admin controls, predictable planning UI.
- Avoid: playful marketing overload, decorative clutter, destructive actions in primary navigation.

## Product goals
- Goals: make a multi-company planning SaaS, keep daily scheduling fast, prepare for backend accounts later.
- Non-goals: real authentication or payments before backend implementation.
- Success signals: users can understand the product, connect, select a company, manage users and companies, and work in the planning without visual clutter.

## Personas and jobs
- Primary personas: company owner/admin, planning manager, conductor/field supervisor.
- User jobs: plan worksites, view workloads by time range, manage companies, manage people and access.
- Key contexts of use: desktop planning, quick admin setup, occasional mobile review.

## Information architecture
- Primary navigation: public home -> login -> planning/admin workspace.
- Core routes/screens: Home, Pricing/Payment, Login, Planning, Users, Companies.
- Content hierarchy: active company and workspace controls first, planning grid second, admin tables/forms for setup.

## Design principles
- Principle 1: keep operational screens dense but readable.
- Principle 2: separate public marketing from authenticated work.
- Tradeoffs: frontend-only mock data is acceptable until backend work starts.

## Visual language
- Color: neutral surfaces, dark navy text, blue primary actions, restrained status colors.
- Typography: Inter, compact labels, strong headings only on marketing/auth pages.
- Spacing/layout rhythm: 8px-based controls, compact planning rows, wider public sections.
- Shape/radius/elevation: modest radius, small shadows for panels/modals only.
- Motion: subtle hover/transition only.
- Imagery/iconography: avoid stock imagery for now; use UI/product structure as the visual signal.

## Components
- Existing components to reuse: planning grid, modals, action menu, color choices.
- New/changed components: `LandingPage`, `LoginPage`, `AdminUsersPage`, `CompaniesPage`, planning settings drawer.
- Variants and states: active nav item, disabled admin-only pages, login error, empty tables.
- Token/component ownership: CSS variables in `src/App.css`.

## Accessibility
- Target standard: practical keyboard and contrast improvements for current prototype.
- Keyboard/focus behavior: native inputs/buttons, clear focus styles.
- Contrast/readability: high contrast text on light/dark surfaces.
- Screen-reader semantics: headings, forms, labels, tables.
- Reduced motion and sensory considerations: no required animation.

## Responsive behavior
- Supported breakpoints/devices: desktop first, usable tablet/mobile landing and admin pages.
- Layout adaptations: public/login stack on small screens, planning keeps horizontal scroll.
- Touch/hover differences: planning remains scroll-based on touch.

## Interaction states
- Loading: not needed for local prototype yet.
- Empty: admin tables show useful defaults.
- Error: login shows inline error.
- Success: form changes persist locally.
- Disabled: admin pages hidden for non-admin users.
- Offline/slow network, if applicable: local storage works offline for prototype.

## Content voice
- Tone: direct, practical, professional.
- Terminology: entreprise, utilisateur, planning, chantier, equipe, conducteur.
- Microcopy rules: short labels, avoid technical backend language in UI.

## Implementation constraints
- Framework/styling system: React/Vite, plain CSS.
- Design-token constraints: keep using CSS variables in `App.css`.
- Performance constraints: avoid heavy libraries before backend planning.
- Compatibility constraints: localStorage prototype; no server auth yet.
- Test/screenshot expectations: run lint/build; browser visual check when localhost is accessible.

## Open questions
- [ ] Final SaaS name / owner / affects branding and landing copy.
- [ ] Real pricing / owner / affects public page and future billing.
- [ ] Backend auth provider / owner / affects account and company data model.
