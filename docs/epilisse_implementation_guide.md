# EPILISSE - Luxury Beauty Care Implementation Guide for Claude Code

This document serves as a comprehensive technical specification and design handover for the EPILISSE beauty studio project. It contains the visual tokens, component logic, and architectural requirements needed to implement the high-fidelity designs.

## 1. Brand Identity & Visual System (Gold Lux)

### Color Palette (Luxus Ästhetik System)
- **Primary (Gold):** `#c5a021` (Used for CTAs, active states, accents, and brand typography).
- **Surface (Cream/Light):** `#fcf9f8` (Main background).
- **Surface Container:** `#f6f3f2` (Used for sections and cards to create subtle depth).
- **Text (Main):** Dark charcoal/grey for readability against cream backgrounds.
- **Accent (Gold Fade):** Gradient or low-opacity gold for hover states and progress bars.

### Typography
- **Headlines:** `PLAYFAIR DISPLAY` (Serif). Used for all major page titles, section headers, and hero statements.
- **Body & Labels:** Sans-serif (Inter/Geist or similar). Used for navigation, pricing lists, and descriptive text.
- **Tracking:** Wider letter spacing for a luxury feel, especially in navigation and subheaders.

### Global Styles
- **Roundness:** `ROUND_FOUR` (Subtle 4px-8px border radius for cards and buttons).
- **Elevation:** Flat design with very subtle shadows (0-2px) or borders (`border-outline-variant/30`) to maintain a clean, airy aesthetic.

---

## 2. Shared Component Architecture

### TopNavBar (Public Site)
- **Structure:** Brand Logo (Left), Nav Links (Center: Behandlungen, Preise, Über Uns, Kontakt), Actions (Right: DE|EN|TR Language Switcher, "Termin Buchen" CTA).
- **Behavior:** Sticky/Fixed top, backdrop-blur effect on scroll.
- **Mobile:** Hamburger menu with full-screen overlay.

### SideNavBar (Admin Dashboard)
- **Structure:** Admin Profile Header, Navigation Links (Dashboard, Termine, Behandlungen, Kunden, Einstellungen), "Neuer Termin" floating action button at the bottom.
- **Styling:** Vertical fixed sidebar (~280px), cream background with a subtle border-right separation.

### Footer
- **Sections:** Brand bio, Quick Links, Legal (Impressum, Datenschutz), Social Icons.
- **Styling:** Surface-dim background, light grey text, centered copyright.

---

## 3. Key Screen Implementation Details

### Page: Home (Landing Page)
- **Hero Section (Instagram Stories Style):**
    - 4-5 auto-sliding slides with a horizontal progress bar at the top of each.
    - **Transition Speed:** 10s per slide (Slower for luxury feel).
    - **Content:** Large serif headline, subtext, and a primary CTA.
- **Category Grid:**
    - 5 large image cards (Laser, Enjeksiyon, vb.).
    - Interactive: Scale/Shadow effect on hover.
    - **Dynamic Logic:** Must support a 6th card automatically adjusting the grid layout if added from the dashboard.
- **Campaign Section:**
    - Wide featured card for "Winter Glow Kombi-Paket" or similar seasonal offers.

### Page: Service Details (e.g., Laser, Injectables)
- **Hero:** Large background image with the service title in large serif typography.
- **Health/Information Section:** Detailed explanation of health benefits, safety standards, and technology used.
- **Pricing List:** Large font sizes for service names and prices. Clean table or list layout.
- **Multiple Campaign Area:** At the bottom of the page, support for multiple "Kombi-Paket" cards stacked vertically or in a carousel.

### Page: Admin Master Controller
- **Dashboard Stats:** Quick view cards for "Heute Termine," "Gesamt Kunden," etc.
- **Hero Management:** Input fields for updating the landing page H1, H2, and background image.
- **Story Management:** List view of active slides with ability to Edit/Delete/Add.
- **Category & Service Manager:**
    - Master list of the 5-6 main categories.
    - Drill-down functionality: Clicking a category opens the "Sub-Service Management" to edit prices, durations, and visibility.
    - Campaign Toggle: Ability to add/edit/delete multiple campaigns per service.

---

## 4. Technical Requirements for Implementation

- **Framework:** Tailwind CSS for styling (leverage established color/spacing tokens).
- **Animations:** 
    - Smooth transitions for story slides (CSS `transition` or `framer-motion`).
    - Progressive loading for high-res imagery.
- **Localization:** Support for `i18next` or similar, handling DE (default), EN, and TR.
- **Calendar:** Integration slot for Google Calendar API for "Termin Buchen" functionality.
- **Asset Usage:** Use `{{DATA:IMAGE:IMAGE_N}}` placeholders for all brand imagery and UI icons to maintain consistency with the provided designs.

---

## 5. Design Rationale
The goal is **"Quiet Luxury."** High contrast in typography (Large Serif vs Small Sans), generous whitespace, and a monochromatic palette with gold accents. The management dashboard must feel as premium as the public-facing site, ensuring a consistent brand experience for the business owners.
