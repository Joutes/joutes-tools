# Deck Checker - Star Wars Unlimited

## Description

Le Deck Checker est un outil qui permet de vérifier si votre deck physique correspond à votre liste de deck en utilisant l'IA pour analyser une photo de vos cartes.

## Fonctionnalités

- **Liste de deck**: Collez votre liste de deck dans le textarea
- **Upload de photo**: Ajoutez une photo de votre deck physique
- **Vérification automatique**: L'IA analyse la photo et compare avec votre liste
- **Résultats détaillés**:
  - Cartes correspondantes (✓)
  - Cartes manquantes sur la photo (⚠)
  - Cartes en trop sur la photo (ℹ)
  - Résumé statistique

## Configuration

Ajoutez votre clé API OpenAI dans le fichier `.env` :

```bash
OPENAI_API_KEY=sk-...
```

## Utilisation

1. Accédez à la page `/swu/deck-checker`
2. Collez votre liste de deck dans le champ de texte (format: `2x Nom de Carte` ou `Nom de Carte`)
3. Cliquez sur "Ajouter une photo" et sélectionnez une photo de votre deck physique
4. Cliquez sur "Vérifier"
5. Les résultats s'affichent avec les cartes correspondantes, manquantes et en trop

## Technologie

- **OpenAI GPT-4 Vision**: Pour l'extraction des noms de cartes depuis la photo
- **Vercel AI SDK**: Pour l'intégration avec OpenAI
- **Fuzzy Matching**: Comparaison intelligente des noms de cartes (tolérance aux petites différences)
- **Next.js Server Actions**: Pour l'exécution sécurisée de l'IA côté serveur

## Format de liste de deck supporté

```
2x Luke Skywalker
3x Darth Vader
1x Obi-Wan Kenobi
Han Solo
Chewbacca
```

Le parser supporte:
- Quantités au format `2x Carte` ou `x2`
- Numéros de ligne
- Puces (`-`, `•`, `*`)
