# Security Specification — NETWORK CORE Informational Portal

## 1. Data Invariants
1. **Strict Identity Integrity**: Every created `PortalEntry`, `EntryComment`, `ConceptAddendum`, `GlossaryTerm`, and `RoadmapItem` MUST bind `authorId == request.auth.uid`, and `request.auth.token.email_verified == true`.
2. **No PII Exposure**: Publicly readable collections (`entries`, `comments`, `concept_addenda`, `glossary_terms`, `roadmap_items`) MUST NOT contain emails, phone numbers, or addresses.
3. **Immutable Provenance**: `authorId` and `createdAt` (and `entryId` on comments) MUST remain immutable after creation (`incoming().field == existing().field`).
4. **Temporal Integrity**: `createdAt` MUST equal `request.time` on create; `updatedAt` MUST equal `request.time` on create and update.
5. **Master Gate on Subcollections**: An `EntryComment` under `/entries/{entryId}/comments/{commentId}` cannot exist without an existing parent entry in `/entries/{entryId}` and MUST match `entryVisibility == parent.visibility`.
6. **Zero-Trust Public vs Private Isolation**: Unauthenticated or non-owner queries can ONLY read or list documents where `visibility == 'public'` (or `entryVisibility == 'public'`). Private drafts (`visibility == 'private'`) are readable exclusively by `authorId == request.auth.uid` or `isAdmin()`.
7. **Strict Key & Size Bounds**: Every document enforces `keys().hasAll(...)` + `keys().hasOnly(...)` on create, `affectedKeys().hasOnly(...)` on update, and explicit `.size()` bounds on all strings.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing on Create**: Creating `/entries/e1` with `authorId: "victim-uid"` instead of `request.auth.uid` -> `PERMISSION_DENIED`.
2. **Shadow Field Injection**: Creating `/entries/e1` with an extra field `isOfficial: true` -> `PERMISSION_DENIED`.
3. **Unverified Email Spoofing**: Calling as an admin email with `email_verified: false` -> `PERMISSION_DENIED`.
4. **ID Poisoning**: Creating `/entries/` + 200-char ID or `/entries/bad$id` -> `PERMISSION_DENIED`.
5. **Denial-of-Wallet Payload**: Creating `/entries/e1` with a 50KB `body` string -> `PERMISSION_DENIED`.
6. **Timestamp Forgery**: Creating `/entries/e1` with a backdated `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
7. **Private Draft Scraping (List)**: Querying `/entries` without filtering `visibility == 'public'` or `authorId == uid` when private docs exist -> `PERMISSION_DENIED`.
8. **Cross-Author Update**: Non-admin user B updating user A's `/entries/e1` -> `PERMISSION_DENIED`.
9. **Immutable Author Hijack**: User A updating `/entries/e1` and changing `authorId` -> `PERMISSION_DENIED`.
10. **Status Escalation**: Non-admin author trying to self-promote `/entries/e1` `status` from `'discussion'` to `'accepted'` -> `PERMISSION_DENIED`.
11. **Orphaned Comment**: Creating `/entries/nonexistent/comments/c1` -> `PERMISSION_DENIED`.
12. **Comment Visibility Mismatch**: Creating a comment with `entryVisibility: 'public'` on a `'private'` entry -> `PERMISSION_DENIED`.
