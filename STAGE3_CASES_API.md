# Stage 3 - Load Cases from API

## Overview
Stage 3 (Approval) has been updated to load cases from the NestJS backend API instead of using local products from the store. Cases are now displayed with **Case Number**, **Status**, **Product Name**, and **Ref Number** prominently at the beginning of the table.

## Changes Made

### 1. **Added API Integration**
- Imported `useGetCases` hook from `@/hooks/use-get-cases`
- Imported `Case` type from `@/app/api/cases/types`
- Cases are automatically fetched when the component mounts

### 2. **Updated Table Display**

#### Priority Columns (Highlighted with bg-primary/5):
1. **Case Number** - Displayed in monospace font
2. **Status** - Color-coded badge (Pending/Approved/Rejected/Under Review)
3. **Product Name** - Extracted from `egData.App_PNam_Mod` or `applicationData.PA_PName`
4. **Ref Number** - Extracted from `egData.Ref` or `egData.SWD_Ref`

#### Followed by EG Data Columns:
- App_No, Tranche, EB_RM, NO, NO_R, Staff, etc.
- All other EG form fields

### 3. **Enhanced User Experience**

#### Loading State:
- Spinner animation while fetching cases
- "Loading cases..." message
- Disabled refresh button during load

#### Error Handling:
- Red error banner if API fails
- Displays error message
- User can retry with refresh button

#### Empty State:
- Icon and helpful message when no cases exist
- Guides user to upload products in Stage 1

#### Search Functionality:
- Search by case number
- Search by product name
- Real-time filtering

#### Refresh Button:
- Manual refresh capability
- Spinning icon during refresh
- Disabled during loading

### 4. **Data Extraction Logic**

```typescript
// Product Name
const productName = caseItem.egData?.App_PNam_Mod || 
                   caseItem.applicationData?.PA_PName || 
                   "—";

// Ref Number
const refNo = caseItem.egData?.Ref || 
             caseItem.egData?.SWD_Ref || 
             "—";

// Other EG Data
const getData = (key: string) => {
  const egVal = caseItem.egData?.[key];
  if (egVal !== undefined && egVal !== null && egVal !== "") return egVal;
  return "—";
};
```

### 5. **Status Color Coding**

```typescript
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  under_review: "bg-blue-100 text-blue-800 border-blue-300",
};
```

## Data Flow

```
Stage 3 Component Mounts
    ↓
useGetCases hook auto-fetches
    ↓
GET /api/cases
    ↓
NestJS Backend returns cases
    ↓
Cases displayed in table
    ↓
User can search/filter/select cases
```

## Table Structure

| Checkbox | **Case Number** | **Status** | **Product Name** | **Ref No** | App_No | Tranche | ... |
|----------|-----------------|------------|------------------|------------|--------|---------|-----|
| ☐        | CASE-001        | PENDING    | Wheelchair       | REF-123    | APP-01 | A       | ... |
| ☐        | CASE-002        | APPROVED   | Walker           | REF-124    | APP-02 | B       | ... |

**Note:** The first 4 columns (Case Number, Status, Product Name, Ref No) have a light blue background (`bg-primary/5`) to make them stand out.

## Features

### 1. **Auto-Fetch on Mount**
- Cases load automatically when user navigates to Stage 3
- No manual action required

### 2. **Real-Time Search**
- Filter by case number
- Filter by product name
- Instant results

### 3. **Manual Refresh**
- Refresh button in header
- Fetches latest data from backend
- Visual feedback during refresh

### 4. **Selection**
- Click row to select
- Checkbox for explicit selection
- Select all checkbox in header
- Selected rows highlighted

### 5. **Error Resilience**
- Graceful error handling
- Clear error messages
- Retry capability

## Backend Requirements

The backend API must return cases with the following structure:

```typescript
{
  id: string;
  caseNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  egData?: {
    App_PNam_Mod?: string;
    Ref?: string;
    SWD_Ref?: string;
    NO?: string;
    NO_R?: string;
    // ... other EG fields
  };
  applicationData?: {
    PA_PName?: string;
    // ... other application fields
  };
  // ... other case fields
}
```

## Usage

1. Navigate to Stage 3 (Approval)
2. Cases load automatically from API
3. View case number, status, product name, and ref number at a glance
4. Search for specific cases
5. Select cases for approval/rejection
6. Generate AI justifications
7. Confirm decisions

## Benefits

1. **Real-Time Data**: Always shows latest cases from backend
2. **Centralized Storage**: Cases stored in database, not local state
3. **Better Performance**: Only loads necessary data
4. **Scalability**: Can handle large numbers of cases
5. **Consistency**: Same data across all users
6. **Persistence**: Cases survive page refreshes

## Migration from Local Products

### Before:
- Used `products` from Zustand store
- Filtered by `status === "pending_review"`
- Data only in browser memory

### After:
- Uses `cases` from API
- Filtered by backend or client-side search
- Data persisted in database
- Accessible across sessions

## Testing

### Manual Testing:
1. Create cases in Stage 2
2. Navigate to Stage 3
3. Verify cases load automatically
4. Test search functionality
5. Test refresh button
6. Test selection
7. Verify error handling (disconnect backend)

### Test Scenarios:
1. **No Cases**: Empty state displayed
2. **Loading**: Spinner shown
3. **Error**: Error banner displayed
4. **Success**: Cases table shown
5. **Search**: Filtered results
6. **Refresh**: Latest data fetched

## Future Enhancements

1. **Pagination**: Handle large datasets
2. **Sorting**: Sort by any column
3. **Advanced Filters**: Filter by status, date, etc.
4. **Bulk Actions**: Approve/reject multiple cases
5. **Case Details**: Click to view full case details
6. **Real-Time Updates**: WebSocket for live updates
7. **Export**: Export cases to Excel/CSV
8. **Audit Trail**: Track case history

## Files Modified

- `components/stage-3-approval.tsx` - Main changes
  - Added `useGetCases` hook
  - Replaced products table with cases table
  - Added priority columns (Case Number, Status, Product Name, Ref No)
  - Added loading, error, and empty states
  - Added refresh functionality
  - Updated search to work with cases

## Notes

- The lint errors in `stage-1-upload.tsx` are unrelated to this change
- They involve file type assignments and should be addressed separately
- The Stage 3 changes are complete and functional
