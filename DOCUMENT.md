# Project Documentation: Real-Time Comment Synchronization

## Overview
This documentation describes the implementation of a robust, real-time comment synchronization system designed to eliminate "double-rendering" artifacts when users submit comments or replies.

## The Problem: Double-Rendering Race Condition
Before the fix, the application exhibited a common "Optimistic UI" bug:
1.  **Optimistic UI:** When a user submitted a comment, the client immediately added a "pending" comment to the local cache with a temporary ID (e.g., `temp-123...`).
2.  **WebSocket Sync:** The server saved the comment and broadcasted a `comment:created` event with the permanent database UUID.
3.  **Conflict:** The client's WebSocket listener received the new comment. Since its UUID didn't match the `temp-` ID in the cache, the listener treated it as a completely new comment and added it to the list.
4.  **Result:** The user saw two identical comments for 1–2 seconds until the mutation's background refetch eventually cleaned up the cache.

## The Solution: Dual-Layer Deduplication
To ensure a smooth transition from "pending" to "final" state, a dual-layer synchronization strategy was implemented.

### 1. Mutation Success Layer (`useComments.ts`)
As soon as the API request for a new comment or reply succeeds:
-   The client receives the final comment object (with the real UUID).
-   The cache is immediately updated by searching for any optimistic comment (matched by `text`) and replacing it with the real object.
-   **Decision:** This ensures the temporary ID is swapped for the real ID *before* the WebSocket event typically arrives, preventing the socket listener from seeing a "new" ID.

### 2. WebSocket Listener Layer (`SocketProvider.tsx`)
The WebSocket listeners for `comment:created` and `reply:created` were hardened:
-   **ID Deduplication:** It first checks if the comment's ID already exists in the cache (standard deduplication).
-   **Optimistic Replacement:** If the ID is new, it searches the cache for an optimistic comment with the same `text` and `userId`. If found, it **replaces** that optimistic entry instead of adding a new one.
-   **Decision:** This handles cases where the WebSocket event might arrive *before* the mutation response, ensuring that other users see the comment instantly while the creator sees a seamless transition.

## Key Technical Decisions

### Matching Strategy
Since temporary IDs and database UUIDs never match, we match optimistic comments by:
1.  `userId`: Ensuring the comment belongs to the sender.
2.  `text`: Matching the content of the comment.
3.  `parentId`: Ensuring replies stay within the correct thread.

### Cache Scoping
-   Used `queryClient.setQueriesData` with partial query keys (`['comments', postId]`).
-   **Decision:** This ensures that comments are updated across all instances of the query, regardless of the pagination `limit` or `offset` currently active in the UI.

### Type Safety and Performance
-   Replaced `any` types with the explicit `PostComment` interface for better developer experience and type safety.
-   Maintained the `isOptimistic` flag to provide visual feedback ("Sending...") without compromising the underlying data structure.

## UI/UX Impact
Users now experience:
-   **Instant Feedback:** Comments appear immediately with a subtle loading state.
-   **Zero Flickering:** The transition from "Sending..." to "Final" is seamless with no duplicates.
-   **Real-time Consistency:** Other users see comments instantly without requiring a page refresh or manual cache invalidation.
