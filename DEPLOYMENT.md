# Cafe SRT deployment

The app uses lightweight pathname routing: `/` renders the cafe home and `/order` renders the food-ordering page. The project remains a static Vite build.

Clean `/order` navigation requires the host to serve `index.html` as the fallback for unknown application paths:

- Cloudflare Pages: add a `_redirects` file with `/order /index.html 200` in `public/`, or configure the equivalent SPA fallback in the Pages project.
- Netlify: add `public/_redirects` containing `/order /index.html 200`.
- Vercel: add a root `vercel.json` rewrite from `/order` to `/index.html` with status 200, or enable the project SPA fallback.

The current local Vite preview serves both `/` and `/order` successfully. Food and cafe image folders are intentionally empty until the owner supplies the new images; no stock or invented cafe imagery is used.
