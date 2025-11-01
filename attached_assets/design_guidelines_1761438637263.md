# Design Guidelines: SecureAuth Pro - SmartFlow Luxurious Dark Gold Theme

## Design Approach

**Theme:** SmartFlow - Luxurious Dark Gold Aesthetic
**Primary References:** Premium financial tech + Luxury brand aesthetics + Modern glass-morphism
**Design Principle:** High-end, sophisticated investor presentation emphasizing exclusivity, precision, and technical excellence through a dark gold palette

## Core Color Palette

### Primary Colors (SmartFlow Tokens)
- **SF Black:** `#0D0D0D` (0 0% 5%) - Deep black background
- **SF Gold:** `#FFD700` (51 100% 50%) - Primary gold accent
- **SF Gold-2:** `#E6C200` (51 91% 45%) - Secondary gold, slightly darker
- **SF Brown:** `#3B2F2F` - Warm brown accents
- **SF Beige:** `#F5F5DC` - Soft beige for subtle highlights
- **SF White:** `#FFFFFF` - Pure white text

### Usage Guidelines
- **Backgrounds:** Dark black (#0D0D0D) creates premium, focused atmosphere
- **Primary Actions:** Gold (#FFD700) for CTAs, highlights, and interactive elements
- **Text:** White/beige for maximum readability on dark backgrounds
- **Borders/Accents:** Gold at 22-35% opacity for glass-morphism effects
- **Gradients:** Linear gold gradient (Gold → Gold-2) for premium elements

## Typography System

- **Primary Font:** Inter or system-ui for body text
- **Code Font:** JetBrains Mono for technical elements
- **Heading Hierarchy:**
  - H1: Bold, 3xl to 6xl, gold gradient effect for impact
  - H2: Semibold, 2xl to 4xl, white with subtle gold underline
  - H3: Medium, xl to 2xl, white text
  - Body: Regular, base to lg, beige/white (48 10% 98%)
- **Emphasis:** Gold text color for key metrics and value propositions

## Glass-Morphism System

### Glass Card Component
```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.22);
  backdrop-filter: saturate(140%) blur(12px);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: clamp(16px, 2vw, 32px);
}

.glass-card:hover {
  border-color: rgba(230, 194, 0, 0.35);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}
```

### Usage
- Apply to all card components for consistent premium feel
- Use for feature cards, pricing tiers, testimonials
- Maintains visibility over circuit background animation

## Circuit Background Animation

### Implementation
- Animated canvas with 60 moving circuit lines
- Gold wires (rgba(230, 194, 0, 0.28)) for subtle tech aesthetic
- 25% opacity, fixed position behind all content
- Reinforces high-tech authentication theme

### Integration
```tsx
<CircuitBackground />
// Renders as fixed canvas layer at z-0
// All content at z-10 or higher
```

## Layout System

### Spacing Primitives
- **Section Padding:** py-20 to py-32 (desktop), py-12 to py-16 (mobile)
- **Component Gap:** gap-8 for grids, gap-6 for cards
- **Border Radius:** 16px (--sf-radius) for premium rounded corners
- **Blur Intensity:** 12px (--sf-blur) for glass effects

### Container Widths
- Full sections: max-w-7xl
- Text-heavy content: max-w-4xl
- Responsive with px-4 to px-8 horizontal padding

## Component Patterns

### Navigation
- Fixed header with enhanced glass-morphism
- Gold accent on hover for nav links
- Black background with gold border-bottom
- Mobile: Dark overlay with gold-accented hamburger menu

### Hero Section
- Dark background with circuit animation visible
- Gold gradient headline text
- Dual CTAs: Gold primary button + ghost outline button
- Product image with subtle gold glow effect

### Cards
- All use glass-card styling by default
- Gold borders become brighter on hover (22% → 35%)
- Subtle lift animation (translateY(-2px))
- Inner shadow for depth

### Buttons
**Gold Primary:**
```css
.btn--gold {
  color: #0D0D0D;
  background: linear-gradient(90deg, #FFD700, #E6C200);
  border: 1px solid rgba(230, 194, 0, 0.6);
}
.btn--gold:hover {
  background: #E6C200;
}
```

**Ghost/Outline:**
```css
.btn--ghost {
  color: white;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.18);
}
.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.07);
}
```

### Badges & Tags
- Dark background (rgba(0,0,0,0.3))
- Gold border and text
- Backdrop blur for glass effect

## Interactive States

### Hover Effects
- **Cards:** Border brightens, shadow deepens, subtle lift
- **Buttons:** Background shifts to Gold-2, slight scale
- **Links:** Gold underline appears with transition

### Focus States
- Gold ring (ring-gold) at 2px width
- Visible on all interactive elements
- WCAG AA compliant contrast

### Elevation System
- Uses gold tints instead of white overlays
- `--elevate-1`: rgba(255, 215, 0, 0.06)
- `--elevate-2`: rgba(255, 215, 0, 0.14)

## Accessibility

- **Contrast Ratios:** All text meets WCAG AA standards
- **Gold on Dark:** 7:1+ contrast ratio
- **Beige on Dark:** 16:1+ contrast ratio
- **Focus Indicators:** Always visible gold rings
- **Keyboard Navigation:** Full support with skip links

## Animations

**Strategic Use:**
- Circuit background: Continuous subtle motion
- Section reveals: Fade-in with framer-motion
- Card hovers: 200ms transform transitions
- Stat counters: Count-up on viewport enter
- No excessive motion, respects prefers-reduced-motion

## Dark Mode

**Unified Theme:**
- Same palette in light and dark modes
- Dark is the primary aesthetic
- No significant color shifts between modes
- Maintains premium dark gold feel consistently

## Images & Media

### Product Images
- High-quality renders with gold accent lighting
- Subtle glow effects using box-shadow
- PNG with transparency for overlay on dark backgrounds

### Icons
- Lucide React icons in gold color
- 20-24px default size
- Consistent stroke-width across set

### Video Placeholders
- Gold gradient backgrounds
- Play buttons with gold primary color
- Category badges with glass-card styling

## Best Practices

1. **Always use glass-card for containers** over solid backgrounds
2. **Gold sparingly** - Primary actions and key highlights only
3. **Circuit animation** must remain at 25% opacity maximum
4. **Maintain dark aesthetic** - Avoid introducing bright colors
5. **Consistent blur** - 12px backdrop-filter across components
6. **Rounded corners** - 16px border-radius for premium feel
7. **Gold borders** - Use 22-35% opacity for subtle emphasis

## Technical Implementation

### CSS Variables
All colors use HSL format without `hsl()` wrapper:
```css
--primary: 51 100% 50%;
--accent: 51 91% 45%;
--background: 0 0% 5%;
--foreground: 48 10% 98%;
```

### Tailwind Usage
```tsx
<Card className="glass-card hover-elevate">
<Button className="gold-gradient">
<Badge className="bg-card border-gold">
```

### Framer Motion
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
```

## Design Evolution

**From:** Security-focused blue/teal enterprise theme
**To:** Luxurious dark gold premium aesthetic
**Rationale:** Elevated positioning for high-value investor audience, emphasizing exclusivity and sophistication while maintaining technical credibility
