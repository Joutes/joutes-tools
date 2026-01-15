# Migration de la date des erratas

## Objectif

Cette migration ajoute le champ `errataDate` aux erratas existants. Ce champ représente la date officielle de l'errata (généralement fournie par l'éditeur), distincte de la date de création dans la base de données.

## Changements apportés

1. **Types** :
   - Ajout du champ `errataDate: Date` aux types `Errata` et `ErrataDb`

2. **Actions** :
   - Modification de `createErrata` pour accepter et stocker `errataDate`
   - Ajout de l'action `updateErrata` pour modifier un errata existant

3. **Composants** :
   - Mise à jour de `AddErrataDialog` avec un champ de saisie de date
   - Création de `EditErrataDialog` pour modifier les erratas
   - Ajout du bouton d'édition dans les vues (liste et détail de carte)
   - Affichage de `errataDate` au lieu de `createdAt` dans l'interface

4. **Migration** :
   - Script pour ajouter `errataDate` aux erratas existants (copie de `createdAt`)

## Exécution de la migration

Pour les erratas existants, exécutez :

```bash
npm install dotenv tsx
npx tsx scripts/migrations/migrate-errata-date.ts
```

Cette migration définira `errataDate` égal à `createdAt` pour tous les erratas qui n'ont pas encore ce champ.

## Après la migration

Tous les nouveaux erratas auront désormais un champ `errataDate` que les administrateurs peuvent définir indépendamment de la date de création dans la base de données.
