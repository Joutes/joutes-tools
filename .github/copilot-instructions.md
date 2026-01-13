# Copilot Instructions - Joutes Tools

## Architecture Overview

This is a Next.js 16 (App Router) application for managing card game collections with MongoDB, Better-Auth, and Meilisearch. It uses a multi-game architecture where users can manage collections (boosters/cards) across different games.

### Key Components

- **Authentication**: Better-Auth with Email OTP (via Resend) and Passkey support
- **Database**: MongoDB with `mongodb` driver (not Mongoose)
- **Search**: Meilisearch for card search functionality
- **UI**: React 19 + Radix UI + Tailwind CSS 4
- **State**: React Context for game selection, auth hooks for session management

### Data Flow Pattern

1. **Server Components** fetch data directly from MongoDB ([lib/data/boosters.ts](lib/data/boosters.ts))
2. **Client Components** use Server Actions for mutations ([app/collection/boosters/action.ts](app/collection/boosters/action.ts))
3. **API Routes** handle search and external integrations ([app/api/games/[gameId]/cards/route.ts](app/api/games/[gameId]/cards/route.ts))

## Critical Conventions

### Database Patterns

**Always use ObjectId transformations:**
```typescript
// Reading from DB - convert ObjectId to string
{
  id: booster._id.toString(),
  userId: booster.userId.toString(),
  gameId: booster.gameId.toString(),
}

// Writing to DB - convert string to ObjectId
{
  userId: new ObjectId(session.user.id),
  gameId: new ObjectId(booster.gameId),
}
```

**Database singleton pattern:** Import `db` from [lib/mongodb.ts](lib/mongodb.ts) - it handles connection pooling automatically (see HMR-safe global variable pattern in dev mode).

### Server vs Client Components

**Use `"use server"` for Server Actions:**
- Must be at the top of action files ([app/collection/boosters/action.ts](app/collection/boosters/action.ts))
- Always check authentication via `auth.api.getSession({ headers: await headers() })`
- Call `revalidatePath()` after mutations
- Use `redirect()` for navigation (not `router.push()`)

**Use `"use client"` for:**
- Context providers ([hooks/game-context.tsx](hooks/game-context.tsx))
- Hooks that use React state/effects ([hooks/use-auth.ts](hooks/use-auth.ts))
- Interactive UI components with event handlers
- All Radix UI components

### Authentication Flow

**Client-side auth check:**
```typescript
import { useRequireAuth } from "@/hooks/use-auth";

export default function ProtectedPage() {
  const { session, isPending } = useRequireAuth(); // Auto-redirects to /login
  if (isPending) return <div>Loading...</div>;
  // ... rest of component
}
```

**Server-side auth check (in Server Actions):**
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) {
  throw new Error("Utilisateur non authentifié");
}
```

### Game Context System

The app supports multiple games with a context-based switcher:
- Games stored in MongoDB `games` collection with `{ name, slug, icon }` schema
- Active game persisted in localStorage and React Context ([hooks/game-context.tsx](hooks/game-context.tsx))
- Use `useGame()` hook to access current game in client components
- Sidebar component fetches available games server-side ([components/MainSideBar.tsx](components/MainSideBar.tsx))

## Development Workflows

### Environment Setup

Required variables (see [.env.example](.env.example)):
```bash
MONGODB_URI=mongodb://localhost:27017/mtg-tools
BETTER_AUTH_SECRET=<generate with scripts/generate-auth-secret.js>
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=CONSOLE  # Use "CONSOLE" for dev (logs OTP to console)
MEILISEARCH_ENDPOINT=http://localhost:7700
```

**Dev mode OTP behavior:** When `RESEND_API_KEY=CONSOLE`, OTP codes are logged to console instead of sent via email (see [lib/auth.ts](lib/auth.ts#L18-L22)).

### Starting Development

```bash
npm run dev  # Starts Next.js dev server on :3000
node scripts/setup-meili.js  # Setup Meilisearch indexes (run once)
```

### Database Queries

**Aggregation pattern for related data:**
```typescript
const boosters = await db.collection<BoosterDb>('boosters').aggregate([
  { $match: query },
  { $lookup: {
      from: 'booster-cards',
      localField: '_id',
      foreignField: 'boosterId',
      as: 'cards',
    }
  },
]).toArray();
```

See [lib/data/boosters.ts](lib/data/boosters.ts) for comprehensive examples.

### Meilisearch Integration

- Index setup: [scripts/setup-meili.js](scripts/setup-meili.js)
- Index names in [lib/meilisearch.ts](lib/meilisearch.ts) (e.g., `indexes.riftbound`)
- Custom search logic with filters in API routes ([app/api/games/[gameId]/cards/route.ts](app/api/games/[gameId]/cards/route.ts))

**Search filter syntax:**
```typescript
queryOptions.filter.push(
  `lang IN [en, ${lang}]`,     // Multi-value filter
  `setCode = ${setCode}`,       // Exact match
  `collectorNumber CONTAINS "${num}"`,  // Partial match
);
```

## Type System

**Dual type pattern for DB vs API:**
- `BoosterDb` for MongoDB documents (uses `ObjectId`)
- `Booster` for API/UI (uses `string` IDs)
- Always transform between them at data boundaries

Example in [lib/types/booster.ts](lib/types/booster.ts):
```typescript
export type Booster = { id: string; userId: string; ... };
export type BoosterDb = { userId: ObjectId; ... }; // No id, MongoDB adds _id
```

## UI Patterns

- Radix UI primitives in [components/ui/](components/ui/)
- Sidebar layout with [components/ui/sidebar.tsx](components/ui/sidebar.tsx)
- Path imports use `@/` alias (configured in [tsconfig.json](tsconfig.json#L20-L22))
- Tailwind config uses v4 with `@tailwindcss/postcss`

## Common Pitfalls

1. **Don't forget `"use server"`** in action files - Next.js won't expose them otherwise
2. **Always await `params`** in dynamic routes (Next.js 15+ requirement): `const { gameId } = await params;`
3. **Use `headers: await headers()`** when calling auth in Server Actions (not `request: req`)
4. **Import 'server-only'** in server-side modules to catch accidental client usage
5. **Call `revalidatePath()`** after Server Actions to update cached data

## Project-Specific Vocabulary

- **Booster**: A pack of cards opened by a user (stored with metadata like `setCode`, `lang`, `type`)
- **Game**: A card game system (e.g., Magic: The Gathering, Star Wars Unlimited)
- **Collection**: User's inventory of boosters and cards across games
