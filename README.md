# 🕹️ RetroGames - Plateforme d'Arcade Web

> **Développé par Armand Lauener**

RetroGames est une application web Fullstack moderne qui ressuscite l'expérience des salles d'arcade classiques. Jouez à des jeux emblématiques directement dans votre navigateur, sauvegardez vos records et mesurez-vous aux autres joueurs via un système de classement mondial.

---

## 🚀 Fonctionnalités principales

- **🔐 Authentification Sécurisée** — Inscription et connexion avec hachage de mot de passe (*bcrypt*) et sessions gérées par *JSON Web Tokens (JWT)*.
- **👤 Profil Utilisateur Personnalisé** — Chaque joueur peut choisir une couleur distinctive et suivre ses statistiques (parties jouées, score total).
- **🎮 Catalogue de Jeux** — Accès à plusieurs classiques (*Pong, Snake, Tetris, Space Defender*) avec des mécaniques de jeu fluides basées sur le **Canvas HTML5**.
- **📊 Système de Scores Dynamique** — Enregistrement automatique des sessions de jeu et détection des nouveaux records personnels (*Personal Best*).
- **🏆 Leaderboards en temps réel** :
  - Classements individuels par jeu
  - Classement mondial basé sur la performance cumulée

---

## 🎮 Jeux Disponibles

| Jeu | Description |
|-----|-------------|
| **🏓 Pong** | Le duel classique de raquettes revisité |
| **🐍 Snake** | Dirigez le serpent, collectez les pommes et évitez les collisions |
| **🧱 Tetris** | Gérez la chute des blocs pour compléter des lignes horizontales |
| **🚀 Space Defender** | Un shoot'em up spatial où vous devez repousser des vagues d'ennemis |

---

## 🛠️ Stack Technique

### Backend (API REST)

| Technologie | Rôle |
|-------------|------|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Framework HTTP |
| **SQLite** (*better-sqlite3*) | Base de données légère, sans serveur externe |
| **bcryptjs** | Hachage sécurisé des mots de passe |
| **jsonwebtoken** | Authentification par token JWT |

### Frontend (Client)

| Technologie | Rôle |
|-------------|------|
| **Vue.js 3** (*Composition API*) | Framework réactif |
| **Vite** | Outil de build ultra-rapide |
| **Vue Router** | Navigation SPA |
| **Axios** | Communication asynchrone avec l'API |
| **CSS Custom** | Esthétique *Retro Arcade* avec gestion des thèmes |

---

## 📦 Installation et Lancement

### Prérequis

- [Node.js](https://nodejs.org/) (v18+ recommandé)
- npm

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd RetroGames
```

### 2. Configurer et lancer le Backend

```bash
cd backend
npm install
```

Créez un fichier `.env` à la racine du dossier `backend` :

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=votre_cle_secrete_super_securisee
FRONTEND_URL=http://localhost:5173
```

Démarrez le serveur :

```bash
npm run dev
```

### 3. Configurer et lancer le Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 🌐 Accès

L'application est disponible sur **[http://localhost:5173](http://localhost:5173)**

---

## 🗄️ Architecture de la Base de Données

Le projet utilise **SQLite** pour sa portabilité. Les tables sont générées automatiquement au premier lancement :

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      users       │     │   user_scores    │     │  game_sessions   │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id               │────▶│ user_id          │     │ user_id          │
│ username         │     │ game_id          │     │ game_id          │
│ password (hash)  │     │ best_score       │     │ score            │
│ color            │     └──────────────────┘     │ duration         │
│ total_games      │                              │ played_at        │
│ total_score      │──────────────────────────────▶└──────────────────┘
└──────────────────┘
```

| Table | Description |
|-------|-------------|
| **users** | Identifiants, mot de passe haché, couleur de profil et statistiques globales |
| **user_scores** | Record (meilleur score) de chaque utilisateur pour chaque jeu |
| **game_sessions** | Historique complet de chaque partie (score, durée, horodatage) |

---

## 🛣️ API Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|:----:|-------------|
| `POST` | `/api/users/register` | ❌ | Création d'un nouveau compte |
| `POST` | `/api/users/login` | ❌ | Connexion et obtention du token JWT |
| `GET` | `/api/users/profile` | ✅ | Récupération des données du joueur |
| `POST` | `/api/users/game/start` | ✅ | Initialisation d'une nouvelle partie |
| `POST` | `/api/users/game/score` | ✅ | Enregistrement du score final et mise à jour des records |
| `GET` | `/api/users/leaderboard/:gameId` | ❌ | Top 10 des scores pour un jeu spécifique |

---

## 📁 Structure du projet

```
RetroGames/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── database/
│   ├── routes/
│   └── middleware/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── games/
│   │   ├── router/
│   │   └── assets/
│   └── public/
└── README.md
```

---

<p align="center">
  <strong>🕹️ Insérez une pièce pour jouer 🕹️</strong><br>
  <em>Développé par Armand Lauener</em>
</p>
