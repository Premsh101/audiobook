# Product Plan — Global First

## Positioning

**Hear the stories you love in the voice you love.**

The product is intentionally simple: browse audiobooks, listen normally, or personalize a title with a favourite person's consented voice.

## Product A — Audiobook Library

Pre-generated audio is created once and reused across listeners. This is the low-cost acquisition/retention product.

Core flow: sign up → browse/search → title → sample → subscribe → listen → resume.

Initial catalog: public-domain titles, original stories, properly licensed books, and independent-author partnerships.

## Product B — Favourite Voice

Core flow: create voice → upload clean sample → capture consent/authorization → quality check → create provider voice → choose eligible title → generate 5-minute preview → buy minute credits → generate requested chapter/content → cache → listen repeatedly.

Never offer unlimited personalized generation.

## Global pricing experiments

Keep pricing data-driven by country/currency and out of UI source code.

Library hypotheses: Free samples; $2.99/month; $5.99/month; $29.99/year; $59.99/year.

Favourite Voice credits: $2.99 / $5.99 / $9.99 / $19.99.

Five-minute personalized preview is the primary conversion mechanism.

India localization experiments: ₹10–₹19/month library; ₹49 / ₹99 / ₹199 / ₹399 personalized credit packs.

These are pricing experiments, not assumed willingness-to-pay.

## Unit economics

Generic library: generate each title once; playback has very low marginal delivery cost.

Favourite Voice: generation is the cost event. Control it with a five-minute free preview, prepaid credits, lazy chapter generation, caching, a self-hosted/low-cost standard model where commercially permitted, and a premium external fallback.

Track generation cost/minute, revenue/generated minute, preview-to-paid conversion, average credits purchased, unused balance, completion, repeat listening, refunds, CAC, and contribution margin.

## Global-first strategy

Core product must support USD/GBP/EUR/CAD/AUD/INR, country-specific catalog rights, localized taxes, multiple payment providers, and multiple languages. Validate US, UK, Canada, Australia, and India as distinct pricing/behavior cohorts.

## UX

Lead with the experience rather than technology:

**Listen to a story. Then hear it in a voice you love.**

Avoid leading with TTS/model terminology.

## Scope exclusions

No calling, chat, RAG, agents, avatars, or social feed in MVP.
