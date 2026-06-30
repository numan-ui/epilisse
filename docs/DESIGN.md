---
name: Luxus Ästhetik System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4635'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#745b00'
  primary: '#745b00'
  on-primary: '#ffffff'
  primary-container: '#c5a021'
  on-primary-container: '#483800'
  inverse-primary: '#eac243'
  secondary: '#5f5e5a'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dc'
  on-secondary-container: '#656460'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a3a4a4'
  on-tertiary-container: '#383a3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe089'
  primary-fixed-dim: '#eac243'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2dc'
  secondary-fixed-dim: '#c9c6c1'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 80px
---

## Brand & Style

The design system embodies "Quiet Luxury"—an aesthetic defined by restraint, premium materials, and flawless execution. It targets a high-end clientele seeking professional beauty treatments in an atmosphere of serenity and exclusivity.

The visual style is **Minimalist Luxury**. It leverages expansive whitespace to create "breathing room," suggesting that time and space are the ultimate luxuries. The interface avoids clutter, using gold only as a sophisticated accent to guide the eye toward primary actions. High-quality imagery is integrated as a core structural element, rather than decoration, providing a tactile sense of the salon's environment.

**Emotional Response:**
*   **Exklusivität:** A sense of being in a private, high-end space.
*   **Vertrauen:** Professionalism conveyed through structured, clean typography.
*   **Ruhe:** A calming user experience that mirrors the physical salon visit.

## Colors

The "Gold Lux" palette is rooted in natural, warm tones to avoid the coldness of pure digital white.

*   **Primary (Gold Lux):** Used for call-to-actions, active navigation states, and illustrative icons. It should be applied sparingly to maintain its impact.
*   **Secondary (Cream Surface):** The primary background color for large sections and containers, providing a softer contrast than pure white.
*   **Tertiary (Pure White):** Used for content cards and input fields to make them "pop" against the cream background.
*   **Neutral (Charcoal/Black):** Used for all primary text to ensure maximum legibility and a grounded, professional feel.

## Typography

This system uses a classic pairing of a high-contrast serif and a modern geometric sans-serif.

*   **Headlines (Playfair Display):** Should be used for all page titles and section headers. The elegance of the serif communicates heritage and premium service.
*   **Body & UI (Manrope):** Chosen for its exceptional readability and clean, modern profile. It handles functional UI tasks (forms, tables, dashboard metrics) with a neutral but sophisticated tone.
*   **Label Caps:** Used for category labels and small metadata (e.g., "MÜNCHEN ZENTRUM") to add an editorial feel to the management interface.

## Layout & Spacing

The design system utilizes a **Fluid Grid** with generous safe margins to preserve the minimalist aesthetic.

*   **Desktop:** 12-column grid with 64px outer margins. Content is centered with a max-width of 1440px to prevent excessive line lengths on ultra-wide monitors.
*   **Dashboard View:** Employs a fixed-width left sidebar (280px) with a fluid content area.
*   **Spacing Rhythm:** High-level sections are separated by 80px (section-gap) to maintain the "spacious" brand promise. Vertical rhythm is strictly based on 8px increments.
*   **Mobile:** 4-column grid with 16px margins. Elements like service cards stack vertically.

## Elevation & Depth

To maintain a clean and modern look, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

*   **Surface Hierarchy:** The base background is "Cream Surface". Cards and containers use "Pure White".
*   **Shadows:** Use only one type of shadow: a very soft, highly diffused "Ambient Glow" (0px 4px 20px rgba(0,0,0,0.04)) to subtly lift active cards or dropdowns.
*   **Glassmorphism:** Reserved for the fixed header during scroll, using a backdrop-blur (10px) with 80% opacity of the "Off-White" color to maintain legibility.
*   **Borders:** Use a 1px "Border-Subtle" (#E5E1D8) for pricing tables and list dividers to define structure without adding visual noise.

## Shapes

The shape language is **Soft**. Sharp corners are avoided to remain approachable, but high roundedness (pills) is avoided to maintain a serious, high-end architectural feel.

*   **Standard Elements (Buttons, Inputs):** 0.25rem (4px) corner radius.
*   **Container Elements (Cards, Service Sections):** 0.5rem (8px) corner radius.
*   **Dashboard Components:** Use the same 8px radius for consistency across the management interface.
*   **Icons:** Use a 1.5pt stroke weight with slightly rounded joins.

## Components

### Buttons & CTAs
*   **Primary:** Solid "Gold Lux" background with white text. No border. High-end look.
*   **Secondary:** Ghost style with "Gold Lux" border and text.
*   **Dashboard Action:** Small, condensed buttons with uppercase labels for utility actions.

### Service-Karten (Service Cards)
*   **Style:** White background, subtle 1px border.
*   **Content:** Headline in Playfair Display, price in Gold Lux, and a "Buchen" (Book) button that appears or highlights on hover.
*   **Images:** 4:5 aspect ratio with a subtle grayscale-to-color transition on hover.

### Preislisten (Pricing Tables)
*   **Style:** Minimalist rows with "Border-Subtle" dividers. 
*   **Typography:** Service name in Manrope Bold, duration in Manrope Regular (Gray), and price right-aligned in Playfair Display.

### Management Dashboard
*   **Sidebar:** Cream background with active states highlighted in Gold Lux. Use the "Label-Caps" style for section headers.
*   **Category Controller:** Grid of "Hauptkategorien" cards as seen in the reference. Use dashed borders for the "Neue Kategorie" (Add New) placeholder.
*   **Status Badges:** Small, rectangular badges with low-opacity background tints (e.g., green for "Sichtbar", amber for "Verborgen").

### Input Fields
*   **Style:** Bottom-border only for public-facing forms (ultra-minimal); full-bordered "Pure White" boxes for the management dashboard to prioritize data density and clarity.