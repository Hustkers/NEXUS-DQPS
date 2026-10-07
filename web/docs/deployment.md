# Deployment

> 🚀 **Live Production Deployment:** [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)  
> 📊 **Interactive Decision Console:** [https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)

The NEXUS-D2C platform is deployed to Vercel in production (`web/` root directory) or can be deployed anywhere Docker runs. `next.config.ts` sets `output: 'standalone'`, so production builds are optimized for self-hosting.

## Vercel (Production)

The live project is hosted on Vercel:
- **Production URL**: [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)
- **Root Directory**: `web`
- **Framework Preset**: Next.js
- **Build Command**: `next build` (using Bun or npm)

For other platforms, see the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying).

## Environment Variables for Production

Ensure these are set in your deployment platform:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- All `NEXT_PUBLIC_*` variables for client-side access
- `SENTRY_*` variables if using error tracking

Sentry source maps are uploaded automatically in CI.

## Docker

Two production-ready Dockerfiles are included: `Dockerfile` (Node.js) and `Dockerfile.bun` (Bun). Pass `NEXT_PUBLIC_*` variables as `--build-arg` at build time and runtime secrets via `-e` at run time.

Build the image:

```bash
# Node.js
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -t shadcn-dashboard .

# OR Bun
docker build -f Dockerfile.bun \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -t shadcn-dashboard .
```

Run the container:

```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -e CLERK_SECRET_KEY=sk_live_xxxxx \
  --restart unless-stopped \
  --name shadcn-dashboard \
  shadcn-dashboard
```
