## 2025-10-26 - Amplify circuit glow behind project cards

### VERIFY
- Open `public/index.html` in a browser and verify the golden circuit lines emit a subtle glow and sparkle behind the marketing cards without obscuring content.
- Focus the Projects section and confirm the cards remain translucent enough that the animation is visible through them.
- Toggle the OS "reduce motion" setting; the animation should still respect it by pausing and hiding the canvas.

### UNDO
- In `public/styles.css`, revert the `.circuit` and `.project-card` rules to their previous opacity, filter, and box-shadow values.
- In `public/app.js`, remove the glow/shadow enhancements inside `draw()` that set `shadowColor`, `shadowBlur`, `globalCompositeOperation`, and sparkle nodes.
- Rebuild or reload the page to ensure the original circuit rendering appears.

## 2025-10-26 - Circuit flow background

### VERIFY
- Open `public/index.html` in a browser and confirm a subtle golden circuit animation flows behind all sections without obscuring content.
- Resize the browser window and ensure the canvas animation scales without stretching or leaving gaps.
- Enable the system "reduce motion" accessibility setting and verify the circuit canvas hides automatically.

### UNDO
- Remove the `<canvas id="circuit-bg">` element from `public/index.html`.
- Delete the `initCircuitBackground` helper and its invocation from `public/app.js`.
- Remove the `.circuit` and related layering rules from `public/styles.css`.
