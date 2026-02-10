# Get Cases API Implementation

## Overview
The Get Cases API allows fetching all cases from the NestJS backend with optional filtering capabilities. Cases are displayed with their case number and status prominently shown.

## API Endpoint

### GET `/api/cases`

Fetches all cases with optional query parameters for filtering.

#### Query Parameters (All Optional)

```typescript
{
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  caseNumber?: string;
  recdEG?: boolean;
  categoryId?: string;
}
```

#### Response (GetCasesResponse)

```typescript
{
  success: boolean;
  cases?: Case[];
  error?: string;
}
```

#### Case Object

```typescript
{
  id: string;
  caseNumber: string;
  status: StatusType;
  justification?: string;
  recdEG?: boolean;
  catalogueData?: Record<string, any>;
  egData?: Record<string, any>;
  applicationData?: Record<string, any>;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Implementation Details

### 1. API Route (`app/api/cases/route.ts`)

- **Method**: GET
- **Query Building**: Constructs query parameters from request
- **Forwarding**: Sends request to `${NEXT_PUBLIC_API_URL}/cases`
- **Error Handling**: Returns appropriate error responses
- **Logging**: Logs requests and responses for debugging

### 2. Custom Hook (`hooks/use-get-cases.ts`)

Provides a convenient interface for fetching cases:

```typescript
const { 
  cases,           // Array of Case objects
  isLoading,       // Loading state
  error,           // Error message if any
  filters,         // Current filters
  updateFilters,   // Update filter function
  refetch,         // Manual refetch function
  fetchCases       // Fetch with custom filters
} = useGetCases(initialFilters);
```

**Features:**
- Auto-fetches on mount
- Auto-refetches when filters change
- Manual refetch capability
- Loading and error state management
- Filter management

### 3. Cases List Component (`components/cases-list.tsx`)

A comprehensive UI component for displaying cases:

#### Features

1. **Search Functionality**
   - Search by case number
   - Real-time filtering

2. **Status Filtering**
   - Filter by status (All, Pending, Approved, Rejected, Under Review)
   - Color-coded status badges

3. **Data Display**
   - Table view with sortable columns
   - Case Number (prominently displayed)
   - Status (color-coded badge)
   - Category
   - EG Received status
   - Created date

4. **User Experience**
   - Loading states with spinner
   - Empty states with helpful messages
   - Error states with error details
   - Refresh button
   - Responsive design

### 4. Cases Page (`app/cases/page.tsx`)

Dedicated page for viewing all cases with standard layout.

### 5. Navigation Integration

Added "All Cases" link to sidebar:
- Desktop sidebar (icon-only)
- Mobile sidebar (with label)
- Active state highlighting
- Direct navigation to `/cases`

## Data Flow

```
User navigates to /cases
    ↓
CasesList component mounts
    ↓
useGetCases hook auto-fetches
    ↓
GET /api/cases
    ↓
Forward to ${NEXT_PUBLIC_API_URL}/cases
    ↓
NestJS backend returns cases
    ↓
Display in table with filters
```

## Usage Examples

### Basic Usage

```typescript
import { useGetCases } from "@/hooks/use-get-cases";

function MyCasesComponent() {
  const { cases, isLoading, error } = useGetCases();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {cases.map(c => (
        <li key={c.id}>
          {c.caseNumber} - {c.status}
        </li>
      ))}
    </ul>
  );
}
```

### With Filters

```typescript
const { cases, updateFilters, refetch } = useGetCases({
  status: 'pending'
});

// Update filters
updateFilters({ status: 'approved' });

// Manual refetch
refetch();
```

### Custom Fetch

```typescript
const { fetchCases } = useGetCases();

// Fetch with custom filters
const approvedCases = await fetchCases({ 
  status: 'approved',
  recdEG: true 
});
```

## UI Components

### Status Badges

Color-coded badges for different statuses:
- **Pending**: Yellow
- **Approved**: Green
- **Rejected**: Red
- **Under Review**: Blue

### Table Columns

1. **Case Number** (font-mono for better readability)
2. **Status** (color-coded badge)
3. **Category** (or "—" if not set)
4. **EG Received** (Yes/No badge)
5. **Created At** (formatted date)

### Filters Section

- **Search Input**: Filter by case number
- **Status Dropdown**: Filter by status
- Both filters work together (AND logic)

### Empty States

Different messages based on context:
- No cases at all: "Upload products to create cases"
- No matches: "Try adjusting your search criteria"

## Error Handling

### API Errors
- Network failures
- Backend unavailable
- Invalid responses

### Display
- Error banner with details
- Console logging for debugging
- User-friendly error messages

## Navigation

### Sidebar Links

**Desktop:**
- Icon-only display
- Tooltip on hover
- Active state highlighting

**Mobile:**
- Full label display
- Auto-close on navigation
- Active state highlighting

### Routes

- `/` - Dashboard
- `/cases` - All Cases
- Quick access to stages 1 & 3

## Performance Considerations

1. **Auto-fetch**: Only fetches on mount and filter changes
2. **Manual Refetch**: Available for user-triggered updates
3. **Client-side Filtering**: Search and status filter applied client-side
4. **Efficient Rendering**: Table only renders filtered results

## Backend Integration

The frontend expects the NestJS backend to:

1. **Endpoint**: `GET /cases`
2. **Query Parameters**: status, caseNumber, recdEG, categoryId
3. **Response**: Array of Case objects
4. **Status Codes**:
   - 200: Success
   - 400: Bad request
   - 500: Server error

## Testing

### Manual Testing

1. Navigate to `/cases` page
2. Verify cases are displayed
3. Test search functionality
4. Test status filter
5. Test refresh button
6. Verify loading states
7. Test error states (disconnect backend)

### Test Scenarios

1. **Empty State**: No cases in database
2. **Populated State**: Multiple cases with different statuses
3. **Filtered State**: Apply filters and verify results
4. **Error State**: Backend unavailable
5. **Loading State**: Slow network simulation

## Files Created/Modified

### New Files
- `app/api/cases/types.ts` - Extended with Case, CaseFilters, GetCasesResponse
- `app/api/cases/route.ts` - GET endpoint
- `hooks/use-get-cases.ts` - Custom hook
- `components/cases-list.tsx` - UI component
- `app/cases/page.tsx` - Cases page

### Modified Files
- `components/sidebar.tsx` - Added Cases navigation link

## Future Enhancements

1. **Pagination**: Handle large datasets
2. **Sorting**: Sort by any column
3. **Advanced Filters**: More filter options
4. **Export**: Export filtered results
5. **Case Details**: Click to view full case details
6. **Bulk Actions**: Select and update multiple cases
7. **Real-time Updates**: WebSocket for live updates
8. **Search Improvements**: Fuzzy search, multiple fields
