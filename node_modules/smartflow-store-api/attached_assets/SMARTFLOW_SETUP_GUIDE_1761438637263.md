# SmartFlow Design System - Setup Guide

**Quick Start Guide for Adding SmartFlow Theme to Your Apps**

---

## 📦 What's Included

This design system package contains:

```
smartflow-design-system/
├── SMARTFLOW_DESIGN_SYSTEM.md     # Complete design guidelines
├── SMARTFLOW_SETUP_GUIDE.md       # This file
├── styles/
│   └── smartflow-theme.css        # Portable theme CSS
├── components/
│   ├── CircuitBackground.tsx      # Flowing circuit animation
│   ├── ScrollToTop.tsx            # Scroll-to-top button
│   └── Navigation-Example.tsx     # Header navigation pattern
└── examples/
    ├── hero-section.tsx           # Hero section example
    ├── feature-grid.tsx           # Feature cards grid
    ├── glass-cards.tsx            # Glass-morphism examples
    └── cta-patterns.tsx           # Call-to-action patterns
```

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Copy Theme CSS

1. Copy `styles/smartflow-theme.css` to your project
2. Replace your existing `index.css` (or main CSS file) with this file

```bash
# From your project root
cp smartflow-design-system/styles/smartflow-theme.css client/src/index.css
```

### Step 2: Copy Reusable Components

Copy the components you want to use:

```bash
# Copy circuit background animation
cp smartflow-design-system/components/CircuitBackground.tsx client/src/components/

# Copy scroll-to-top button
cp smartflow-design-system/components/ScrollToTop.tsx client/src/components/

# Copy navigation example (customize as needed)
cp smartflow-design-system/components/Navigation-Example.tsx client/src/components/Navigation.tsx
```

### Step 3: Install Required Fonts

Add these fonts to your `index.html` (in the `<head>` section):

```html
<!-- Google Fonts: Inter & JetBrains Mono -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Step 4: Configure Tailwind

Update your `tailwind.config.ts` to include the SmartFlow theme variables:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Step 5: Add Circuit Background to Your Hero

```tsx
import { CircuitBackground } from "@/components/CircuitBackground";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <CircuitBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-foreground">Your Product</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Tagline Here
          </span>
        </h1>
        
        <Button size="lg">Get Started</Button>
      </div>
    </section>
  );
}
```

### Step 6: Add ScrollToTop Component

In your main layout/app file:

```tsx
import { ScrollToTop } from "@/components/ScrollToTop";

export default function App() {
  return (
    <>
      {/* Your app content */}
      <ScrollToTop />
    </>
  );
}
```

---

## 🎨 Using Glass Cards

The SmartFlow theme includes a `.glass-card` utility class:

```tsx
<div className="glass-card rounded-2xl p-6 hover-elevate cursor-pointer">
  <h3 className="text-xl font-semibold text-foreground mb-2">
    Card Title
  </h3>
  <p className="text-muted-foreground">
    Card content with glass-morphism effect
  </p>
</div>
```

### Key Classes:

- `.glass-card` - Glass-morphism effect with gold borders
- `.hover-elevate` - Subtle hover elevation (gold tint)
- `.active-elevate-2` - Stronger press-down elevation
- `.gold-gradient` - Gold gradient background
- `.text-gold` - Gold text color

---

## 🎯 Common Patterns

### Navigation Header

See `components/Navigation-Example.tsx` for a complete example. Key features:

- Fixed header with glass-morphism on scroll
- SF logo with dual-line branding
- Smooth scroll navigation
- Mobile-responsive menu

### Hero Section

See `examples/hero-section.tsx` for:

- Circuit background animation
- Gold gradient headings
- Split-screen layout
- Key metrics display
- Dual CTAs

### Feature Cards

See `examples/feature-grid.tsx` for:

- 3-column responsive grid
- Glass-morphism cards with icons
- Hover elevation effects
- Icon-driven design

---

## 📚 Example Components

All example files are in the `examples/` folder:

1. **hero-section.tsx** - Full hero section with circuit background
2. **feature-grid.tsx** - Feature card grid layout
3. **glass-cards.tsx** - Various glass card patterns (stats, pricing, testimonials)
4. **cta-patterns.tsx** - Call-to-action patterns (newsletter, download, demo)

### Using Examples:

1. Copy the example file to your components folder
2. Customize the content (text, icons, links)
3. Import and use in your pages

```tsx
import { HeroSection } from "@/components/hero-section";
import { FeatureGrid } from "@/components/feature-grid";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
    </>
  );
}
```

---

## 🎨 Customization Guide

### Changing Brand Colors

Edit the CSS variables in `index.css`:

```css
:root {
  /* SmartFlow Raw Colors */
  --sf-gold: #FFD700;        /* Change primary gold */
  --sf-gold-2: #E6C200;      /* Change accent gold */
  
  /* Or change the semantic tokens */
  --primary: 51 100% 50%;    /* Gold primary */
  --accent: 51 91% 45%;      /* Gold accent */
}
```

### Changing Branding

In your Navigation component:

```tsx
{/* Logo & Branding */}
<div className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
    <span className="text-primary-foreground font-bold text-sm">SF</span>
  </div>
  <div className="flex flex-col leading-tight">
    <span className="text-xs text-muted-foreground font-medium">
      YourCompany    {/* Change this */}
    </span>
    <span className="font-bold text-base">
      Your Product   {/* Change this */}
    </span>
  </div>
</div>
```

### Adding Footer Credit

```tsx
<footer className="bg-card border-t border-border py-12">
  <div className="max-w-7xl mx-auto px-6">
    {/* Footer content */}
    
    <div className="text-center pt-4 border-t border-border/50 mt-8">
      <p className="text-xs">
        <span className="text-muted-foreground">Created by </span>
        <span className="text-primary font-medium">Gareth Bowers</span>
      </p>
    </div>
  </div>
</footer>
```

---

## ✅ Design Checklist

When setting up a new SmartFlow app, make sure you:

- [ ] Replaced `index.css` with SmartFlow theme
- [ ] Added Inter and JetBrains Mono fonts
- [ ] Configured Tailwind with color variables
- [ ] Added CircuitBackground to hero section
- [ ] Implemented Navigation with SF branding
- [ ] Added ScrollToTop component
- [ ] Used `.glass-card` for feature sections
- [ ] Applied gold gradients to key headings
- [ ] Used `hover-elevate` on interactive elements
- [ ] Included "Created by Gareth Bowers" in footer
- [ ] Added `data-testid` attributes for testing
- [ ] Tested smooth scroll behavior
- [ ] Verified circuit animation runs at 60fps

---

## 🔧 Troubleshooting

### Circuit Animation Not Showing

Make sure:
1. Parent container has `position: relative` and `overflow: hidden`
2. CircuitBackground is first child in the container
3. Your content has `position: relative` and `z-index: 10`

### Glass Cards Not Blurred

Ensure:
1. `backdrop-filter` is supported (modern browsers)
2. Element behind has some color/texture to blur
3. Card is not nested inside another `overflow-hidden` element

### Fonts Not Loading

Check:
1. Font links are in `<head>` of `index.html`
2. CSS variables reference correct font names
3. Browser cache cleared

### Colors Not Applying

Verify:
1. Tailwind is configured with HSL color format
2. CSS variables are defined in `:root` and `.dark`
3. Build process is including the theme CSS

---

## 📖 Additional Resources

- **Full Design Guidelines**: See `SMARTFLOW_DESIGN_SYSTEM.md`
- **Shadcn UI Docs**: https://ui.shadcn.com
- **Tailwind CSS Docs**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

---

## 💡 Tips

1. **Start Simple**: Begin with just the theme CSS and one component
2. **Customize Gradually**: Don't change everything at once
3. **Reuse Patterns**: Use the example components as templates
4. **Test Responsively**: Check mobile, tablet, and desktop views
5. **Maintain Consistency**: Stick to the spacing and color guidelines

---

## 🎉 You're Ready!

Your SmartFlow app is now set up with the luxurious dark gold aesthetic. 

All your SmartFlow apps will now share the same premium design language while remaining unique in their content and purpose.

---

**Created by Gareth Bowers**  
SmartFlowSystems Design System v1.0.0
