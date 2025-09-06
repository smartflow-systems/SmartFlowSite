# SmartFlow Premium Design System - Replit Agent Prompt

Use this prompt to apply the exact same premium design system to your other SMS/automation projects:

## EXACT PROMPT TO USE:

---

**Transform this project to match the SmartFlow premium design system with these EXACT specifications:**

**🎨 COLOR SCHEME (EXACT VALUES):**
- Primary background: `#0b0b0b` (dark brown/black)
- Secondary backgrounds: `rgba(20,17,15,.7)` for glass panels
- Gold accent: `#d4af37` (primary gold)
- Bright gold: `#ffdd00` (highlights and buttons)
- Text colors: White primary, `rgba(233,230,223,0.8)` muted

**🌟 VISUAL EFFECTS TO IMPLEMENT:**

**1. Circuit Board Background Animation:**
- Flowing circuit board with golden nodes and connections
- Data pulses traveling along circuit paths
- 120 slow-moving stars that drift naturally across the screen
- Glowing nodes with pulsing animation
- Auto-generated based on screen size (responsive)

**2. Interactive Sparkles System:**
- Sparkles throughout entire site, not just background
- Mouse-responsive sparkles that appear when moving cursor
- Click to create sparkle bursts
- Multi-layered glow effects with different sizes
- Twinkling animation with golden colors

**3. Ultra-Realistic Glassmorphism:**
Apply to ALL content containers (navigation, cards, sections, buttons):
```css
background: linear-gradient(145deg, rgba(20,17,15,.75), rgba(11,11,11,.6));
backdrop-filter: saturate(180%) blur(20px) brightness(1.06);
border: 1px solid rgba(212,175,55,.35);
border-top: 1px solid rgba(255,255,255,.22);
border-left: 1px solid rgba(255,255,255,.12);
border-radius: 20px;
box-shadow: 
  0 16px 64px rgba(0,0,0,.4),
  inset 0 1px 0 rgba(255,255,255,.18),
  inset 0 -1px 0 rgba(0,0,0,.12),
  0 0 0 1px rgba(212,175,55,.12);
```

**4. Enhanced Button Effects:**
- Glass buttons with shimmer sweep animations
- Hover effects with light rays moving across buttons
- Enhanced glow effects on hover
- Golden gradient buttons for primary actions

**5. Performance Optimizations:**
- Disable animations on mobile devices (< 768px width)
- Pause animations when browser tab is hidden
- Smooth 60fps animations with requestAnimationFrame

**🛠️ TECHNICAL REQUIREMENTS:**

**File Structure to Create:**
1. `static/js/stars.js` - Circuit board and star animation system
2. `static/js/sparkles.js` - Interactive sparkle particle system
3. Enhanced `styles.css` with glassmorphism effects
4. Canvas elements for background animations

**HTML Canvas Setup:**
- Add canvas elements with proper z-index layering
- Circuit board canvas (z-index: -1, behind content)
- Sparkles canvas (z-index: 10, above content but below UI)

**CSS Properties to Apply:**
- All containers: glassmorphism styling with backdrop-filter
- Smooth transitions: `transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)`
- Enhanced hover states with transform and glow effects
- Proper border gradients and inset shadows

**JavaScript Features:**
- Circuit board with 60+ nodes and 110+ connections
- Data pulses traveling along circuit paths at random intervals
- 120 stars moving very slowly (speed: 0.1-0.4) with subtle drift
- Interactive sparkles responding to mouse movement and clicks
- Performance monitoring and mobile device detection

**🎯 EXACT VISUAL RESULTS:**
- Dark sophisticated theme with premium gold accents
- Every content area appears as frosted glass floating above animated background
- Subtle sparkles twinkling throughout the interface
- Slow-moving stars drifting naturally across the screen
- Circuit board with golden data pulses flowing between nodes
- Buttons with glass effects and light sweep animations
- Professional high-end tech company aesthetic

**📱 RESPONSIVE BEHAVIOR:**
- Full animations on desktop (>768px)
- Simplified/disabled animations on mobile for performance
- Maintain glass effects on all screen sizes
- Proper touch handling for mobile devices

**Apply these effects to ALL content containers: navigation, hero sections, project cards, testimonials, pricing cards, forms, and buttons. The end result should look like a premium tech company website with magical floating glass panels and subtle animated effects.**

---

## Additional Context:
This design system creates a premium Apple Store-like glass effect combined with magical tech animations. Perfect for automation/AI/SMS businesses that want to convey high-end technological sophistication.

**Performance Note:** All animations are optimized and will automatically disable on mobile devices to ensure smooth performance across all platforms.