# Main product section

Figma: https://www.figma.com/design/XfCycCgnXl5JM43j8nNvF0/Toasted-UI--Copy-?node-id=372-3526

Rebuilds `sections/product.liquid` (currently the Skeleton-theme placeholder) into the full PDP
layout: sticky gallery + thumbnails on the left, product details/purchase panel on the right.
Follows the Tailwind-utility convention established by `gruns-hero` / `gruns-product-list`
(utility classes in markup, `{% stylesheet %}` only for the few things Tailwind can't express —
scrollbar hiding, `details[open]` icon rotation), and the `gruns-gallery-carousel` convention of a
small vanilla-JS custom element per piece of interactive behavior.

No `learn_shopify_api` tool is available in this environment (checked via tool search — not
configured), so the mandatory AGENTS.md call is skipped; everything below is cross-checked
against the architecture rules already inlined in CLAUDE.md/AGENTS.md instead.

## Layout regions

1. **Gallery** (`product.media`, sticky on desktop): vertical thumbnail rail + large featured
   viewer with prev/next overlay buttons. A `product-gallery` custom element (same pattern as
   `gruns-gallery-carousel`) swaps the active media by toggling a `hidden`/active class pair and
   wraps around at the ends (no disabled state, matching the Figma control style).
2. **Rating + badge**: star rating (editable `rating` setting, 1 decimal, out of 5) and an
   editable "Launching Soon" badge, both section settings — there's no reviews app installed, so
   this is a plain editorial rating rather than faking an Okendo/Loox integration.
3. **Title / description**: `product.title` / `product.description` directly — real Shopify data,
   not a setting.
4. **Highlight grid**: 2×2 icon + text row (THC content, adaptogens, carbonation, lab/COA). New
   `product-highlight` block, one per cell.
5. **"Choose your Flavor"**: swatch links to sibling flavor products. New `flavor-swatch` block —
   plain `<a href="{{ block.settings.product.url }}">`, no JS: switching flavor is a real page
   navigation to that product's handle, not an AJAX content swap. Active state is a Liquid
   comparison (`block.settings.product.id == product.id`), not JS.
6. **Quantity / pack size**: real `product.variants` (12/24/36 Pack), rendered as an
   accessible radio group (`<input type="radio" name="pack-size">` + styled `<label>` pills, not
   div-clicks). A `product-purchase` custom element listens for `change` and:
   - updates the hidden `id` input in the `{% form 'product' %}`
   - updates the "$X.XX per can" text under each pill from each variant's real price ÷ pack count
     (pack count parsed from the variant's `option` matching `/(\d+)/`, no hardcoded 12/24/36)
   - recomputes the buy button label/price
7. **Purchase option widget** (Subscribe & Save vs One-Time): real
   `product.selling_plan_groups` — radio inputs (`name="selling_plan"`), one card per option.
   Subscribe price/savings are read from the current variant's real
   `selling_plan_allocations` (the allocation whose `selling_plan_id` matches the group's first
   plan), never a hardcoded "20%" — the copy just says "Save {{ percent }}%" where percent is
   computed from `compare_at_price` vs `price` on the allocation.
8. **Buy button**: `{% form 'product' %}` submit, label swaps between "Try Now $X" (subscription
   selected) and a plain "Add to cart $X" (one-time selected), price always reflecting the
   current variant + selling plan combination.
9. **Trust badge row** (30-Day Guarantee / COA & 3rd-party tested / Adults 21+): new
   `guarantee-badge` block (outlined circular icon + label — visually distinct from the existing
   filled-icon `trust-badge`), nested inside the existing `badge-row` wrapper. `badge-row`'s
   schema gets `guarantee-badge` added to its allowed block types (one-line change) instead of
   introducing a second wrapper block.
10. **Accordions** (What is Toasted? / Ingredients & Allergies / What to Expect / Lab Results):
    new `accordion-item` block (title + richtext body) using native `<details>`/`<summary>` — no
    JS needed, and it's free accessibility (keyboard + screen reader support built in). The
    Figma "Plus" node is a Code Connect stub with no backing asset (a design-system component
    marker, not exportable art), so it's implemented as a small new `icon-plus.svg` that rotates
    45° via the `group-open:` Tailwind variant rather than swapping to a separate "minus" icon.
11. **Bottom promo banner** ("Can't Pick Just One? Get My Trial Pack"): section settings
    (heading, button label/link, one editable image). The Figma composition of three
    overlapping can renders + a decorative rectangle is fixed pixel-positioned production art —
    reproducing it exactly isn't a merchant-editable pattern, so it collapses to a single
    `image_picker`, matching how `footer.liquid` treats its decorative mark. The two feature
    bullets ("Free 3-flavor trial pack." / "Just Pay Shipping") reuse the exact copy + existing
    `icon-package.svg` / `icon-shipping.svg` assets already used for this same copy in
    `gruns-hero`.

## New/changed files

- `sections/product.liquid` — full rewrite.
- `blocks/product-highlight.liquid` — new. Icon (image_picker) + label text, `@param`-documented.
- `blocks/flavor-swatch.liquid` — new. `product` picker + `swatch_color` (defaults reuse the
  Blood Orange/Berry Acai/Ginger Lime hexes already established in `gruns-product-list`'s
  presets: `#B70141` / `#5E1A79` / `#215332`) + optional `swatch_image`.
- `blocks/accordion-item.liquid` — new. `title` text + `content` richtext.
- `blocks/guarantee-badge.liquid` — new. `label` text + `icon` (image_picker, falls back to one
  of 3 bundled SVGs via a `select`, same fallback pattern as `trust-badge`).
- `blocks/badge-row.liquid` — edit: add `{ "type": "guarantee-badge" }` to `blocks`.
- `blocks/highlight-grid.liquid`, `blocks/flavor-swatch-row.liquid`, `blocks/accordion-list.liquid`
  — new wrapper blocks (unplanned addition, see note below), mirroring the existing `badge-row`
  pattern: each just does `{% content_for 'blocks' %}` inside a container div, and declares its
  matching child type as the only allowed nested block.

### Architecture correction: static blocks, not a `where` filter

The original plan (below, kept for context) called for declaring `product-highlight` /
`flavor-swatch` / `accordion-item` as top-level section blocks and rendering each region by
filtering `section.blocks | where: 'type', 'x'` then looping `content_for 'block', id: block.id,
type: block.type`. `shopify theme check` rejected this outright — `ValidContentForArguments`
errors on both arguments, because `content_for 'block'` (singular) requires **literal string**
`id`/`type` values; it's Shopify's *static block* mechanism for pinning one specific,
non-reorderable block to a fixed spot in the markup, not a way to dynamically iterate a filtered
list.

Fixed by wrapping each repeatable region in its own wrapper block (`highlight-grid`,
`flavor-swatch-row`, `accordion-list`, plus the pre-existing `badge-row`), each declared **static**
in the section's default preset:

```json
{ "type": "highlight-grid", "static": true, "id": "highlight-grid" }
```

and referenced in the section markup with literal arguments:

```liquid
{% content_for 'block', type: 'highlight-grid', id: 'highlight-grid' %}
```

This pins all 4 regions at their fixed positions among the section's structural HTML (title,
quantity picker, buy button, promo banner), while the *children* inside each wrapper
(`product-highlight`, `flavor-swatch`, `accordion-item`, `guarantee-badge`/`trust-badge`
instances) remain fully merchant addable/removable/reorderable via each wrapper's own
`content_for 'blocks'`.

## New assets

Downloaded from the Figma node via `download_assets` (real exported art, not recreated by hand):

- `icon-thc-highlight.svg`, `icon-adaptogen.svg`, `icon-non-carbonated.svg`,
  `icon-usa-hemp.svg` — the 4 highlight-grid icons.
- `icon-guarantee.svg` (check-heart), `icon-lab-target.svg` (target-04),
  `icon-payment-card.svg` (credit-card-01) — the 3 outlined trust-badge icons.

Hand-authored (no Figma asset backs these — see notes above/below):

- `icon-plus.svg` — accordion toggle glyph.
- `icon-star.svg` — single star, `currentColor` fill, looped for the rating display.

Reused as-is: `icon-chevron-left.svg` / `icon-chevron-right.svg` (gallery nav, replacing Figma's
rotated generic chevron), `icon-package.svg` / `icon-shipping.svg` (promo banner bullets).

## Locale additions

- `en.default.json`: new `products.main` namespace — `choose_flavor`, `quantity`, `per_can_html`,
  `save_percent_html`, `subscribe_save`, `one_time_order`, `delivered_every_html`,
  `pause_skip_cancel`, `save_each_delivery_html`, `standard_purchase`, `buy_button_subscribe_html`,
  `buy_button_one_time_html`, `sold_out`, `unavailable`, `launching_soon`.
- `en.default.schema.json`: labels for all new block/section settings (`rating`, `review_count`,
  `badge_label`, flavor swatch fields, accordion fields, guarantee badge fields, promo banner
  fields); `general.product_highlight`, `general.flavor_swatch`, `general.accordion_item`,
  `general.guarantee_badge`.

## Other changes

- `package.json`'s `build:css` (`tailwindcss -i ./src/tailwind.css -o ./assets/tailwind.css
  --minify`) needs to be re-run once the new markup exists so `assets/tailwind.css` picks up the
  new utility classes — it's a static compiled file, not a live build.
- `templates/product.json` already points `"main"` at `"type": "product"`, i.e. this section —
  no template change needed.

## Deliberate deviations from the Figma file (and why)

- **Reviews**: static/editable star rating instead of wiring up a reviews app that isn't
  installed in this theme.
- **Trial Pack swatch art**: Figma reuses the Ginger Lime render for the Trial Pack swatch
  (looks like an unfinished duplicate layer in the file). Treated as its own
  merchant-configurable `flavor-swatch` block instance instead of hardcoding that duplicate.
- **Promo banner composited renders**: collapsed to one editable image (see above) instead of
  three pixel-pinned overlapping renders.
- **Pricing math**: every price/percent shown (per-can, subscribe savings, buy button) is derived
  live from `variant`/`selling_plan_allocation` data, never the specific dollar amounts visible
  in the static Figma frame (those are just one flavor/variant/plan combination).

## Responsive layout

Figma frame is desktop-only (fixed 585px gallery + flexible detail column, `xl` breakpoint
padding matching other `gruns-*` sections: `px-5 sm:px-8 md:px-12 xl:px-[120px]`). Mobile stacks
the gallery above the detail column, gallery switches from sticky-vertical-thumbnails to the
`gruns-gallery` horizontal-scroll-thumbnail-row pattern already used elsewhere in the theme, and
the highlight grid stays 2×2 (already mobile-sized in the source).
