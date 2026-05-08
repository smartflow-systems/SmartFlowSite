# SmartFlow Design System

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Created by:** Gareth Bowers

---

## 🎨 Overview

The SmartFlow Design System is a luxurious dark gold aesthetic featuring glass-morphism effects, flowing circuit animations, and premium visual design. This system creates a cohesive family of applications with a sophisticated tech-forward appearance.

### Core Design Principles

1. **Luxurious & Premium** - Dark gold palette with glass-morphism creates elegance
2. **Tech-Forward** - Flowing circuit animations and futuristic elements
3. **Consistent** - Unified design language across all SmartFlow applications
4. **Accessible** - High contrast ratios and clear visual hierarchy
5. **Performant** - Optimized animations running at 60fps

---

## 🎨 Color Palette

### Primary Colors

```css
--sf-black: #0D0D0D       /* Deep black background */
--sf-gold: #FFD700        /* Primary gold (#FFD700 / rgb(255, 215, 0)) */
--sf-gold-2: #E6C200      /* Secondary gold accent */
--sf-beige: #F5F5DC       /* Soft beige for highlights */
--sf-brown: #3B2F2F       /* Warm brown for depth */
--sf-white: #FFFFFF       /* Pure white for contrast */
```

### Semantic Color Tokens (HSL format for Tailwind)

```css
/* Backgrounds */
--background: 0 0% 5%              /* #0D0D0D - Main background */
--card: 0 0% 8%                    /* #141414 - Card backgrounds */
--popover: 0 0% 7%                 /* #121212 - Popover backgrounds */
--sidebar: 0 0% 6%                 /* #0F0F0F - Sidebar background */

/* Foregrounds */
--foreground: 48 10% 98%           /* #F9F9F7 - Main text */
--card-foreground: 48 10% 98%      /* #F9F9F7 - Card text */
--muted-foreground: 45 10% 65%     /* #9F9E8F - Secondary text */

/* Brand Colors */
--primary: 51 100% 50%             /* #FFD700 - Gold primary */
--primary-foreground: 0 0% 5%      /* #0D0D0D - Text on gold */
--accent: 51 91% 45%               /* #E6C200 - Gold accent */
--accent-foreground: 0 0% 5%       /* #0D0D0D - Text on accent */

/* UI Elements */
--border: 45 15% 20%               /* #3D3930 - Border color */
--card-border: 51 50% 25%          /* #7F7400 - Gold-tinted borders */
--input: 45 15% 25%                /* #464139 - Input backgrounds */
--ring: 51 100% 50%                /* #FFD700 - Focus rings */

/* Functional */
--secondary: 30 15% 18%            /* #362E2A - Secondary elements */
--muted: 30 10% 12%                /* #231F1D - Muted backgrounds */
--destructive: 0 72% 51%           /* #DD3C3C - Error/danger */
```

### Usage Guidelines

- **Primary Gold (#FFD700)**: CTAs, key highlights, brand elements, active states
- **Accent Gold (#E6C200)**: Secondary actions, hover states, subtle accents
- **Deep Black (#0D0D0D)**: Main background, text on gold surfaces
- **Muted Foreground**: Secondary information, labels, captions
- **White/Beige**: Primary text, high-contrast elements

---

## 📐 Typography

### Font Families

```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-serif: Georgia, serif;
--font-mono: "JetBrains Mono", Menlo, monospace;
```

### Font Scale

```
Headings:
- H1: 3.5rem (56px) - font-bold - Hero titles
- H2: 2.5rem (40px) - font-bold - Section headers
- H3: 2rem (32px) - font-semibold - Subsection headers
- H4: 1.5rem (24px) - font-semibold - Card titles

Body:
- Large: 1.125rem (18px) - Leading text
- Base: 1rem (16px) - Body text
- Small: 0.875rem (14px) - Captions, labels
- XS: 0.75rem (12px) - Fine print

Code:
- Code blocks use JetBrains Mono
- Inline code: bg-muted with rounded corners
```

### Typography Patterns

```jsx
// Hero Title
<h1 className="text-5xl md:text-6xl font-bold">
  <span className="text-foreground">Hardware Security</span>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
    Meets Blockchain
  </span>
</h1>

// Section Header
<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
  Technology Deep-Dive
</h2>

// Card Title
<h3 className="text-xl font-semibold text-foreground mb-2">
  AES-256 Encryption
</h3>
```

---

## 🪟 Glass-Morphism Effects

### Glass Card Utility

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.22);
  backdrop-filter: saturate(140%) blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 
              inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.glass-card:hover {
  border-color: rgba(230, 194, 0, 0.35);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}
```

### Glass Card Pattern

```jsx
<div className="glass-card rounded-2xl p-6">
  <h3 className="text-xl font-semibold text-foreground mb-2">
    Card Title
  </h3>
  <p className="text-muted-foreground">
    Card content with glass-morphism effect
  </p>
</div>
```

### Glass Button (Over Images/Heroes)

```jsx
<Button 
  variant="outline" 
  className="backdrop-blur-md bg-background/10 border-primary/40"
>
  See Demo
</Button>
```

---

## ⚡ Interactive States

### Hover & Active Elevations

SmartFlow uses custom elevation utilities that work with any background color:

```css
/* Elevation utilities - automatically adapt to any background */
--elevate-1: rgba(255, 215, 0, 0.06);  /* Subtle hover */
--elevate-2: rgba(255, 215, 0, 0.14);  /* Active press */

.hover-elevate         /* Applies subtle elevation on hover */
.active-elevate-2      /* Applies stronger elevation on active/press */
```

### Usage

```jsx
// Buttons and Badges automatically have elevation built-in
<Button>Click Me</Button>  {/* Already has hover-elevate + active-elevate-2 */}

// Apply to custom elements
<Card className="hover-elevate cursor-pointer">
  Interactive Card
</Card>

// Disable default elevation if needed
<Button className="no-default-hover-elevate">
  No Hover Effect
</Button>
```

### Toggle States

```jsx
// Create toggleable elements
<Button 
  className={`toggle-elevate ${isActive ? 'toggle-elevated' : ''}`}
>
  Toggle Button
</Button>
```

---

## 📏 Spacing System

### Spacing Scale

```
xs:  0.25rem (4px)   - Tight spacing
sm:  0.5rem  (8px)   - Small gaps
md:  1rem    (16px)  - Default spacing
lg:  1.5rem  (24px)  - Section padding
xl:  2rem    (32px)  - Large sections
2xl: 3rem    (48px)  - Major sections
3xl: 4rem    (64px)  - Hero spacing
```

### Consistency Rules

1. **Card Padding**: Use `p-6` (24px) or `p-8` (32px) consistently
2. **Section Spacing**: Use `py-16` or `py-20` between major sections
3. **Element Gaps**: Use `gap-4` or `gap-6` for flex/grid layouts
4. **Icon Spacing**: Small spacing (8px) left/right of icons in inputs

---

## 🎯 Component Patterns

### Navigation Header

```jsx
<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <span className="text-xl font-bold text-primary-foreground">SF</span>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">SmartFlowSystems</div>
        <div className="text-sm font-bold text-foreground">Your App Name</div>
      </div>
    </div>
    
    {/* Nav Links */}
    <nav className="hidden md:flex items-center gap-6">
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Product
      </button>
    </nav>
    
    {/* CTAs */}
    <div className="flex items-center gap-3">
      <Button variant="ghost">Contact</Button>
      <Button>Get Started</Button>
    </div>
  </div>
</header>
```

### Hero Section

```jsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Circuit Background Component */}
  <CircuitBackground />
  
  <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <Badge variant="outline" className="mb-6">
        Next-Generation Technology
      </Badge>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        <span className="text-foreground">Your Product</span>{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Tagline Here
        </span>
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Compelling description of your product or service
      </p>
      
      {/* Key Stats */}
      <div className="flex gap-8 mb-8">
        <div>
          <div className="text-2xl font-bold text-primary">256-bit</div>
          <div className="text-sm text-muted-foreground">Encryption</div>
        </div>
      </div>
      
      {/* CTAs */}
      <div className="flex gap-4">
        <Button size="lg">See Demo</Button>
        <Button variant="outline" size="lg">Learn More</Button>
      </div>
    </div>
    
    <div className="relative">
      {/* Product image or visual */}
      <img src="/your-product.png" alt="Product" className="rounded-2xl" />
    </div>
  </div>
</section>
```

### Feature Card

```jsx
<div className="glass-card rounded-2xl p-6 hover-elevate cursor-pointer transition-all">
  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
    <Shield className="w-6 h-6 text-primary" />
  </div>
  
  <h3 className="text-xl font-semibold text-foreground mb-2">
    Feature Title
  </h3>
  
  <p className="text-muted-foreground mb-4">
    Description of the feature and its benefits
  </p>
  
  <div className="flex items-center gap-2 text-primary text-sm font-medium">
    Learn More <ArrowRight className="w-4 h-4" />
  </div>
</div>
```

### Scroll-to-Top Button

```jsx
<button
  className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${
    isVisible ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-16"
  }`}
>
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-lg border border-primary/40 flex items-center justify-center hover-elevate active-elevate-2 shadow-lg shadow-primary/30">
    <ArrowUp className="w-5 h-5 text-primary" />
  </div>
</button>
```

---

## 🌊 Flowing Circuit Background

The signature SmartFlow animation featuring flowing energy paths, animated particles, and connection nodes.

### Features

- 12 Bezier energy paths with golden glow
- 35 animated particles with varied speeds
- 8 pulsing connection nodes
- Radial glow effects
- 60fps performance
- Responsive canvas sizing

### Usage

```jsx
import { CircuitBackground } from '@/components/CircuitBackground';

<section className="relative min-h-screen">
  <CircuitBackground />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</section>
```

See `components/CircuitBackground.tsx` for full implementation.

---

## 🎭 Shadows & Depth

```css
--shadow-sm: 0px 2px 4px -1px rgba(0,0,0, 0.35), 
             0px 1px 2px -1px rgba(0,0,0, 0.50);
             
--shadow-md: 0px 6px 10px -2px rgba(0,0,0, 0.45), 
             0px 2px 4px -2px rgba(0,0,0, 0.35);
             
--shadow-lg: 0px 10px 15px -3px rgba(0,0,0, 0.50), 
             0px 4px 6px -4px rgba(0,0,0, 0.40);
             
--shadow-xl: 0px 20px 25px -5px rgba(0,0,0, 0.55), 
             0px 8px 10px -6px rgba(0,0,0, 0.40);
```

### Usage

- `shadow-sm`: Subtle elevation (cards at rest)
- `shadow-md`: Moderate elevation (dropdowns, modals)
- `shadow-lg`: High elevation (floating elements)
- `shadow-xl`: Maximum elevation (important modals)

---

## 🎨 Border Radius

```css
--radius: 1rem;  /* 16px - Premium rounded corners */
```

### Usage

- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-lg` (8px) - built into Button component
- Badges: `rounded-md` (6px) - built into Badge component
- Inputs: `rounded-lg` (8px)
- Images: `rounded-xl` or `rounded-2xl`
- Avatars: `rounded-full` (circular)

---

## ✅ Best Practices

### DO

✅ Use glass-morphism cards for feature sections  
✅ Apply gold gradients to key headings and CTAs  
✅ Maintain consistent spacing (6/8 for cards, 16/20 for sections)  
✅ Use CircuitBackground for hero sections and key pages  
✅ Apply hover-elevate to interactive elements  
✅ Use Shadcn Button/Badge components (pre-configured)  
✅ Ensure gold text has proper contrast on dark backgrounds  
✅ Use muted-foreground for secondary text  

### DON'T

❌ Don't use light mode (SmartFlow is dark-only)  
❌ Don't mix border styles (always full borders on rounded elements)  
❌ Don't nest glass cards inside glass cards  
❌ Don't apply custom hover states to Buttons/Badges (use built-in)  
❌ Don't use multiple gold shades in the same element  
❌ Don't forget backdrop-blur on glass elements  
❌ Don't use emojis in UI (use Lucide icons instead)  
❌ Don't override elevation utilities without good reason  

---

## 🎯 Design Checklist

When creating a new SmartFlow app:

- [ ] Import SmartFlow theme CSS
- [ ] Add CircuitBackground to hero section
- [ ] Configure navigation with SF logo and dual-line branding
- [ ] Use glass-card utility for feature sections
- [ ] Apply gold gradients to key headings
- [ ] Add ScrollToTop component
- [ ] Implement hover-elevate on interactive cards
- [ ] Use Shadcn components (Button, Badge, Card)
- [ ] Ensure consistent spacing (p-6/p-8 for cards)
- [ ] Add data-testid attributes for testing
- [ ] Include "Created by Gareth Bowers" in footer (gold text)
- [ ] Test smooth scroll behavior
- [ ] Verify 60fps circuit animation performance

---

## 📦 Package Contents

```
smartflow-design-system/
├── SMARTFLOW_DESIGN_SYSTEM.md     # This file
├── SMARTFLOW_SETUP_GUIDE.md       # Setup instructions
├── styles/
│   └── smartflow-theme.css        # Portable theme CSS
├── components/
│   ├── CircuitBackground.tsx      # Flowing circuit animation
│   ├── ScrollToTop.tsx            # Scroll-to-top button
│   └── Navigation.tsx             # Header navigation pattern
├── examples/
│   ├── hero-section.tsx           # Hero section example
│   ├── feature-grid.tsx           # Feature cards grid
│   ├── glass-cards.tsx            # Glass-morphism examples
│   └── cta-patterns.tsx           # Call-to-action patterns
└── assets/
    └── sf-logo.svg                # SmartFlow logo
```

---

## 🔗 Resources

- **Shadcn UI**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Inter Font**: https://fonts.google.com/specimen/Inter
- **JetBrains Mono**: https://fonts.google.com/specimen/JetBrains+Mono

---

**Created by Gareth Bowers**  
SmartFlowSystems Design System v1.0.0
