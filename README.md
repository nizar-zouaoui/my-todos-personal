# Todo App (Next.js + TypeScript + Tailwind)

This project is a starter todo app with email-based login codes and a simple in-memory data adapter. It includes a swap-point where you can connect Convex.

Quick start

1. Install dependencies

```bash
npm install
```

1. Create a `.env.local` with the following environment variables (example):

```
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=you@domain.com
JWT_SECRET=replace_this_with_a_secure_secret
NEXT_PUBLIC_CONVEX_URL=
```

1. Run dev server

```bash
npm run dev
```

Notes

- The current implementation uses an in-memory adapter at `lib/db.ts`. Provide `NEXT_PUBLIC_CONVEX_URL` to use Convex via the server-side HTTP client.
- The login flow:
  - `POST /api/auth/send-code` to send a 6-digit code
  - `POST /api/auth/verify` to verify and receive JWT cookies
- Access tokens are JWTs with 7d expiry. Refresh tokens are created and stored server-side (in-memory here). Replace with Convex storage for production.

Security

- Cookies are set as HttpOnly with SameSite=Lax. For production, set `Secure` and consider stricter cookie policies.
