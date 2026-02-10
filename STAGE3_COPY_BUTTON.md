# Added Copy Button for Similar Cases and Updated API Hook

## Overview
Added a convenient copy button to similar case listings in Stage 3, allowing users to quickly copy justification text to the clipboard. Also updated the case update hook to use the correct POST method.

## Features Added

### 1. **Copy Functionality**
- Added `Check` and `Copy` icons from `lucide-react`
- Added state `copiedId` to track which item was copied
- Implemented `handleCopy` function with clipboard integration:
  ```typescript
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  ```
- Visual feedback: Icon changes from "Copy" to "Check" (green) for 2 seconds

### 2. **UI Updates**
- Added copy button to "Similar Cases Analysis" -> "Individual Cases" list
- Added copy button to "Similar Decisions" quick view list
- Button style: Ghost variant, icon-only, positioned next to product name

## API Hook Update (`hooks/use-update-case-status.ts`)

Changed the update method from `PATCH` to `POST` to match the backend route change made manually by the user.

```typescript
// Before
method: "PATCH",

// After
method: "POST",
```

## User Experience

1. User sees list of similar cases
2. Clicks copy icon next to a case name
3. Icon turns green (Check) to confirm copy
4. Justification text is in clipboard
5. User can paste into justification text area or elsewhere

## Files Modified
- `components/stage-3-approval.tsx`
- `hooks/use-update-case-status.ts`
