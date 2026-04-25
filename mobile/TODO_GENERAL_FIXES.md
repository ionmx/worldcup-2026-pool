# TODO General Fixes

## Critical

- [x] Persist Firebase Auth session in React Native with AsyncStorage.
  - Current risk: Firebase Auth falls back to memory persistence and users can lose session after app restart.

- [ ] Harden private league joins at the Realtime Database rules level.
  - Current risk: authenticated users can write themselves into `leagueMembers/{leagueId}/{uid}` if they know a `leagueId`.
  - Proposed direction: stop exposing invite codes in public league records, add an invite-code join flow that rules can validate, or move joining behind a Cloud Function.

- [x] Prevent deleting an account that owns leagues, or support ownership transfer.
  - Current risk: `deleteUserAccount()` can leave leagues with an `ownerId` that no longer exists.

- [ ] Split public user profile data from private user data.
  - Current risk: `users` is publicly readable, including emails. Ranking only needs public fields.

## High

- [x] Fix `LeagueContext` selected-league synchronization so realtime updates do not use stale state.
  - Current risk: selected league can be overwritten or fail to clear when league membership changes.

- [x] Optimize league leaderboard reads.
  - Current risk: `subscribeToLeaderboard()` subscribes to all `users` and filters locally.
  - Proposed direction: read only member IDs, or denormalize `leagueLeaderboards/{leagueId}`.

- [ ] Index invite codes.
  - Current risk: `getLeagueByInviteCode()` scans all leagues.
  - Proposed direction: maintain `inviteCodes/{code}: leagueId`.

## Medium

- [x] Memoize matches grouping/filtering/rendering.
  - Current risk: `useMatches()` rebuilds sections on every render and `MatchCard` is not memoized.

- [ ] Make next-match navigation more robust and more visible.
  - Current risk: `scrollToLocation()` is fragile with variable-height cards.
  - Proposed direction: add a compact "Proximo partido" block and keep auto-scroll best-effort only.

- [ ] Move Google redirect URI to env/config.
  - Current risk: redirect URL is hardcoded to a specific Expo owner/project.

- [ ] Improve prediction save UX.
  - Current risk: predictions save on blur with minimal feedback.
  - Proposed direction: inline states like "Guardando", "Guardado", "Error al guardar".

- [ ] Add neutral auth error messaging where needed.
  - Current risk: username reset/login flows can reveal whether a username exists.
