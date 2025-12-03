# ToDo App mit KI-Chatbot (Template)

Dieses Repository enthält ein einfaches Fullstack-Template für eine ToDo-Webanwendung mit:

- Node.js + Express Backend (SQLite) mit Benutzerregistrierung und JWT-Authentifizierung
- React (Vite) Frontend mit Anmelde-/Registrierungsformular, ToDo-CRUD und einfachem KI-Chatbot-Interface

Zweck: später als Mobile-App weiterverwenden (z.B. mit React Native / Capacitor).

Schnellstart

1. Backend installieren und starten

```powershell
cd server; npm install; npm run dev
```

2. Frontend installieren und starten (in neuem Terminal)

```powershell
cd client; npm install; npm run dev
```

3. Environment-Variablen

Erstelle in `server` eine `.env` Datei mit mindestens:

```
JWT_SECRET=dein_geheimes_jwt_schluessel
OPENAI_API_KEY=sk-...   # optional, für echten Chatbot
```

Wenn `OPENAI_API_KEY` nicht gesetzt ist, antwortet der Chatbot mit einer einfachen Echo-Antwort.

Owner-Account erstellen

Für spezielle "Owner"-Features (z. B. Benutzer- und ToDo-Übersicht) kannst du einen Owner-Account anlegen.

- Setze in `server/.env` zusätzlich `OWNER_KEY` auf einen geheimen Wert.
- Erstelle dann den Owner-Account per API-Request (PowerShell-Beispiel):

```powershell
$body = @{ username = 'owner'; password = 'sicheresPasswort'; ownerKey = 'DEIN_OWNER_KEY' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:4000/api/setup/owner -Method Post -Body $body -ContentType 'application/json'
```

Die Antwort enthält `token` und `user` (mit `role: owner`). Wenn du dich mit diesem Account anmeldest, siehst du im Frontend zusätzliche Owner-Features.

Git hochladen

```powershell
git init
git add .
git commit -m "Initial commit: ToDo app scaffold"
# Erstelle ein GitHub-Repo und füge remote hinzu
git remote add origin https://github.com/<user>/<repo>.git
git branch -M main
git push -u origin main
```

Vercel Deployment (Monorepo Hinweis)

Wenn dein Repo `server/` und `client/` enthält (Monorepo), konfiguriere Vercel so, dass der Build im `client`-Ordner stattfindet. Zwei Optionen:

- Im Vercel Dashboard: setze `Root Directory` auf `client`, `Framework Preset` auf `Vite`, `Build Command` auf `npm run build` und `Output Directory` auf `dist`.
- Oder lege `vercel.json` in der Repo-Wurzel an (beispiel bereits im Repo). Vercel erkennt dann automatisch, dass die `client` App gebaut werden soll.

Lokales Testen des Produktions-Builds

```powershell
cd client
npm install
npm run build
npx serve dist
```


Weiteres

Wenn du möchtest, kann ich:
- das Projekt in ein monorepo mit zusätzlichen Skripten ausbauen
- CI/CD oder Deployment-Skripte hinzufügen
- Mobile-Wrapper (Capacitor / React Native) vorbereiten
