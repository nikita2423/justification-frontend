# Save Case Data API

## Endpoint

**POST** `/api/cases/[id]/save`

## Description

Saves or updates the EG data, catalogue data, and/or application data for a specific case. This endpoint allows you to update any combination of case data fields without affecting other fields.

## Parameters

### Path Parameters

- `id` (string, required): The unique identifier of the case to update

### Request Body

```typescript
{
  egData?: Record<string, any>;              // EG Form data
  catalogueData?: Record<string, any>;       // Catalogue/Product data
  applicationData?: Record<string, any>;     // Application data
  categoryId?: string;                       // Category identifier
  recdEG?: boolean;                          // Whether EG was received
}
```

**Note**: At least one of the following must be provided:

- `egData`
- `catalogueData`
- `applicationData`
- `categoryId`
- `recdEG`

## Response

### Success (200)

```json
{
  "success": true,
  "case": {
    "id": "case-123",
    "caseNumber": "CASE-2024-001",
    "userId": "user-456",
    "status": "pending",
    "egData": { ... },
    "catalogueData": { ... },
    "applicationData": { ... },
    "updatedAt": "2024-03-05T10:30:00Z"
  },
  "message": "Case data saved successfully"
}
```

### Error Responses

**400 Bad Request** - Missing required data:

```json
{
  "success": false,
  "error": "At least one of egData, catalogueData, applicationData, categoryId, or recdEG must be provided"
}
```

**404 Not Found** - Case not found:

```json
{
  "success": false,
  "error": "Case not found"
}
```

**500 Internal Server Error**:

```json
{
  "success": false,
  "error": "Failed to save case data"
}
```

## Usage Examples

### Using the Hook (Recommended)

```typescript
import { useSaveCaseData } from "@/hooks/use-save-case-data";

function MyComponent() {
  const { saveCaseData, isLoading, error } = useSaveCaseData();

  const handleSave = async () => {
    const result = await saveCaseData("case-123", {
      egData: {
        App_No: "12345",
        Tranche: "T1",
        EB_RM: "EB123"
      },
      catalogueData: {
        products: [{
          product_name: "Product Name",
          model: "Model-X",
          description: "Description here"
        }]
      }
    });

    if (result.success) {
      console.log("Case saved:", result.case);
    } else {
      console.error("Error:", result.error);
    }
  };

  return (
    <button onClick={handleSave} disabled={isLoading}>
      {isLoading ? "Saving..." : "Save Case"}
    </button>
  );
}
```

### Using Fetch Directly

```typescript
const response = await fetch("/api/cases/case-123/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    egData: {
      App_No: "12345",
      Staff: "John Doe",
    },
    applicationData: {
      PA_PName: "Product A",
      PA_Brand: "Brand X",
    },
  }),
});

const data = await response.json();

if (data.success) {
  console.log("Case updated:", data.case);
}
```

## Integration with Stage 3 Approval

The `handleSaveEditedCase` function in the Stage 3 Approval component automatically uses this API to save case data when editing cases in the modal.

## Notes

- The API forwards requests to the NestJS backend at `${NEXT_PUBLIC_API_URL}/cases/[id]/save`
- Only provided fields are updated; omitted fields are not modified
- The `updatedAt` timestamp is automatically set by the backend
- All data is persisted to the database
