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

Weiteres

Wenn du möchtest, kann ich:
- das Projekt in ein monorepo mit zusätzlichen Skripten ausbauen
- CI/CD oder Deployment-Skripte hinzufügen
- Mobile-Wrapper (Capacitor / React Native) vorbereiten
