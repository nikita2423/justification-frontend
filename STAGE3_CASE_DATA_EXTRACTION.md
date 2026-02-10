# Stage 3 - Extract Product and Category from Case Data

## Overview
Updated Stage 3 (Approval) to correctly extract product information and category from the case data structure returned by the API, then use this information to find similar cases for justification generation.

## Case Data Structure

Based on the provided case structure, each case contains:

```typescript
{
  id: string;
  status: "pending" | "approved" | "rejected" | "under_review";
  caseNumber: string;
  justification: string | null;
  recdEG: boolean;
  catalogueData: {
    products: [{
      model: string;
      functions: string[];
      description: string;
      product_name: string;
      product_size: string;
      usage_capacity: string;
    }];
    description: string;
  };
  egData: {
    NO: number;
    Ref: string;
    NO_R: string;
    EB_RM: string;
    App_No: string;
    Season: string;
    SWD_Ref: string;
    Tranche: string;
    App_Type: string;
    SWD_Off_I: string;
    SWD_Off_N: string;
    SWD_Off_P: string;
    D_PlnT_SWD: string;
    D_ReqF_SWD: string;
    App_PNam_Mod: string;
  };
  applicationData: {
    PA_Cat: string;
    No_Bene: number;
    PA_RefL: string;
    TotAmtR: number;
    PA_Brand: string;
    PA_PName: string;
    PA_Mod_No: string;
    Typ_Staff: string;
    No_Disable: string;
    No_Elderly: number;
    PA_Justify: string;
    Prof_Staff: string;
    Staff_Avail: string;
    PA_Elaborate: string;
    Typ_Disability: string;
  };
  categoryId: string | null;
}
```

## Data Extraction Logic

### 1. **Product Name**
Extracted from `catalogueData.products[0].product_name`:
```typescript
const productInfo = selectedCase.catalogueData?.products?.[0];
const productName = productInfo?.product_name || "";
// Example: "Arjo Maxi 500®"
```

### 2. **Product Description**
Extracted from `catalogueData.products[0].description` or fallback to `catalogueData.description`:
```typescript
const description = productInfo?.description || 
                   selectedCase.catalogueData?.description || 
                   "";
// Example: "A mobile passive sling lifter designed to assist caregivers..."
```

### 3. **Category**
Extracted from `applicationData.PA_Cat` or fallback to `categoryId`:
```typescript
const category = selectedCase.applicationData?.PA_Cat || 
                selectedCase.categoryId || 
                "";
// Example: "12.1"
```

### 4. **Ref Number**
Extracted from `egData.Ref` or `egData.SWD_Ref`:
```typescript
const refNo = caseItem.egData?.Ref || 
             caseItem.egData?.SWD_Ref || 
             "—";
// Example: "T11_SWD/EB/I&TF/T11/1578P"
```

## Updated Functions

### 1. **handleRetrieveSimilarCases**

**Before:** Used `selectedProductObjects` from local state
**After:** Uses `cases` from API and extracts data from case structure

```typescript
const handleRetrieveSimilarCases = useCallback(async () => {
  if (selectedProducts.length === 0) return;

  // Get the first selected case
  const selectedCaseId = selectedProducts[0];
  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  
  if (!selectedCase) {
    console.error("Selected case not found");
    return;
  }

  // Extract product information from catalogueData
  const productInfo = selectedCase.catalogueData?.products?.[0];
  const productName = productInfo?.product_name || "";
  const description = productInfo?.description || 
                     selectedCase.catalogueData?.description || "";
  
  // Extract category from applicationData
  const category = selectedCase.applicationData?.PA_Cat || 
                  selectedCase.categoryId || "";
  
  // Call the similar matches API
  await fetchSimilarMatches({
    item: {
      PA_Cat: category,
      desc: description,
    },
    srcField: "PA_Cat",
    datasetName: "Justification Creation",
    datasetType: "justification-testing",
    dstField: "RefL_Cat",
    descriptionField: "desc",
  });
}, [selectedProducts, cases, fetchSimilarMatches, matches?.length, setSimilarJustifications]);
```

### 2. **handleGenerateJustification**

**Before:** Used `products` from local state
**After:** Uses `cases` from API and extracts data from case structure

```typescript
const handleGenerateJustification = useCallback(
  async (decision: "approved" | "rejected") => {
    // Process each selected case
    for (const caseId of selectedProducts) {
      const selectedCase = cases.find((c) => c.id === caseId);
      if (!selectedCase) continue;

      // Extract product information from catalogueData
      const productInfo = selectedCase.catalogueData?.products?.[0];
      const productName = productInfo?.product_name || "";
      const description = productInfo?.description || 
                         selectedCase.catalogueData?.description || "";
      
      // Extract category from applicationData
      const category = selectedCase.applicationData?.PA_Cat || 
                      selectedCase.categoryId || "";

      // Fetch similar matches for this case
      await fetchSimilarMatches({
        item: {
          PA_Cat: category,
          desc: description,
        },
        srcField: "PA_Cat",
        datasetName: "Justification Creation",
        datasetType: "justification-testing",
        dstField: "RefL_Cat",
        descriptionField: "desc",
      });

      // Call justification API with extracted data
      const currentCase = selectedCase.catalogueData?.products;
      const appData = selectedCase.applicationData || {};

      const response = await fetch("/api/suggest/justification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          similar_matches: similarMatches,
          current_case: currentCase,
          application_data: appData,
        }),
      });
    }
  },
  [selectedProducts, cases, fetchSimilarMatches, matches, setIsGeneratingJustification, setSimilarJustifications],
);
```

## Example Data Flow

### Input Case:
```json
{
  "id": "571d8532-ad38-42e5-bcd3-852016b125c1",
  "caseNumber": "SWD/EB/I&TF/T11/1578P/None",
  "catalogueData": {
    "products": [{
      "product_name": "Arjo Maxi 500®",
      "description": "A mobile passive sling lifter..."
    }]
  },
  "applicationData": {
    "PA_Cat": "12.1",
    "PA_PName": "Maxi 500"
  },
  "categoryId": null
}
```

### Extracted Data:
```typescript
{
  productName: "Arjo Maxi 500®",
  description: "A mobile passive sling lifter...",
  category: "12.1"
}
```

### API Call to Similar Matches:
```typescript
fetchSimilarMatches({
  item: {
    PA_Cat: "12.1",
    desc: "A mobile passive sling lifter..."
  },
  srcField: "PA_Cat",
  datasetName: "Justification Creation",
  datasetType: "justification-testing",
  dstField: "RefL_Cat",
  descriptionField: "desc",
});
```

### Result:
- Similar cases are found based on category (12.1) and description
- Justification is generated using similar cases
- User can approve/reject with AI-generated justification

## Key Changes

1. **Data Source**: Changed from `products` (local state) to `cases` (API)
2. **Product Name**: Now from `catalogueData.products[0].product_name`
3. **Description**: Now from `catalogueData.products[0].description`
4. **Category**: Now from `applicationData.PA_Cat` or `categoryId`
5. **Ref Number**: Now from `egData.Ref` or `egData.SWD_Ref`

## Benefits

1. **Accurate Data**: Uses actual case structure from backend
2. **Consistent**: Same data structure across the application
3. **Flexible**: Handles missing data with fallbacks
4. **Logged**: Console logs for debugging
5. **Type-Safe**: Uses TypeScript for type checking

## Console Logs

The updated functions now log useful information:

```typescript
console.log("Selected case for similar matches:", selectedCase);
console.log("Searching for similar cases with:", {
  productName,
  category,
  description: description.substring(0, 100) + "...",
});
console.log("Similar matches found:", matches);
console.log(`Generating justification for case ${selectedCase.caseNumber}:`, {
  productName,
  category,
});
```

## Testing

### Manual Testing:
1. Select a case in Stage 3
2. Click "Retrieve Similar Cases"
3. Check console for extracted data
4. Verify similar matches are found
5. Click "Generate Justification"
6. Verify justification is generated correctly

### Test Data:
Use the provided case structure to test:
- Product name extraction
- Category extraction
- Description extraction
- Similar matches API call
- Justification generation

## Notes

- The lint errors in `stage-1-upload.tsx` are unrelated to this change
- The `metadata` and `approvalStatus` properties on `SimilarMatch` type may need to be added to the type definition
- All changes are backward compatible with fallbacks for missing data
