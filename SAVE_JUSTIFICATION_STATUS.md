# Save Justification and Status to Backend

## Overview
After generating AI justification in Stage 3, the system now saves both the justification and the approval/rejection status to the backend database using the NestJS API.

## API Endpoint

### PATCH `/api/cases/:id/status-justification`

Updates a case's status and/or justification.

#### Request Body (UpdateCaseStatusAndJustificationDto)
```typescript
{
  status?: 'approved' | 'rejected';
  justification?: string;
}
```

#### Response (UpdateCaseResponse)
```typescript
{
  success: boolean;
  case?: Case;
  error?: string;
}
```

#### Status Codes
- **200**: Case updated successfully
- **400**: Invalid status transition or bad request
- **404**: Case not found
- **500**: Server error

## Implementation

### 1. **API Route** (`app/api/cases/[id]/status-justification/route.ts`)

Forwards PATCH requests to the NestJS backend:

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  // Validate status
  if (body.status && !['approved', 'rejected'].includes(body.status)) {
    return NextResponse.json(
      { success: false, error: "Invalid status" },
      { status: 400 }
    );
  }

  // Forward to NestJS backend
  const response = await fetch(
    `${NEXT_PUBLIC_API_URL}/cases/${id}/status-justification`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  
  return NextResponse.json(
    { success: true, case: data },
    { status: 200 }
  );
}
```

### 2. **Custom Hook** (`hooks/use-update-case-status.ts`)

Provides a convenient interface for updating cases:

```typescript
export function useUpdateCaseStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCaseStatus = useCallback(
    async (
      caseId: string,
      data: UpdateCaseStatusAndJustificationDto
    ): Promise<UpdateCaseResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/cases/${caseId}/status-justification`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const result: UpdateCaseResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to update case");
        }

        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { updateCaseStatus, isLoading, error };
}
```

### 3. **Stage 3 Integration** (`components/stage-3-approval.tsx`)

Updated `handleConfirmDecision` to save to backend:

```typescript
const handleConfirmDecision = useCallback(async () => {
  if (!pendingDecision || !generatedJustification) return;

  try {
    setIsGeneratingJustification(true);

    // Update each selected case with status and justification
    const updatePromises = selectedProducts.map(async (caseId) => {
      const selectedCase = cases.find((c) => c.id === caseId);
      if (!selectedCase) return null;

      console.log(`Updating case ${selectedCase.caseNumber}:`, {
        status: pendingDecision,
        justification: generatedJustification.substring(0, 100) + "...",
      });

      return updateCaseStatus(caseId, {
        status: pendingDecision,
        justification: generatedJustification,
      });
    });

    const results = await Promise.all(updatePromises);

    // Check for failures
    const failedUpdates = results.filter((r) => !r || !r.success);
    
    if (failedUpdates.length > 0) {
      alert(`Warning: ${failedUpdates.length} case(s) failed to update.`);
    } else {
      alert(`Successfully ${pendingDecision} ${results.length} case(s).`);
    }

    // Refresh cases list to show updated statuses
    await refetchCases();

    // Clear state
    clearSelection();
    setGeneratedJustification("");
    setPendingDecision(null);
  } catch (error) {
    console.error("Error confirming decision:", error);
    alert("An error occurred while updating cases.");
  } finally {
    setIsGeneratingJustification(false);
  }
}, [
  pendingDecision,
  generatedJustification,
  selectedProducts,
  cases,
  updateCaseStatus,
  refetchCases,
]);
```

## Workflow

### Complete Approval/Rejection Flow

```
1. User selects case(s) in Stage 3
    ↓
2. User clicks "Approve" or "Reject"
    ↓
3. System generates AI justification
    ↓
4. User reviews justification
    ↓
5. User clicks "Confirm Decision"
    ↓
6. For each selected case:
   - PATCH /api/cases/:id/status-justification
   - Body: { status: 'approved', justification: '...' }
    ↓
7. Backend validates and saves:
   - Updates case.status
   - Updates case.justification
   - Saves to database
    ↓
8. Frontend receives confirmation
    ↓
9. Refreshes cases list
    ↓
10. Shows success message
    ↓
11. Clears selection and state
```

## Example Usage

### Approve a Case

```typescript
const { updateCaseStatus } = useUpdateCaseStatus();

// After generating justification
await updateCaseStatus(caseId, {
  status: 'approved',
  justification: 'Based on comprehensive review...'
});
```

### Reject a Case

```typescript
await updateCaseStatus(caseId, {
  status: 'rejected',
  justification: 'Missing required documentation...'
});
```

### Update Only Justification

```typescript
await updateCaseStatus(caseId, {
  justification: 'Updated justification text...'
});
```

### Update Only Status

```typescript
await updateCaseStatus(caseId, {
  status: 'approved'
});
```

## Data Flow

### Request Flow

```
Frontend (Stage 3)
    ↓
handleConfirmDecision()
    ↓
updateCaseStatus(caseId, { status, justification })
    ↓
PATCH /api/cases/:id/status-justification
    ↓
Next.js API Route
    ↓
PATCH ${NEXT_PUBLIC_API_URL}/cases/:id/status-justification
    ↓
NestJS Backend
    ↓
Validate status transition
    ↓
Update case in database
    ↓
Return updated case
    ↓
Frontend receives confirmation
    ↓
Refresh cases list
    ↓
Show success message
```

## Error Handling

### Validation Errors

```typescript
// Invalid status
{
  success: false,
  error: "Invalid status. Must be 'approved' or 'rejected'"
}

// Case not found
{
  success: false,
  error: "Case not found"
}

// Invalid status transition
{
  success: false,
  error: "Invalid status transition"
}
```

### Network Errors

```typescript
try {
  await updateCaseStatus(caseId, data);
} catch (error) {
  console.error("Error updating case:", error);
  alert("An error occurred while updating cases.");
}
```

### Partial Failures

When updating multiple cases, some may succeed while others fail:

```typescript
const results = await Promise.all(updatePromises);
const failedUpdates = results.filter((r) => !r || !r.success);

if (failedUpdates.length > 0) {
  alert(`Warning: ${failedUpdates.length} case(s) failed to update.`);
}
```

## User Feedback

### Success Messages

- **Single Case**: "Successfully approved 1 case with AI-generated justification."
- **Multiple Cases**: "Successfully approved 3 cases with AI-generated justification."

### Error Messages

- **Validation Error**: "Invalid status. Must be 'approved' or 'rejected'"
- **Network Error**: "An error occurred while updating cases. Please try again."
- **Partial Failure**: "Warning: 2 case(s) failed to update. Please check the console for details."

## Console Logging

The system logs detailed information for debugging:

```typescript
// Before update
console.log("Confirming approved decision for 3 case(s)");
console.log("Updating case SWD/EB/I&TF/T11/1578P/None:", {
  status: "approved",
  justification: "Based on comprehensive review..."
});

// After update
console.log("Successfully updated 3 case(s) with approved status");

// On error
console.error("Error confirming decision:", error);
```

## Backend Requirements

The NestJS backend must:

1. **Validate Status Transitions**
   - Ensure valid status values ('approved' or 'rejected')
   - Check if transition is allowed

2. **Update Database**
   - Update `case.status` if provided
   - Update `case.justification` if provided
   - Save changes to database

3. **Return Updated Case**
   - Return full case object after update
   - Include all case fields

## Testing

### Manual Testing

1. **Approve a Case**
   - Select a case
   - Click "Approve"
   - Generate justification
   - Click "Confirm Decision"
   - Verify case status updated to "approved"
   - Verify justification saved

2. **Reject a Case**
   - Select a case
   - Click "Reject"
   - Generate justification
   - Click "Confirm Decision"
   - Verify case status updated to "rejected"
   - Verify justification saved

3. **Multiple Cases**
   - Select multiple cases
   - Approve/Reject
   - Verify all cases updated

4. **Error Handling**
   - Disconnect backend
   - Try to update
   - Verify error message shown

### Test Scenarios

1. **Valid Update**: Status and justification both provided
2. **Status Only**: Only status provided
3. **Justification Only**: Only justification provided
4. **Invalid Status**: Status not 'approved' or 'rejected'
5. **Case Not Found**: Invalid case ID
6. **Network Error**: Backend unavailable
7. **Partial Failure**: Some cases succeed, some fail

## Files Created/Modified

### New Files
- `app/api/cases/[id]/status-justification/route.ts` - API route
- `hooks/use-update-case-status.ts` - Custom hook

### Modified Files
- `app/api/cases/types.ts` - Added UpdateCaseStatusAndJustificationDto and UpdateCaseResponse
- `components/stage-3-approval.tsx` - Updated handleConfirmDecision to save to backend

## Benefits

1. **Persistent Storage**: Justifications saved to database
2. **Audit Trail**: Track approval/rejection decisions
3. **Data Integrity**: Backend validation ensures data quality
4. **Error Resilience**: Graceful error handling with user feedback
5. **Batch Updates**: Update multiple cases efficiently
6. **Real-Time Sync**: Refreshes cases list after update

## Future Enhancements

1. **Optimistic Updates**: Update UI before backend confirmation
2. **Undo Functionality**: Allow users to undo decisions
3. **Revision History**: Track changes to justifications
4. **Bulk Operations**: UI for bulk approve/reject
5. **Email Notifications**: Notify stakeholders of decisions
6. **Export Reports**: Generate approval/rejection reports
7. **Advanced Validation**: More complex status transition rules
8. **Conflict Resolution**: Handle concurrent updates

## Notes

- The system validates that both `pendingDecision` and `generatedJustification` exist before saving
- After successful update, the cases list is automatically refreshed
- Local product statuses are also updated for backward compatibility
- All updates are logged to console for debugging
- User receives clear feedback on success or failure
