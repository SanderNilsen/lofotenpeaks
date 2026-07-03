# Poster and Shop Plan

The database already has starter tables for `poster_routes` and `shop_orders`, but the poster/shop UI is intentionally hidden for now. The current project focus is the hiking guide.

## Poster Flow

1. User uploads GPX in a future poster editor.
2. Frontend parses the route into GeoJSON.
3. Draft is saved in `poster_routes` with `status = 'draft'`.
4. Later, a poster editor can load that route and render a preview.
5. Checkout creates a `shop_orders` row linked to the poster route.

For now, raw user GPX files are not stored in Supabase Storage. Add private user GPX storage later if you need original file downloads.

## Shop Flow

Recommended provider path:

- Stripe Checkout for payment
- Netlify Functions or Supabase Edge Functions for secure order creation
- `shop_orders.provider = 'stripe'`
- `shop_orders.provider_order_id = checkout_session.id`
- Webhook updates `shop_orders.status`

Do not create orders directly from the browser with a secret key. The browser should only call a serverless function that creates a checkout session.

## Future Tables/Fields

The current `shop_orders` table is enough for a first integration. Add these when real fulfillment starts:

- shipping name/address fields or a separate `order_shipping_addresses` table
- product SKU and quantity fields
- poster size/material fields
- payment status history
- print provider order ID
- fulfillment tracking URL

## Moderation

User hike recommendations are saved to `user_hikes` as `pending`. Add an admin moderation screen before showing them publicly.
