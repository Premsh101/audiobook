# Product Plan — Global First

## Positioning

Hear the stories you love in the voice you love.

Two products, one simple app.

### Library
Pre-generated audiobooks that many users can listen to without paying a TTS generation cost on every play.

### Favourite Voice
Users create a voice profile only with permission from the speaker. They hear a five-minute personalized preview for free, then buy listening-minute credits.

## Global-first business model

The primary market is global. India uses the same product with local prices.

Library pricing is configurable per country/currency. Initial experiments can test low-friction monthly/annual access in the US, UK, Canada, Australia, and India.

Favourite Voice uses prepaid minute credits. Never expose unlimited personalized generation.

## Economics

Library:
- Generate once.
- Cache permanently.
- Reuse across many listeners.
- Playback should have only delivery/storage costs.

Favourite Voice:
- Generation is the expensive event.
- Free preview is capped at five minutes.
- Chapters are generated lazily.
- Successful audio is cached.
- Standard generation should target a commercially usable self-hosted model.
- Premium/fallback external providers can be used when quality or language support requires them.

Track generated minutes, TTS cost/minute, revenue/generated minute, free-preview cost, preview-to-paid conversion, average credit purchase, repeat listening, CAC, refunds, and contribution margin.

## Content

Use public-domain works, original stories, licensed works, and independent-author partnerships.

Do not treat public-domain status in one country as global distribution permission.

## Voice trust

Require explicit permission/authorization, consent record, deletion/revocation, rate limits, abuse reporting, and an audit trail.

## Product scope

MVP: discover, search, listen, account, subscription, favourite voice, free preview, credits, personalized chapter generation.

Later: recommendations, offline listening, family sharing, gifting.

Not now: calling, chat, RAG, agents, avatars.
