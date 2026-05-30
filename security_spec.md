# Security Specification

## Data Invariants
- A user document in `users/{userId}` can only be read or written by the user whose UID matches `userId`.
- The `uid` field inside the document must match the `userId` in the path and `request.auth.uid`.
- The `createdAt` field must be set on creation and cannot be updated.

## Dirty Dozen Payloads
1. Create user document with wrong UID.
2. Read a user document with a different UID.
3. Update a user document with a different UID.
4. Overwrite `createdAt` field.
5. Create user document without required fields.
6. Delete a user document (maybe allowed for account deletion, but must be the owner).
7. Create a user document with payload over size limits.
8. Unauthenticated read.
9. Unauthenticated write.
10. Update a document replacing a string with an object.
11. Add a ghost field `isAdmin: true`.
12. Attempt to list all users.
