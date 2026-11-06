# Rite & Grain (`riteandgrain.com`)

Astro static site for **Rite & Grain** (`https://riteandgrain.com`), featuring ceramic studio calculators and workshop tools.

## Workshop Tools (`src/pages/tools/`)

- **Shrinkage Calculator (`src/pages/tools/shrinkage.astro`):**
  - Forward (wet -> fired: $L_{\text{fired}} = L_{\text{wet}}(1 - s)$) and reverse (target fired -> thrown oversize: $L_{\text{wet}} = L_{\text{fired}} / (1 - s)$) linear calculations across 35 Georgies and Laguna clay bodies (`src/data/clay.ts`) at Cones `04`, `5`, and `6`, or custom percentage.
- **Fluid Volume Calculator (`src/pages/tools/fluid-volume.astro`):**
  - **Target Capacity mode:** Solves for exact interior and exterior frustum height from finished mouth diameter, base diameter, perpendicular wall thickness ($w_{\text{radial}} = w\sqrt{1 + m^2}$), floor thickness ($z = \text{baseT}$ interpolation), and target fluid volume (`fl oz`, `mL`, `L`, `cup`), then scales by $1/(1 - s)$ for throwing dimensions.
  - **Thrown Piece mode:** Predicts fired capacity ($V_{\text{fired}} = V_{\text{thrown}}(1 - s)^3$) from wet thrown measurements.
- **Throwing Weight Calculator (`src/pages/tools/throwing-weight.astro`):**
  - Computes wet clay mass to wedge (`g`, `oz`, `lb`, `kg`) for Mugs, Bowls, Plates, Cylindrical Jars, and Two-Frustum Vases using $1.85\text{ g/cm}^3$ wet stoneware density, volumetric shrinkage factor $(1/(1-s))^3$, sequential throw and trim waste allowances, handle presets, and fitted lid + knob allowances.

## Commands

```bash
npm install       # Install dependencies
npm test          # Run the workshop math & geometry test suite (node --test tests/*.test.mjs)
npm run dev       # Start local Astro dev server
npm run build     # Build static site into dist/
npm run preview   # Preview built static site locally
```
