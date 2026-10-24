# Orbit launch

Public marketing repository: https://github.com/SGranquist13/orbit-site

Site: https://enterorbit.dev/

Launch updates and feedback: https://github.com/SGranquist13/orbit-site/discussions

Orbit desktop v0.3.0 was released on 2026-10-22: https://github.com/SGranquist13/orbit/releases/tag/v0.3.0

Windows installer: https://github.com/SGranquist13/orbit/releases/download/v0.3.0/Orbit_0.3.0_x64-setup.exe

Voice is the headline, all in Preview: local Whisper dictation, hands-free chat, and Kokoro read-aloud with eight voices and Windows voices as fallback. A one-time Set up voice dialog downloads both models. Optional Voice tidy-up is in Settings > Models; it sends transcript text to the selected model, while audio stays local.

The release follows 0.2.0's built-in editor, terminal and chat attachments, and 0.2.1's previews for plans, limits, MCP servers, rewind, reviews and Best of N.

Desktop screenshots were refreshed from the v0.3.0 browser mock in dark and light themes. Voice captures cover the chat controls, setup dialog, Voice and hands-free settings, and Models > Voice tidy-up. The homepage voice section plays a recorded hands-free turn from the mock (scripts/record-clips.mjs voice: synthesized speech through a fake mic, real VAD and read-aloud states), and the IDE section plays a Watch-mode clip (record-clips.mjs ide). The hero tour video predates voice.

The mobile app repository is coming soon.

Push to `main` to deploy through GitHub Actions. See README.md for local development, production builds, and custom domain configuration.

Share artwork is in `social/`; the site's link-preview image is `public/og.png`.


Custom domain enterorbit.dev is connected, with HTTPS enforced. GitHub provisions and renews its certificate.
