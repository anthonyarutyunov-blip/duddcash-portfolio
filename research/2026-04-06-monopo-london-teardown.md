# Site Teardown: Monopo London

**URL:** https://monopo.london
**Built by:** Monopo (in-house)
**Platform:** Nuxt.js 2 (Vue SSR) with Pixi.js WebGL layer
**Date analyzed:** 2026-04-06

---

## Tech Stack (Confirmed from Source)

| Technology | Evidence | Purpose |
|---|---|---|
| Nuxt.js 2 (Vue 2.6.14) | `__nuxt` wrapper, `nuxt-link-*` classes, `/_nuxt/` bundles | SSR framework, routing, page transitions |
| Pixi.js | `c-PixiApp`, `c-PixiImage`, `new this.$PIXI.Application` | WebGL canvas for image effects, displacement filters |
| GSAP 3 + ScrollTrigger + SplitText | `r.a.registerPlugin(F.a)` (SplitText), `r.a.registerPlugin(c.a)` (ScrollTrigger) | All animations, scroll-scrubbed effects, text reveals |
| Lenis | `.lenis` CSS classes, `new E` Lenis instance, `lenis.raf()` | Smooth scrolling |
| BulgePinchFilter | `new this.$BulgePinchFilter` | Scroll-velocity-driven image distortion |
| RGBSplitFilter | `new this.$RGBSplitFilter([-2,2],[1,1],[2,-2])` | Chromatic aberration on images |
| WebFontLoader | `e.load({custom:{families:["Roobert","Noto Sans CJK JP"]}})` | Font loading with ready callback |
| Custom `monopo-gradient` element | In HTML as `<monopo-gradient>` with color/displacement params | WebGL animated gradient backgrounds |
| Vuex | State management in bundle | Global state (scroll, cursor, nav, page-ready) |

---

## Design System

### Colors

| Usage | Value |
|---|---|
| Primary background (homepage) | `#000` (pure black) |
| Primary background (inner pages) | `#fff` (white) |
| Primary text (on white) | `#000` |
| Primary text (on black) | `#fff` |
| Muted text / labels | `#7f7f7f` |
| Footer secondary gray | `#666970` |
| Light borders (forms) | `#ebebeb` |
| Error | `red` (#ff0000) |
| Cursor info circle | `#fff` bg, `#000` text |
| Nav burger dot (desktop) | `#fff` bg circle |

**Key insight:** The site uses almost NO color. It's black, white, and gray. All visual richness comes from the WebGL gradient overlays and project imagery. The restraint is the design.

### Typography

| Role | Font Family | Weight | Letter-spacing | Sizes (desktop / mobile) |
|---|---|---|---|---|
| Body | Roobert | 400 | normal | 16px base |
| H1 (hero) | Roobert | 400 | normal | max(5.99vw, 47px) / max(12.53vw, 47px) — line-height: 0.934 |
| H2 | Roobert | 400 | normal | max(3.125vw, 25px) / max(6.67vw, 25px) — line-height: 1.087 |
| H3 (project titles) | Roobert | 400 | normal | max(2.34vw, 24px) / max(6.4vw, 24px) — line-height: 1.2 |
| H4 | Roobert | 400 | normal, uppercase | max(1.82vw, 23px) / max(6.13vw, 23px) |
| H5 | Roobert | 400 | normal | max(1.56vw, 18px) / max(4.8vw, 18px) |
| H6 / Labels | Roobert | 800 | 0.15em, uppercase | max(0.68vw, 12px) / max(3.47vw, 12px) |
| Body text | Roobert | 400 | normal | max(0.83vw, 14px) / max(3.73vw, 14px) |
| Large text | Roobert | 400 | normal | max(0.99vw, 17px) / max(4.53vw, 17px) |
| Small text | Roobert | 400 | normal | max(0.68vw, 12px) / max(3.2vw, 12px) |
| Button text | Roobert | — | 0.04em, uppercase | max(0.68vw, 12px) |
| Links (tertiary) | Roobert | 800 | 0.15em, uppercase | max(0.68vw, 12px) |

**Font files:**
- `/fonts/Roobert-Regular.woff2`, `.woff` (400)
- `/fonts/Roobert-RegularItalic.woff2`, `.woff` (400 italic)
- `/fonts/Roobert-SemiBold.woff2`, `.woff` (600)
- `/fonts/Roobert-SemiBoldItalic.woff2`, `.woff` (600 italic)
- `/fonts/Roobert-Bold.woff2`, `.woff` (800)
- `/fonts/Roobert-BoldItalic.woff2`, `.woff` (800 italic)
- `/fonts/NotoSansCJKjp-Regular.woff2`, `.woff` (400)

**Key insight:** All font sizes use `max(vw, px)` — fluid scaling with a minimum floor. NOT `clamp()`. The headings are HUGE (h1 is ~6vw = ~86px on 1440). Weight 400 on headings — it's the size that creates hierarchy, not boldness.

### Spacing System

- Container padding: `3.9vw` (desktop), `24px` (tablet), `3.65vw` (mobile)
- Grid gutters: `0.54vw` (desktop), `6px` (tablet/mobile)
- Grid: 24-column system (also 22, 20, 18, etc. column variants)
- Component spacing is generous — `200px` footer top margin, `85px` footer inner padding
- Tight line-heights on headings (0.934 on h1!) — letters almost touching

### Responsive Approach

| Breakpoint | Target |
|---|---|
| `max-width: 767px` | Mobile — single column, smaller text, simplified nav |
| `max-width: 979px` | Tablet — adjusted grid, reduced padding |
| `min-width: 1441px` | Large desktop — refined grid gaps |

### Easing Curves (used everywhere)

| Name | Value | Feel |
|---|---|---|
| easeOutQuart | `cubic-bezier(.165,.84,.44,1)` | Smooth deceleration — THE signature easing, used on 90% of transitions |
| easeInQuart | `cubic-bezier(.895,.03,.685,.22)` | Smooth acceleration — used for exit animations |
| easeInOutQuart | `cubic-bezier(.77,0,.175,1)` | Symmetric — used for page transitions, nav slide |
| easeInOutSine | `cubic-bezier(.455,.03,.515,.955)` | Gentle — used for table row reveals |

---

## Effects Breakdown

| Effect | Implementation | Complexity | Cloneable without WebGL? |
|---|---|---|---|
| Animated gradient background | Custom `monopo-gradient` WebGL element with color params, displacement, noise | High | Use CSS gradients with animation instead |
| Image displacement on scroll | Pixi.js DisplacementFilter + BulgePinchFilter driven by scroll velocity | High | Use CSS `scale`/`skew` transforms on scroll instead |
| RGB chromatic aberration | Pixi.js RGBSplitFilter `[-2,2],[1,1],[2,-2]` | Med | Skip or use CSS filter hue-rotate on hover |
| Circular image mask reveal | Pixi.js Graphics circle mask following mouse, scales from 0 | Med | Use CSS `clip-path: circle()` with JS |
| Sticky scroll project showcase | Vanilla JS sticky positioning + scroll progress → title swap + ruler indicator | Med | Yes — IntersectionObserver + CSS |
| SplitText line reveals | GSAP SplitText wraps lines in spans, staggers opacity/translateY | Med | Yes — manual span wrapping + CSS transitions |
| Parallax objects | `(smoothScroll - offsetY) * ratio` applied as translateY | Low | Yes — simple scroll multiplier |
| Custom magnetic cursor | Circle follows mouse with GSAP lerp, scales up on interactive elements | Med | Yes — GSAP or CSS transitions on fixed div |
| Page transition overlay | Full-screen div with gradient, opacity animate in/out on route change | Low | Yes — CSS transitions |
| Smooth scrolling | Lenis library init | Low | Yes — `npm install lenis` |
| Hamburger → X animation | Three lines, CSS transform rotate + translateX on `.is-active` | Low | Yes — pure CSS |
| Button hover circle expand | `::before` pseudo-element circle, scales from off-screen on hover | Low | Yes — pure CSS |
| Link underline reveal | `::before` with `scaleX(0)` → `scaleX(1)` on hover, transform-origin: left | Low | Yes — pure CSS |
| Scroll-based nav visibility | `scrollTop > halfHeight` toggles `.is-visible` on nav burger | Low | Yes — simple scroll listener |
| Staggered table row lines | `::after` pseudo on `<tr>`, `scaleX(0→1)` with incrementing delay per row | Low | Yes — pure CSS with nth-child delays |

---

## Implementation Details

### 1. Sticky Scroll Project Showcase (The Homepage Hero Pattern)

This is the most distinctive interaction on the homepage. Projects are stacked full-height sections. As you scroll through them, a sticky sidebar shows the current project title with a ruler progress indicator.

**How it works:**
1. Multiple `.c-Home-project` sections, each `height: 100vh`
2. A `.c-Home-sticky` element positioned `position: absolute` (switches to `fixed` on touch)
3. As scroll position passes each project section boundary, the title swaps with a translateY transition
4. Active title gets class `.is-active` (opacity 1), exiting gets `.is-prev` (translateY: -40px), entering gets `.is-next` (translateY: 40px)
5. A ruler element (`.c-Home-ruler`) with tick marks tracks progress via cursor translateY

**Title swap CSS:**
```css
.c-Home-sticky-titles-item {
  position: absolute; top: 0; left: 0;
  opacity: 0;
  transform: translateZ(0);
  transition: transform .4s cubic-bezier(.895,.03,.685,.22),
              opacity .4s cubic-bezier(.895,.03,.685,.22);
}
.c-Home-sticky-titles-item.is-active {
  opacity: 1;
  transition: transform .8s cubic-bezier(.165,.84,.44,1) .4s,
              opacity .8s cubic-bezier(.165,.84,.44,1) .4s;
}
.c-Home-sticky-titles-item.is-prev { transform: translateY(-40px); }
.c-Home-sticky-titles-item.is-next { transform: translateY(40px); }
```

**Key insight:** Exit is fast (0.4s, easeIn), enter is slow with delay (0.8s + 0.4s delay, easeOut). This creates the feeling of the old title snapping away and the new one gently settling in.

### 2. Pixi.js Image Effects (Scroll-Velocity Distortion)

**How it works:**
1. A fixed Pixi.js canvas sits on top of the page (`position: fixed; pointer-events: none`)
2. Project images are rendered as Pixi sprites, not `<img>` tags (the `<img>` tags are hidden fallbacks for touch/no-JS)
3. On scroll, velocity is calculated and clamped: `delta = clamp(Math.abs(velocity)/2000, 0, 0.3)`
4. This delta drives a BulgePinchFilter strength value → images subtly warp as you scroll fast
5. DisplacementFilter adds organic distortion, RGBSplitFilter adds chromatic aberration

**Simplified recreation without Pixi.js:**
```css
.project-image {
  transition: transform 0.6s cubic-bezier(.165,.84,.44,1);
}
.project-image.is-scrolling {
  transform: scaleY(1.02) skewY(1deg);
  filter: blur(0.5px);
}
```
Not as premium but captures the "velocity distortion" feel.

### 3. Button Hover Circle Expand

```css
.t-btn-primary {
  position: relative;
  padding: 14px 14px 13px 24px;
  color: #fff;
  border-radius: 42px;
  border: 1px solid #fff;
  overflow: hidden;
  transition: color .6s cubic-bezier(.165,.84,.44,1);
}
.t-btn-primary:before {
  content: "";
  position: absolute;
  top: 50%; left: 50%;
  width: 60px; height: 60px;
  border-radius: 30px;
  background: #fff;
  transition: transform .6s cubic-bezier(.165,.84,.44,1);
  transform: translate(-150%, 50%) translateZ(0); /* hidden off to side */
}
.t-btn-primary:hover {
  color: #000;
}
.t-btn-primary:hover:before {
  transform: translate(-50%, -50%) scale(4) translateZ(0); /* expands to fill */
}
```

**Key insight:** The circle starts translated off-screen and scaled small. On hover it centers AND scales 4x to fill the button. The text color inverts via transition. Simple, but feels luxurious because of the easing.

### 4. Tertiary Link Hover (Arrow + Underline)

```css
.t-link-tertiary-label:before {
  content: "";
  position: absolute; bottom: 0; left: 0;
  width: 100%; height: 1px;
  background: currentColor;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform .6s cubic-bezier(.165,.84,.44,1);
}
.t-link-tertiary:hover .t-link-tertiary-icon {
  transform: translateX(3px);
}
.t-link-tertiary:hover .t-link-tertiary-label:before {
  transform: scaleX(1);
}
```

### 5. Magnetic Cursor

```javascript
// Mouse enters interactive element
onEnter(type, event, options) {
  this.activeClasses.push("is-cursor-" + type);
  if (type === "magnetic") {
    this.isMagnetic = true;
    this.bounds = options.currentTarget.getBoundingClientRect();
  }
}

// Per-frame update — element subtly follows cursor within bounds
targetX = bounds.left + bounds.width/2
  + (clientX - bounds.left - bounds.width/2) / bounds.width * maxDisplacement;
```

---

## Assets Needed to Recreate

1. **Font:** Roobert is a commercial font by Display Foundry (~$50-150). Alternative: Inter (already in use on Duddcash) works well for the same clean, geometric sans-serif feel.
2. **Project images:** Large, high-quality hero shots (16:10 aspect ratio, ~1900x1188px). Use real portfolio work.
3. **SVG icons:** Arrow icons (→, ↗, scroll arrow), footer circles decorative mark
4. **Noise/grain texture:** Not used by Monopo, but could enhance the dark Duddcash aesthetic

---

## What to Steal for Duddcash (Practical Adaptation)

### The Monopo patterns that map to your site:

| Monopo Pattern | Duddcash Adaptation |
|---|---|
| Black bg, white text, zero decoration | Already doing this — lean harder into it |
| HUGE h1 hero text (~6vw), weight 400 | Scale up your hero headline, use lighter weight |
| `max(vw, px)` fluid typography | Replace your `clamp()` approach with this |
| Ultra-tight heading line-height (0.934) | Tighten your headings — currently at 1.2 |
| Generous whitespace, minimal elements | Strip more out — your homepage has too many sections |
| Sticky scroll project showcase | Could replace your Featured Work grid with this |
| Button circle-expand hover | Direct port — pure CSS, works with your stack |
| Link underline-reveal hover | Direct port — pure CSS |
| Smooth scroll (Lenis) | Can add via `npm install lenis` |
| Scroll-velocity image effects | Simplified CSS version (scale + skew on scroll) |
| Category labels as small uppercase text | Already doing this on project cards |
| "Discover all projects" CTA at bottom of showcase | Map to your "View All" link |
| Footer: big headline CTA + address + socials + nav | Your footer needs this treatment |

### What NOT to copy:

- Pixi.js WebGL canvas — overkill for your stack, massive bundle size
- Custom gradient element — requires WebGL shader code
- 24-column grid — your simple grid works fine
- SplitText — requires GSAP premium plugin ($$$)

---

## Build Plan for Duddcash Adaptation

### NPM Packages to Add
```bash
npm install lenis gsap
```

### Priority Changes (Homepage)

**1. Typography overhaul** — Make headings massive and tight
- h1: `max(6vw, 47px)`, line-height: 0.94, weight: 400
- Use `max()` instead of `clamp()` for all type sizes

**2. Hero section** — Full viewport, centered text, minimal
- Kill the subtitle paragraph or make it very small/muted
- Add Lenis smooth scroll
- Add scroll-down indicator at bottom

**3. Project showcase** — Replace grid with scroll-through showcase
- Full-width images, one at a time
- Sticky sidebar with project title + category
- Or: keep grid but make cards much larger (full-width alternating)

**4. Button + link hovers** — Port the circle-expand and underline-reveal CSS

**5. Footer** — Big "Let's work together" headline, contact email, address columns, social links, nav repeat

**6. Animations** — Use `cubic-bezier(.165,.84,.44,1)` as your signature easing everywhere
