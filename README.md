# Sahal Tech — Badge STIC

Frontend React (Vite) pour la réservation de badges, vérification et scanner d'entrée.

## Démo / production

Application déployée : **http://13.48.134.87/stic/**

- Admin : `admin@sahaltech.com` / `password`
- Scanner : `scanner@sahaltech.com` / `password`

## Développement local

```bash
cp .env.example .env
npm install
npm run dev
```

## Build production

```bash
npm run build
```

Le build utilise le base path `/stic/` (voir `vite.config.js`).
