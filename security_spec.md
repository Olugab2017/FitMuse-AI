# Security Specification: FitMuse AI Firebase Rules

## Data Invariants
1. A User's profile `/users/{userId}` can only be read or modified by the authenticated user themselves owning that `userId`. No other user can view or alter user-specific PII (e.g. name, email, style profile, or purchase order history).
2. The user ID (`userId`) must be formatted correctly matching alphanumeric characters.
3. Timestamps or specific field sizes must be strictly constrained to prevent buffer-overflow or wallet-exhaustion vectors.

## Clean Room Audit (The "Dirty Dozen" Payloads)
Below are 12 payload profiles that will be strictly blocked by the security architecture rules:
1. `Malicious Read User Profile`: Unauthenticated user attempting to query profile of userId `123`.
2. `Impersonating Write`: User `A` trying to write a profile under document ID `B` (e.g. `request.auth.uid != userId`).
3. `Email Spoofing`: User attempting to register with an empty/uncontrolled email format.
4. `Giant Name Injection`: User trying to create profile containing string size > 200 characters to break indexing systems.
5. `Orphaned Writes/Admin Promotion`: Trying to inject field like `isAdmin: true` or `role: "admin"` directly into the profile.
6. `Unsigned In Write`: Anonymous write without active JWT verification credentials.
7. `Bypassing ID Validation`: Write containing suspicious path variable or ID characters like `../` or `%20` or non-standard symbols.
8. `PII Blanket Leak Query`: Querying all files across `/users` without specifying a secure single-document get filter matched with user UI tracking.
9. `Malicious Order Forging`: Injecting fraudulent orders directly or changing statuses of completed orders.
10. `Avatar URL Buffer Overflow`: Uploading an extremely long mock text string in format of `avatarUrl` (> 3000 bytes).
11. `Invalid Style Schema Injection`: Inserting strings/booleans instead of deep maps into `styleProfile` container field.
12. `System State Bypassing`: Bypassing basic user identification mapping on registration triggers.
