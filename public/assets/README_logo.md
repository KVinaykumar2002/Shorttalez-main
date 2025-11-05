# Short Talez Animated Logo Integration Guide

## Quick Start

1. **Copy the assets** to your `public/assets/` directory:
   - `short-talez-logo.lottie.json`
   - `short-talez-logo.svg` 
   - `short-talez-logo.png`
   - `short-talez-logo@2x.png`
   - `short-talez-logo-inline.svg`
   - `short-talez-logo-style.css`

2. **Add the logo** to any page by copying `integration-snippet.html` content where you want the logo to appear.

## Basic Usage

```html
<!-- Simple integration - just paste this where you want the logo -->
<div id="short-talez-logo-root"></div>

<!-- The JavaScript in integration-snippet.html handles everything automatically -->
```

## Configuration Options

### Size Control
```html
<!-- Small (200px wide) -->
<div id="short-talez-logo-root" data-size="small"></div>

<!-- Medium (400px wide) - default -->
<div id="short-talez-logo-root" data-size="medium"></div>

<!-- Large (600px wide) -->
<div id="short-talez-logo-root" data-size="large"></div>
```

### Animation Control
```html
<!-- Play once, don't loop -->
<div id="short-talez-logo-root" data-loop="false"></div>

<!-- Don't start automatically -->
<div id="short-talez-logo-root" data-autoplay="false"></div>

<!-- Manual control example -->
<div id="short-talez-logo-root" data-autoplay="false"></div>
<button onclick="window.ShortTalezLogo.playLogo()">Play Logo</button>
<button onclick="window.ShortTalezLogo.stopLogo()">Stop Logo</button>
```

## Animation Sequence

The logo animation follows this exact timing:

1. **Intro (0-600ms)**: Film strip sweeps in from left with gradient background fade
2. **Logo Build (600-1400ms)**: Film strip frames slide in, scene icons flicker with 60ms stagger
3. **Text Reveal (1400-1800ms)**: "Short" types in from left, "Talez" slides up with cinematic sheen
4. **Accent (1800-2300ms)**: Spotlight flare with confetti microbursts
5. **Idle Loop (2300ms+)**: Gentle breathing scale (±1.5%) and subtle film strip scroll

## Performance & Loading

### Lazy Loading
The logo automatically lazy loads when it enters the viewport using IntersectionObserver. This prevents unnecessary resource loading on pages where the logo isn't visible.

### Fallback Hierarchy
1. **Lottie JSON** (best quality, 2.3s animated sequence)
2. **Animated SVG** (good quality, CSS animations)
3. **Static PNG** (high-res fallback)
4. **Text fallback** (if all assets fail to load)

### When to Use Each Format

- **Lottie**: Use for hero sections, landing pages, important brand moments
- **SVG**: Use for navigation headers, repeated elements
- **PNG**: Use for email signatures, social media, quick loading scenarios
- **Inline SVG**: Use for favicons, meta tags, small inline uses

## Accessibility

### Reduced Motion Support
The logo automatically detects `prefers-reduced-motion: reduce` and:
- Switches to static PNG fallback
- Disables all animations
- Maintains visual brand presence

### Screen Reader Support
- Uses `aria-label="Short Talez logo"`
- Sets `aria-hidden="true"` during loading
- Updates to `aria-hidden="false"` when ready

### Testing Reduced Motion
```javascript
// Force reduced motion for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Integration Examples

### In React Components
```jsx
function Header() {
  return (
    <header>
      <div id="short-talez-logo-root" data-size="medium"></div>
      {/* Rest of your header */}
    </header>
  );
}
```

### In HTML Templates
```html
<nav class="navbar">
  <div id="short-talez-logo-root" data-size="small"></div>
  <!-- Rest of navigation -->
</nav>
```

### Multiple Instances
Each instance needs a unique ID:
```html
<!-- Header logo -->
<div id="short-talez-logo-root" data-size="small"></div>

<!-- Hero logo -->
<div id="short-talez-logo-hero" data-size="large" data-loop="false"></div>
```

## JavaScript API

### Control Methods
```javascript
// Play the animation
window.ShortTalezLogo.playLogo();

// Stop the animation
window.ShortTalezLogo.stopLogo();

// Toggle looping (Lottie only)
window.ShortTalezLogo.setLoop(true); // or false
```

### Event Handling
```javascript
// Wait for logo to be ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.ShortTalezLogo.instance) {
      console.log('Logo is ready!');
    }
  }, 1000);
});
```

## CSS Customization

### Color Theming
Override CSS variables in your own stylesheets:
```css
:root {
  --st-logo-primary: hsl(200, 70%, 65%); /* Change gold to blue */
  --st-logo-secondary: hsl(0, 0%, 95%); /* Slightly off-white */
}
```

### Size Customization
```css
#short-talez-logo-root[data-size="custom"] {
  width: 300px;
  height: 90px;
}
```

## Troubleshooting

### Logo Not Appearing
1. Check that assets are in `/public/assets/` directory
2. Verify CSS file is loading (check network tab)
3. Ensure container has unique ID

### Animation Not Working
1. Check browser console for JavaScript errors
2. Verify Lottie library is loading from CDN
3. Test with `data-autoplay="true"` explicitly set

### Performance Issues
1. Use smaller size variants when possible
2. Set `data-autoplay="false"` for below-the-fold logos
3. Consider using PNG fallback for mobile devices

### Accessibility Issues
1. Test with screen readers
2. Verify reduced motion behavior
3. Check color contrast in high contrast mode

## File Sizes

- `short-talez-logo.lottie.json`: ~45KB (optimized)
- `short-talez-logo.svg`: ~8KB (gzipped: ~3KB)
- `short-talez-logo.png`: ~25KB
- `short-talez-logo@2x.png`: ~65KB
- `short-talez-logo-style.css`: ~3KB
- `integration-snippet.html`: ~8KB

## Browser Support

- **Lottie**: Chrome 45+, Firefox 40+, Safari 10+, Edge 79+
- **SVG Animations**: Chrome 45+, Firefox 40+, Safari 9+, Edge 12+
- **PNG Fallback**: All browsers
- **IntersectionObserver**: Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+

Polyfills are loaded automatically when needed.