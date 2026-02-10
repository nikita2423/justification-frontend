# Product Data Management - Dual Workflow Implementation

## Overview
The system now supports two distinct workflow modes accessible from a dashboard landing page:

### 1. **Full Workflow** (Upload → Preview → Justification)
- Complete 3-stage process with progress stepper
- Stage 1: Upload product files (Application, EG Form, Catalogue)
- Stage 2: Preview and verify extracted data
- Stage 3: Generate AI-powered approval justifications

### 2. **Direct Justification** (Skip to Justification)
- Bypasses upload and preview stages
- Goes directly to Stage 3 (Justification)
- No progress stepper shown
- Ideal for pre-processed product data

## Key Changes

### 1. Store Updates (`lib/store.ts`)
- Added `workflowMode: 'full' | 'direct' | null` to track the selected workflow
- Added `setWorkflowMode()` function to switch between modes
- Enhanced `applyCommonSeasonAndTranch()` to update both product properties and EG data's Tranche field

### 2. New Dashboard Component (`components/dashboard.tsx`)
- Landing page with two workflow option cards
- Clean, modern design with clear descriptions
- Guides users to choose the appropriate workflow

### 3. Main Page Updates (`app/page.tsx`)
- Conditionally renders Dashboard when no workflow is selected
- Shows Progress Stepper only for 'full' workflow mode
- Handles navigation between dashboard and workflow stages
- "Back" button in Stage 3 returns to dashboard for 'direct' mode, or to Stage 2 for 'full' mode

### 4. Season/Tranche Application
- Season and Tranche are now automatically applied to all products
- Values are stored in both:
  - Product properties (`product.season`, `product.tranch`)
  - EG data structure (`egData.data.Tranche`, `egData.data.Season`)
- Auto-applies when commonSeason or commonTranch values change

## User Flow

### Full Workflow:
1. User lands on Dashboard
2. Clicks "Start Full Workflow"
3. Progress stepper appears showing all 3 stages
4. Proceeds through Upload → Preview → Justification
5. Can navigate between stages using stepper or back/next buttons

### Direct Justification:
1. User lands on Dashboard
2. Clicks "Go to Justification"
3. No progress stepper shown
4. Immediately enters Stage 3 (Justification)
5. Back button returns to Dashboard

## Benefits

### For New Products:
- Use Full Workflow for complete data extraction and verification
- Visual progress tracking through all stages
- Ensures data quality before justification

### For Existing Products:
- Use Direct Justification to save time
- Skip redundant upload/preview steps
- Focus on approval decisions

## Technical Implementation

### State Management:
```typescript
interface ProductStore {
  workflowMode: 'full' | 'direct' | null;
  setWorkflowMode: (mode: 'full' | 'direct' | null) => void;
  // ... other properties
}
```

### Conditional Rendering:
```tsx
{!workflowMode && <Dashboard />}
{workflowMode === 'full' && <ProgressStepper />}
{workflowMode && <WorkflowStages />}
```

### Navigation Logic:
- Full mode: Back button navigates to previous stage
- Direct mode: Back button returns to dashboard
- Reset button always returns to dashboard

## Season/Tranche Integration

The system now ensures season and tranche values are consistently applied across all data structures:

1. **Input Fields**: Located at the top of Stage 1 (Upload)
2. **Auto-Application**: Changes automatically apply to all products
3. **Data Persistence**: Values stored in:
   - Product metadata
   - EG form data
   - Sent to backend during file upload

This ensures data consistency throughout the workflow and in exported files.
