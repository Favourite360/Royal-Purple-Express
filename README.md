# Royal Purple Express International — Website

A four-page, responsive, hand-coded marketing site. No build step. Open `index.html` in any browser to view.

## Files
- `index.html` — homepage (hero, trust marquee, services, industries, stats, global reach, testimonial, FAQ, CTA)
- `services.html` — services detail, freight modes, process, industries
- `about.html` — story, values, footprint stats, leadership
- `contact.html` — quote form + direct contact details
- `styles.css` — full design system (tokens, type, components, responsive, motion)
- `main.js` — header scroll, mobile nav, scroll reveals, count-up stats, FAQ, lane rail, form handler
- `assets/` — four AI-generated, purple-graded brand images

## Design system (locked in design-direction.md)
- **Colors:** Ink `#16111F` · Royal `#4B1A86` · Violet `#7C3AED` · Mist `#F4F1FA` · Paper `#FFFFFF`
- **Type:** Archivo Expanded (display) · Hanken Grotesk (body) · IBM Plex Mono (utility) — Google-hosted, free
- **Signature:** "The Royal Lane" — scroll progress bar + left-rail waypoints (Origin → Customs → In Transit → Delivered)

## Before launch — replace these placeholders
1. **Company details:** RC number, D-U-N-S, phone (`+234 000 000 0000`), email, office addresses — currently dummy values in the footer and contact page.
2. **Client logos** in the trust marquee — currently text names. Swap for real partner logos.
3. **Testimonial** — confirm a real client quote and attribution.
4. **Stats** (19 DCs, 320+ trucks, 500+ clients, 85,731 sqm) — confirm or correct the real figures.
5. **Service list** — currently the common set; expand to the client's full provided list as we iterate.
6. **Leadership** names/initials on the About page.

## Two things needed for production
- **Form backend:** the quote form currently shows a success message client-side only. Wire it to an email service or endpoint (Formspree, a serverless function, or the client's CRM) to actually receive submissions.
- **Image optimization:** the four hero images are 0.8–1.3 MB each. For best load speed, compress to WebP and add responsive `srcset` before going live. Structured so real client photography can drop straight in.

## Notes
- Fully responsive with a dedicated mobile layout (collapsed nav drawer, re-gridded sections).
- Respects `prefers-reduced-motion`. Keyboard focus is visible throughout.
