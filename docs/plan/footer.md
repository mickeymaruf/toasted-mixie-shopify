# Footer section

Figma: https://www.figma.com/design/XfCycCgnXl5JM43j8nNvF0/Toasted-UI--Copy-?node-id=4658-30422

Rebuilds `sections/footer.liquid` (currently the Skeleton-theme placeholder) to match the
"Footer Sample 3" frame: 3 link columns (Shop / Help / About), a centered logo + newsletter
signup, a social icon row, and a bottom legal bar — on a soft grey-blue background with a
faded decorative brand mark bleeding off the right edge.

Follows the Tailwind-utility convention established by `gruns-hero` / `gruns-info-grid` /
`gruns-gallery` (utility classes in markup, no BEM/custom-property stylesheet), rather than the
older pattern used by `header.liquid`/`announcement-bar.liquid`.

## Content model (all editable in the theme editor)

- **Logo**: `image_picker` (`logo`) + `logo_width` range. Falls back to
  `logo-toasted.svg` (already in `assets/`, matches the Figma wordmark exactly).
- **Heading / subheading**: text settings, default "Be first to know." /
  "Get launch updates, first drops, and new flavor news."
- **Newsletter form**: real `{% form 'customer' %}` submission (tags the customer
  `newsletter`, sets `accepts_marketing`), with editable `email_placeholder` and
  `newsletter_button_label` text settings. Success/error state via `form.posted_successfully?`.
- **Link columns** (Shop / Help / About): each gets an editable `title` text setting + a
  `link_list` setting so merchants point them at real Shopify menus, per the task requirement.
- **Legal bar**: editable `copyright_text` (year is auto-generated) + a `link_list`
  (`legal_menu`) for Privacy/Terms/Age-verification, rendered with `|` separators.
- **Social icons**: `show_social_icons` checkbox + one `url` setting per network
  (Facebook/Instagram/TikTok). Icons render with `currentColor` so the button stays
  themeable; hidden if the checkbox is off.
- **Colors**: `background_color` (#C2CBD4) and `text_color` (#212323) to match existing
  section color-setting conventions.

Decorative background mark (large faded brand swirl) is not a merchant setting — it's
static art matching the fixed brand mark, hardcoded via `inline_asset_content`, hidden below
`lg` so it doesn't crowd the mobile layout.

## New assets

- `assets/icon-footer-mark.svg` — decorative brand mark (from Figma, `#F6F1EC` fill baked in).
- `assets/icon-facebook.svg`, `assets/icon-instagram.svg`, `assets/icon-tiktok.svg` — social
  glyphs, `currentColor` fill, same convention as `icon-cart.svg`/`icon-search.svg`.

## Locale additions

- `en.default.json`: `footer.email_label`, `footer.newsletter_success`,
  `footer.newsletter_error`, `general.accessibility.facebook/instagram/tiktok`.
- `en.default.schema.json`: labels for `email_placeholder`, `copyright_text`,
  `facebook_link`/`instagram_link`/`tiktok_link`, `show_social_icons`; general group
  headers `newsletter`, `menus`, `social`, `legal`.

## Other changes

- `sections/footer-group.json`: update the stored default settings to the new setting ids.

## Responsive layout

Mobile-first stack, reordered with flex `order-*` so logo/newsletter leads on small screens:
logo+newsletter → Shop/Help columns → About → socials → legal bar. From `lg` (1024px) up,
switches to the 3-column row from the Figma frame (Shop/Help | logo+newsletter | About).
