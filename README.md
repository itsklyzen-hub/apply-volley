# Apply Volley

Application mobile (iOS / Android) pour gérer une équipe de volley-ball : effectif, agenda et présences.

Construite avec **Expo SDK 58** (React Native) et **Expo Router**. Il faut **créer un compte** (email + mot de passe) pour accéder à l'app : chaque compte a sa propre équipe, sauvegardée en ligne avec **Supabase** et retrouvée sur n'importe quel téléphone.

## Fonctionnalités

| Onglet | Contenu |
| --- | --- |
| **Accueil** | Nom de l'équipe, nombre de joueurs, prochains événements, raccourcis |
| **Effectif** | Joueurs (prénom, nom, numéro, poste) |
| **Agenda** | Entraînements, matchs et autres événements, avec suivi des présences par joueur |

## Configurer Supabase (une seule fois)

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) et clique sur **Run**. Cela crée la table `team_data` et les règles de sécurité : chaque compte ne voit que sa propre équipe.
3. Dans **Project Settings > API**, récupère l'URL du projet et la clé publique `anon`.
4. Copie `.env.example` en `.env` et colle ces deux valeurs.
5. Optionnel : dans **Authentication > Sign In / Providers > Email**, désactive « Confirm email » si tu ne veux pas que les nouveaux comptes aient à confirmer leur adresse.

La clé `anon` est faite pour être embarquée dans l'app ; ne mets jamais la clé `service_role` dans `.env`.

## Lancer l'application

```bash
npm install
npx expo start
```

Puis scanne le QR code avec l'application **Expo Go** (App Store / Play Store) sur ton téléphone. `npx expo start --web` ouvre une version navigateur (les boîtes de confirmation de suppression ne s'affichent que sur mobile).

## Vérifications

```bash
npm run typecheck
npm run lint
```

## Structure

```
supabase/schema.sql    Table et règles d'accès à créer dans Supabase
src/
  app/                 Écrans (Expo Router)
    login.tsx          Connexion
    signup.tsx         Création de compte
    (tabs)/            Les 3 onglets (accessibles une fois connecté)
    player/[id].tsx    Fiche / création joueur
    event/[id].tsx     Événement et présences
  components/ui.tsx    Composants d'interface partagés
  lib/
    supabase.ts        Client Supabase
    auth.tsx           Session de l'utilisateur
    store.tsx          Données de l'équipe, synchronisées avec Supabase
    types.ts           Modèle de données
```

## Publier sur les stores

Utilise EAS Build : `npx eas-cli@latest build --platform android` (ou `ios`). Voir https://docs.expo.dev/build/introduction/.
