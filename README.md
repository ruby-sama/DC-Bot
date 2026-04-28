# Discord Community Bot (TypeScript + discord.js)

Dieses Projekt enthält ein modulares Grundgerüst für den beschriebenen Community-Bot.

## Stack
- Node.js 20+
- TypeScript
- discord.js v14
- PostgreSQL + Prisma
- JSON-Config unter `config/`

## Setup
1. `cp .env.example .env` und Werte eintragen.
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run seed`
5. `npm run dev`

## Architektur
Alle Funktionen sind in eigene Dateien aufgeteilt:
- Commands: `src/commands/*`
- Services: `src/services/*`
- Event-Handler: `src/events/*`
- Interactions (Buttons/Modals): `src/interactions/*`
- Scheduler: `src/scheduler/*`

## Wichtige Features (implementierter Kern)
- `/profile` mit eigen/fremd-Unterscheidung und Profilbuttons
- Geburtstag setzen (Modal + Sperre) und Birthday-Ping Toggle
- Rollen-Toggles (NSFW, Venting, Mental Health)
- Join-Security (Young Account Kick, Score-basierte Auto-Verify)
- Rules-Embed Persistenz über `system_messages`
- Level-Formel `35 * level^2` und XP-Event-Basis
- Medaillen-Basis via `/admin medal create|list`
- Birthday-Scheduler täglich 00:00 Europe/Berlin + Start-Check

## Hinweis
Das Repo ist als stabile, erweiterbare Basis ausgelegt. Erweiterungen wie vollständige Achievement-Matrix, Voice-Ticker, Reaction/Message XP Pipeline, vollständige Admin-Subcommands und Migrationsimport können modular ergänzt werden.


## Multi-Server Betrieb
- Der Bot kann auf mehreren Servern laufen, ohne dass du für jeden Server einen eigenen `guildId`-Eintrag pflegen musst.
- Wenn `server.json.guildId` leer bleibt, laufen Scheduler-Checks über alle Guilds, in denen der Bot ist.
- Commands können global deployed werden: `npm run deploy:commands` ohne `DISCORD_GUILD_ID`.
- Optional kannst du weiterhin guild-spezifisch deployen, wenn `DISCORD_GUILD_ID` gesetzt ist.
