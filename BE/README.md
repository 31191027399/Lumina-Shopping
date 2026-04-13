# Lumina Backend on Supabase

This `BE` folder is now Supabase-compatible and ready to host on Supabase using:
- Postgres migration: `supabase/migrations/20260228_init_lumina.sql`
- Postgres migration (admin updates): `supabase/migrations/20260301_admin_support.sql`
- Postgres migration (customer account/update requests): `supabase/migrations/20260413_customer_account_requests.sql`
- Edge API function: `supabase/functions/api/index.ts`

## What is implemented

- Supabase Auth for register/login/me
- Postgres tables for products, cart, orders, and order items
- Admin-ready profile role/status fields and admin management routes
- Customer profile contact fields and order update request workflow
- RLS policies for per-user cart and orders
- SQL RPC `create_order_from_cart` for transactional checkout
- API routes matching FE behavior

## Route base URL

After deploy, FE should call:

- `https://<project-ref>.supabase.co/functions/v1/api`

Examples:
- `GET /products`
- `POST /auth/login`
- `PATCH /auth/me` (Bearer token, current user)
- `GET /cart` (Bearer token)
- `POST /orders/checkout` (Bearer token)
- `POST /orders/:id/update-request` (Bearer token, current user)
- `GET /order-update-requests` (Bearer token, current user)
- `GET /admin/users` (Bearer token, Admin role)
- `GET /admin/orders` (Bearer token, Admin role)
- `GET /admin/order-update-requests` (Bearer token, Admin role)
- `PATCH /admin/order-update-requests/:id` (Bearer token, Admin role)

## Deploy steps

1. Install and login to Supabase CLI.
2. Link project:

```bash
cd BE
supabase link --project-ref <your-project-ref>
```

3. Push database migration:

```bash
supabase db push
```

4. Set function secrets:

```bash
supabase secrets set \
  APP_SUPABASE_URL=https://<your-project-ref>.supabase.co \
  APP_SUPABASE_ANON_KEY=<your-anon-key> \
  APP_SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

5. Deploy edge function:

```bash
supabase functions deploy api --no-verify-jwt
```

## Local serve (optional)

```bash
supabase start
supabase functions serve api --no-verify-jwt --env-file .env
```

Note: for local `--env-file`, avoid variable names starting with `SUPABASE_` (the runtime skips them).

## Auth behavior

- `POST /auth/register` and `POST /auth/login` return Supabase `session`.
- FE should store `session.access_token` and send:

```http
Authorization: Bearer <access_token>
```

## Notes

- Shipping logic is same as FE: free if subtotal `> 150`, otherwise `15`.
- Product seed data is included in the migration and aligned with FE mock products.
- Admin model for FE:
  - User fields: `id`, `name`, `email`, `role` (`Admin|Manager|Customer`), `status` (`Active|Inactive`), `joined`
  - Order fields: `id` (`#ORD-xxxx`), `orderId` (numeric), `customer`, `date`, `total`, `status`
- Customer profile fields: `phone`, `addressLine1`, `addressLine2`, `addressCity`, `addressState`, `addressPostalCode`
- Order update request fields: `id`, `orderId`, `requestedChanges`, `reason`, `status`, `adminNote`, `reviewedAt`
- Admin endpoints:
  - `GET /admin/users`
  - `PATCH /admin/users/:id`
  - `DELETE /admin/users/:id`
  - `GET /admin/orders`
  - `PATCH /admin/orders/:id` (accepts numeric or `#ORD-xxxx`)
  - `DELETE /admin/orders/:id` (accepts numeric or `#ORD-xxxx`)
  - `GET /admin/order-update-requests`
  - `PATCH /admin/order-update-requests/:id`
