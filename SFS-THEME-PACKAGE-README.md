# SFS Complete Theme Package

**SmartFlow Systems Design System v2.0**

Complete branding, circuit flow animation, and UI components for all SmartFlow Systems projects.

---

## 📦 Package Contents

This theme package includes:

- **`sfs-complete-theme.css`** - Complete CSS theme (14KB)
  - Glass-morphism card system
  - SmartFlow brand colors (black, brown, gold)
  - Premium UI components (buttons, badges, inputs, tables)
  - Responsive utilities
  - Animations and transitions

- **`sfs-circuit-flow.js`** - Animated circuit background (4KB)
  - Golden nodes and connections
  - Performance optimized
  - Visibility detection
  - Auto-resizing canvas

- **`sfs-globals.css`** - Legacy design tokens (8KB)
- **`sfs-theme-config.json`** - JSON design tokens (5KB)

---

## 🚀 Quick Start

### For HTML Projects

Add these lines to your HTML `<head>`:

```html
<!-- SFS Theme CSS -->
<link rel="stylesheet" href="sfs-complete-theme.css">
```

Add circuit canvas to your `<body>`:

```html
<body>
  <!-- Circuit background -->
  <canvas id="circuit-canvas"></canvas>

  <!-- Your app content -->
  <div id="root">
    <!-- Content goes here -->
  </div>

  <!-- Circuit animation -->
  <script src="sfs-circuit-flow.js"></script>
</body>
```

### For React/Vite Projects

Import in your main `index.css` or `App.tsx`:

```tsx
// App.tsx or main.tsx
import './sfs-complete-theme.css'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Load circuit flow script dynamically
    const script = document.createElement('script')
    script.src = '/sfs-circuit-flow.js'
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <canvas id="circuit-canvas"></canvas>
      {/* Your app content */}
    </>
  )
}
```

### For TypeScript Projects

Copy `sfs-circuit-flow.js` to your `src/` folder and rename to `.ts`:

```typescript
// src/effects/circuit-background.ts
export function initSFSCircuitFlow() {
  const canvas = document.getElementById('circuit-canvas') as HTMLCanvasElement
  // ... rest of the circuit flow code
}
```

Then import in your app:

```tsx
import { useEffect } from 'react'
import { initSFSCircuitFlow } from './effects/circuit-background'

function App() {
  useEffect(() => {
    const cleanup = initSFSCircuitFlow()
    return cleanup // Cleanup on unmount
  }, [])

  return (
    <>
      <canvas id="circuit-canvas"></canvas>
      {/* Your content */}
    </>
  )
}
```

---

## 🎨 Using Components

### Glass Cards

```html
<div class="glass-card">
  <h3>Premium Card</h3>
  <p>This card has glassmorphism effects and hover animations.</p>
</div>

<!-- Alternative styles -->
<div class="sfs-glass-card">Content</div>
<div class="sfs-flow-card">Content</div>
```

### Buttons

```html
<!-- Primary gold button -->
<button class="btn btn-gold">Get Started</button>

<!-- Ghost button -->
<button class="btn btn-ghost">Learn More</button>

<!-- With pulse effect -->
<button class="btn btn-gold pulse-on-hover">Sign Up</button>
```

### Typography

```html
<h1 class="text-gold-gradient">SmartFlow Systems</h1>
<p class="text-gold">Premium Business Tools</p>
```

### Badges

```html
<span class="badge">New Feature</span>
<span class="badge">Pro</span>
```

### Inputs

```html
<input type="text" class="input" placeholder="Enter your email">
```

### Alerts

```html
<div class="alert alert-success">Success message!</div>
<div class="alert alert-error">Error occurred</div>
<div class="alert alert-info">Information</div>
```

### Layout

```html
<div class="container">
  <section class="section">
    <h2>Section Title</h2>
    <div class="flex gap-4">
      <div class="glass-card">Card 1</div>
      <div class="glass-card">Card 2</div>
    </div>
  </section>
</div>
```

---

## 🎯 CSS Variables

Access theme colors and values:

```css
.my-component {
  background: var(--sf-black);
  color: var(--sf-gold);
  border-radius: var(--sf-radius);
  box-shadow: var(--shadow-lg);
}
```

Available variables:

- **Colors**: `--sf-black`, `--sf-brown`, `--sf-gold`, `--sf-white`
- **Gradients**: `--sf-gold-grad`
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **Spacing**: `--sf-radius`, `--sf-blur`
- **Elevation**: `--elevate-1`, `--elevate-2`

---

## ⚙️ Circuit Flow Configuration

### Disable Circuit Flow

Remove or comment out the script:

```html
<!-- <script src="sfs-circuit-flow.js"></script> -->
```

### Adjust Circuit Opacity

Modify in CSS:

```css
#circuit-canvas {
  opacity: 0.3; /* Default is 0.4 */
}
```

### Customize Circuit Colors

Edit `sfs-circuit-flow.js`:

```javascript
// Change from gold to another color
ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})` // Blue circuit
```

---

## 📁 File Structure Examples

### Static HTML Site
```
project/
├── index.html
├── sfs-complete-theme.css
├── sfs-circuit-flow.js
└── app.js
```

### React/Vite Project
```
project/
├── public/
│   ├── sfs-complete-theme.css
│   └── sfs-circuit-flow.js
├── src/
│   ├── App.tsx
│   └── index.css (imports sfs-complete-theme.css)
└── index.html
```

### Express Static Server
```
project/
├── public/
│   ├── sfs-complete-theme.css
│   ├── sfs-circuit-flow.js
│   └── index.html
└── server.js
```

---

## 🔧 Troubleshooting

### Circuit not showing

1. Check canvas element exists:
   ```html
   <canvas id="circuit-canvas"></canvas>
   ```

2. Verify script is loaded:
   ```html
   <script src="sfs-circuit-flow.js"></script>
   ```

3. Check CSS is applied:
   ```css
   #circuit-canvas {
     z-index: 0; /* Must be 0 or positive */
     opacity: 0.4;
   }
   ```

### Content behind circuit

Ensure main content has higher z-index:

```css
#root,
.app,
main {
  position: relative;
  z-index: 1;
}
```

### Glass cards not styled

Import theme CSS before custom styles:

```html
<link rel="stylesheet" href="sfs-complete-theme.css">
<link rel="stylesheet" href="custom.css">
```

---

## 📱 Responsive Design

The theme is fully responsive with breakpoints at:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Components automatically adjust sizing using `clamp()` functions.

---

## 🎭 Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ⚠️ IE11 (limited support, no backdrop-filter)

---

## 📊 Performance

- **CSS bundle size**: 14KB (5KB gzipped)
- **JS bundle size**: 4KB (2KB gzipped)
- **Circuit FPS**: 60fps on modern devices
- **Animation pause**: Auto-pauses when tab is hidden

---

## 🔄 Migration Guide

### From old `sfs-globals.css`

Replace:

```html
<!-- OLD -->
<link rel="stylesheet" href="sfs-globals.css">
```

With:

```html
<!-- NEW -->
<link rel="stylesheet" href="sfs-complete-theme.css">
```

Class names remain compatible!

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#0D0D0D` | Primary background |
| Brown | `#3B2F2F` | Secondary elements |
| Gold | `#FFD700` | Brand accent, CTAs |
| Gold 2 | `#E6C200` | Hover states |
| White | `#FFFFFF` | Text on dark |

---

## 📝 License

© 2025 SmartFlow Systems. All rights reserved.

---

## 🆘 Support

- **Issues**: Contact SmartFlow Systems team
- **Updates**: Check repo for latest version
- **Docs**: See `SFS-DESIGN-SYSTEM.md` for detailed design tokens

---

**Version**: 2.0
**Last Updated**: 2025-11-02
**Deployed To**: All SFS repositories ✅
