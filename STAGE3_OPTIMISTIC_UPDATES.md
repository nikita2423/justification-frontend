# Optimistic UI Updates for Approval Workflow

## Overview
Implemented optimistic/fallback UI updates in the Stage 3 approval workflow. If the backend API call to save a decision fails (e.g., network error or server issue), the application now updates the local state in the table to reflect the user's decision, ensuring a smooth user experience.

## Changes

### 1. `hooks/use-get-cases.ts`
- **Exported `setCases`**: The hook now returns the `setCases` function, allowing components to manually update the fetched cases state.

```typescript
return {
    cases,
    setCases, // Exposed for manual updates
    // ...
};
```

### 2. `components/stage-3-approval.tsx`
- **Destructured `setCases`**: Retrieved `setCases` from the hook.
- **Updated `handleConfirmDecision`**:
  - Checks if API updates failed (`failedUpdates.length > 0`).
  - If failures occur, manually updates the local `cases` state with the new status and justification.
  - Adds a catch block fallback to update local state even on network errors.
  - Only triggers `refetchCases` (server sync) if the API update was successful, to avoid overwriting local fallback data with stale server data.

```typescript
if (failedUpdates.length > 0) {
  // Fallback: Update local state if API failed
  setCases((currentCases) => 
    currentCases.map((c) => 
      selectedProducts.includes(c.id) 
        ? { ...c, status: pendingDecision, justification: generatedJustification }
        : c
    )
  );
  // Alert user about local-only update
}
```

## User Experience
- **Success**: Status updates, justification saves, table refreshes from server.
- **Failure**: Status updates locally in the table, justification shows locally. User sees a warning that it was updated locally but server save failed. This allows the user to continue their workflow or retry later without losing context immediately.

## Files Modified
- `hooks/use-get-cases.ts`
- `components/stage-3-approval.tsx`
