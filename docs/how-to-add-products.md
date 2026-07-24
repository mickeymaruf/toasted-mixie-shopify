   Here's how to set up variants on the product in Shopify admin so they map correctly to the pack-size picker in this section:

      1. Set up the option on the product

      In Shopify admin → Products → [your product] → Variants:

      - Add an option (e.g. named "Pack Size" or just leave it as "Title" — doesn't matter, the code doesn't read the option name).
      - Add three option values: 12 Pack, 24 Pack, 36 Pack.

      The important part: each value must start with the number, since the Liquid does:
      liquid
      assign pack_count = variant.title | split: ' ' | first | plus: 0
      It takes the variant title, splits on the space, takes the first word, and converts it to a number. So "12 Pack" → 12, "24 Pack" → 24. If you name a value something like "Pack of 12" instead, this breaks (pack_count would come out as 0, and the code falls back to treating it as 1 — meaning the per-can price would just show the full variant price). So keep the number first.

      2. Set price per variant

      For each variant (12/24/36 Pack), set its own Price:
      - The per-can text under each pill is just variant.price ÷ pack_count, so make sure the variant's price reflects the total price for that pack (e.g. if 1 can = $1, set the 12-pack variant price to $12.00, 24-pack to $24.00 or less if bulk-discounted, etc.).

      3. (Optional) Set a "Compare at price" to show a "Save X%" ribbon

      If you want the pink "Save 20%" ribbon above the 24/36 pack pills:
      - Set that variant's Compare at price higher than its actual Price.
      - The percentage shown is computed automatically from the difference — you don't type a percent anywhere.
      - Leave Compare at price blank (or equal to Price) on any variant where you don't want the ribbon (e.g. the 12-pack).

 4. Inventory / availability

      - If a variant is out of stock and you don't have "continue selling when out of stock" enabled, that pill will automatically render disabled/greyed out and unselectable (the code checks variant.available).

      5. Selling plans (subscriptions), if you're using them

      If you want the "Subscribe & Save" pricing to reflect real discounted numbers, set up a Selling Plan Group (via a subscriptions app, e.g. Shopify Subscriptions) and make sure it's applied to all three variants — the code looks up the first selling plan group/plan on the product and, per variant, finds its matching selling_plan_allocation to get the real subscribe price. If a variant isn't enrolled in the selling plan, it'll just fall back to showing one-time pricing only for that variant.

      That's it — once the three variants exist with numeric-first titles and correct prices, the pack-size row, per-can prices, savings ribbons, and buy-button pricing all populate automatically without touching the theme code.