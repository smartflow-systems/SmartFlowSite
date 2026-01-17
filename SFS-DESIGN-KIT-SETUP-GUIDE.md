# SFS Design Kit - Setup Guide

Reference guide for integrating the SFS design system into Replit apps.

---

## 🚀 ULTRA QUICK - Choose Your Method

### Method 1: Auto Script (Easiest - 30 seconds)
```bash
cd /path/to/your/new-app
bash ../sfs-socialpowerhouse/sfs-design-kit/setup.sh
```
✅ Copies everything automatically. Done!

### Method 2: Replit Copy-Paste (Super Easy - 1 minute)
1. Open **SFS Social PowerHouse** project
2. Right-click `sfs-design-kit` folder → **Copy**
3. Switch to your other app
4. Right-click root folder → **Paste**
5. Done!

### Method 3: Manual Copy (Traditional - 5 minutes)
Follow "Quick Setup" section below if you prefer step-by-step.

---

## Quick Setup (5 minutes)

### Step 1: Copy the Design Kit Folder
Copy the entire `sfs-design-kit` folder to your new project's root directory.

### Step 2: Replace Your CSS
Replace your `client/src/index.css` with the contents of `sfs-design-kit/styles/sfs-theme.css`.
Or, if you want to keep some of your existing styles, copy the contents and merge them.

### Step 3: Copy Components
Copy the component files you need from `sfs-design-kit/components/` to your `client/src/components/` folder:
- `SFSHamburgerMenu.tsx` - The hamburger menu with slide-in sidebar
- `GlassCard.tsx` - Glassmorphism card component
- `GoldenButton.tsx` - Golden gradient button
- `SFSNavigation.tsx` - Full navigation header with hamburger

### Step 4: Set Up Your Menu Items
```tsx
const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
  { label: "Profile", href: "/profile" },
];
```

### Step 5: Use the Navigation
```tsx
import SFSNavigation from "@/components/SFSNavigation";

function App() {
  return (
    <div className="min-h-screen bg-sfs-black">
      <SFSNavigation 
        menuItems={menuItems}
        appName="My SFS App"
        navLinks={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
      />
      <main className="pt-16">
        {/* Your app content */}
      </main>
    </div>
  );
}
```

---

## Components Reference

### SFSHamburgerMenu
The slide-in sidebar menu.

**Props:**
- `menuItems` - Array of `{ label: string, href: string }`
- `appName` - App name shown in sidebar header
- `appSubtitle` - Subtitle shown below app name

### GlassCard
Glassmorphism card with gold accents.

**Props:**
- `children` - Content inside the card
- `className` - Additional CSS classes
- `hover` - Enable hover animation (default: true)

### GoldenButton
Primary action button with gold gradient.

**Props:**
- `children` - Button text/content
- `onClick` - Click handler
- `type` - "button" | "submit" | "reset"
- `disabled` - Disable the button
- `className` - Additional CSS classes

### SFSNavigation
Complete navigation header with hamburger menu.

**Props:**
- `menuItems` - Array for hamburger sidebar
- `appName` - Logo text
- `navLinks` - Desktop nav links
- `ctaText` - CTA button text
- `ctaHref` - CTA button link
- `showCta` - Show/hide CTA button

---

## CSS Classes You Can Use

### Layout Classes
- `glass-card` - Apply glassmorphism to any element
- `circuit-bg` - Animated circuit board background
- `sidebar-item` - Styled sidebar link
- `custom-scrollbar` - Gold-styled scrollbar

### Animation Classes
- `animate-fade-in` - Fade in animation
- `animate-slide-up` - Slide up from below
- `animate-scale-in` - Scale up animation
- `animate-slide-in-left` - Slide from left
- `animate-slide-in-right` - Slide from right
- `animate-bounce-in` - Bouncy entrance
- `animate-pulse-glow` - Pulsing gold glow
- `animate-shimmer` - Shimmer effect
- `page-transition` - Page load animation
- `stagger-animation` - Staggered children animations

### Hover Effects
- `hover-lift` - Lift up on hover with shadow
- `hover-glow` - Gold glow on hover

### Color Palette
- **Black**: `#0D0D0D`
- **Brown**: `#3B2F2F`
- **Gold**: `#FFD700`
- **Beige**: `#F5F5DC`

---

## Keeping Apps in Sync

When you update the design kit:
1. Make your changes in the `sfs-design-kit` folder
2. Copy the updated files to each of your apps
3. Test that everything still works

**Tip:** Keep a "master" version of the design kit in one project (like SFS Social PowerHouse) and copy from there to other apps.

---

## File Structure

```
sfs-design-kit/
├── components/
│   ├── index.ts
│   ├── GlassCard.tsx
│   ├── GoldenButton.tsx
│   ├── SFSHamburgerMenu.tsx
│   └── SFSNavigation.tsx
├── styles/
│   └── sfs-theme.css
├── utils/
│   └── (future utilities)
└── SETUP-GUIDE.md
```

---

Made with care by SmartFlow Systems - boweazy 2025
