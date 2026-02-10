# Create Case API Implementation

## Overview
The Create Case API allows the system to create cases in the backend after users upload and confirm product data (Application, EG Form, and Catalogue).

## API Endpoint

### POST `/api/cases/create`

Creates a new case with the provided product data.

#### Request Body (CreateCaseDto)

```typescript
{
  caseNumber: string;          // Required: Unique case identifier
  status?: StatusType;         // Optional: 'pending' | 'approved' | 'rejected' | 'under_review'
  justification?: string;      // Optional: Approval/rejection justification
  recdEG?: boolean;           // Optional: Whether EG form was received
  catalogueData?: Record<string, any>;     // Optional: Catalogue/product data
  egData?: Record<string, any>;            // Optional: EG form data
  applicationData?: Record<string, any>;   // Optional: Application form data
  categoryId?: string;        // Optional: Product category ID
}
```

#### Response (CreateCaseResponse)

```typescript
{
  success: boolean;           // Whether the operation succeeded
  caseId?: string;           // ID of the created case (if successful)
  message?: string;          // Success message
  error?: string;            // Error message (if failed)
}
```

## Implementation Details

### 1. API Route (`app/api/cases/create/route.ts`)

- **Validation**: Ensures `caseNumber` is provided and at least one data type exists
- **Forwarding**: Sends request to backend API at `${NEXT_PUBLIC_API_URL}/cases`
- **Error Handling**: Catches and returns appropriate error messages
- **Logging**: Logs request details and backend responses for debugging

### 2. Custom Hook (`hooks/use-create-case.ts`)

Provides a convenient interface for components to create cases:

```typescript
const { createCase, isLoading, error } = useCreateCase();

// Usage
const result = await createCase({
  caseNumber: "SWD-2024-001",
  status: "pending",
  recdEG: true,
  catalogueData: { /* ... */ },
  egData: { /* ... */ },
  applicationData: { /* ... */ },
});
```

**Features:**
- Loading state management
- Error handling
- Promise-based API
- Returns null on error, response object on success

### 3. Integration in Stage 2 Preview

The create case functionality is integrated into the Stage 2 Preview component:

#### When Cases are Created

Cases are automatically created when users click "Continue to Approval" in Stage 2:

1. **Validation**: Checks that at least one product is confirmed
2. **Case Number Generation**: Extracts case number from product data:
   - Priority: `SWD_Ref` → `Ref` → `PA_RefL` → Generated ID
3. **Batch Creation**: Creates cases for all confirmed products in parallel
4. **Error Handling**: Shows alerts if any cases fail to create
5. **Status Update**: Marks products as "pending_review"
6. **Navigation**: Proceeds to Stage 3 (Approval)

#### User Experience

- **Loading State**: Button shows "Creating Cases..." with spinner
- **Disabled State**: Both buttons disabled during creation
- **Error Feedback**: Alert shown if cases fail to create
- **Success Feedback**: Console logs successful creation count

## Data Flow

```
Stage 2 Preview (User confirms products)
    ↓
handleProceed() triggered
    ↓
For each confirmed product:
    - Extract case number from product data
    - Prepare case data (catalogueData, egData, applicationData)
    - Call createCase() hook
    ↓
useCreateCase hook
    ↓
POST /api/cases/create
    ↓
Validation & Forwarding
    ↓
Backend API (${NEXT_PUBLIC_API_URL}/cases)
    ↓
Response returned
    ↓
Update product status to "pending_review"
    ↓
Navigate to Stage 3 (Approval)
```

## Case Number Generation Logic

The system attempts to extract the case number from product data in this order:

1. `product.egData.data.SWD_Ref` - SWD Reference from EG form
2. `product.egData.data.Ref` - Reference from EG form
3. `product.applicationData.data.PA_RefL` - Reference from Application form
4. `CASE-{productId}` - Fallback generated ID

## Error Handling

### Validation Errors (400)
- Missing case number
- No data provided (catalogueData, egData, or applicationData)

### Backend Errors (5xx)
- Backend API unavailable
- Database errors
- Invalid data format

### Client Errors
- Network failures
- Timeout errors
- JSON parsing errors

All errors are:
- Logged to console for debugging
- Shown to user via alert dialogs
- Returned in the response object

## Example Usage

### Creating a Single Case

```typescript
import { useCreateCase } from "@/hooks/use-create-case";

function MyComponent() {
  const { createCase, isLoading, error } = useCreateCase();

  const handleCreate = async () => {
    const result = await createCase({
      caseNumber: "SWD-2024-001",
      status: "pending",
      recdEG: true,
      catalogueData: {
        product_name: "Wheelchair",
        model: "WC-2000",
        description: "Electric wheelchair"
      },
      egData: {
        SWD_Ref: "SWD-2024-001",
        Tranche: "A",
        Season: "Spring 2024"
      },
      applicationData: {
        PA_RefL: "APP-001",
        PA_PName: "Wheelchair",
        TotAmtR: 5000
      }
    });

    if (result?.success) {
      console.log("Case created:", result.caseId);
    } else {
      console.error("Failed to create case:", error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? "Creating..." : "Create Case"}
    </button>
  );
}
```

### Creating Multiple Cases (Batch)

```typescript
const handleBatchCreate = async (products: Product[]) => {
  const promises = products.map(product => 
    createCase({
      caseNumber: product.egData?.data?.SWD_Ref || `CASE-${product.id}`,
      status: "pending",
      recdEG: true,
      catalogueData: product.catalogueData?.data || {},
      egData: product.egData?.data || {},
      applicationData: product.applicationData?.data || {},
    })
  );

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r?.success).length;
  
  console.log(`Created ${successCount}/${products.length} cases`);
};
```

## Testing

### Manual Testing

1. Upload products with Application, EG, and Catalogue files
2. Navigate to Stage 2 (Preview)
3. Confirm one or more products
4. Click "Continue to Approval"
5. Verify:
   - Loading state appears
   - Console shows case creation logs
   - Cases are created in backend
   - Navigation proceeds to Stage 3

### Backend Requirements

The backend API must:
- Accept POST requests at `/cases`
- Handle the CreateCaseDto payload
- Return a response with `id` or `caseId` field
- Return appropriate HTTP status codes

## Files Created/Modified

### New Files
- `app/api/cases/types.ts` - TypeScript types
- `app/api/cases/create/route.ts` - API route handler
- `hooks/use-create-case.ts` - Custom React hook

### Modified Files
- `components/stage-2-preview.tsx` - Integrated case creation

## Configuration

The API uses the backend URL from `lib/utils.ts`:

```typescript
export const NEXT_PUBLIC_API_URL = `http://${BACKEND_IP}:3000`;
```

Ensure this points to your backend server.

## Future Enhancements

1. **Retry Logic**: Automatically retry failed case creations
2. **Progress Indicator**: Show individual case creation progress
3. **Bulk Operations**: Optimize batch creation with single API call
4. **Offline Support**: Queue cases for creation when offline
5. **Validation**: More robust data validation before sending
6. **Toast Notifications**: Replace alerts with toast notifications
