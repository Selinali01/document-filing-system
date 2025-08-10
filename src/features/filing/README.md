# Filing Feature

This feature handles the document filing process for clients, including document upload and client selection.

## Structure

```
src/features/filing/
├── components/
│   ├── FilingModal.tsx          # Main modal that orchestrates the filing process
│   ├── FilingTracker.tsx        # Table displaying filing progress
│   └── steps/
│       ├── DocumentUploadStep.tsx    # Step 1: PDF document upload
│       └── ClientSelectionStep.tsx   # Step 2: Client selection and review
├── data/
│   └── clients.ts               # Hardcoded client data
├── hooks/
│   └── use-filing.ts            # Custom hook for managing filing state
├── services/
│   └── filing-service.ts        # API service for uploading documents
├── types/
│   └── index.ts                 # TypeScript interfaces and types
├── index.ts                     # Main exports
└── README.md                    # This file
```

## Components

### FilingModal
The main modal component that manages the two-step filing process:
1. **Document Upload**: Users upload a PDF form document
2. **Client Selection**: Users select a client and review their information

### FilingTracker
Displays a table of all filing items with their current status, progress, and due dates.

### DocumentUploadStep
Handles PDF file upload with drag-and-drop support and file validation.

### ClientSelectionStep
Allows users to select a client and displays their information and previous documents.

## Usage

```tsx
import { FilingTracker, FilingModal, useFiling } from '@/features/filing';

function MyComponent() {
  const { trackerItems, addTrackerItem, updateTrackerItem } = useFiling();
  const [showModal, setShowModal] = useState(false);

  const handleFilingComplete = (newTrackerItem) => {
    addTrackerItem(newTrackerItem);
  };

  return (
    <div>
      <FilingTracker
        trackerItems={trackerItems}
        onAddNew={() => setShowModal(true)}
      />
      
      <FilingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onFilingComplete={handleFilingComplete}
      />
    </div>
  );
}
```

## Types

- `FilingStep`: Union type for the current step ('document_upload' | 'client_info')
- `FilingData`: Interface for the filing data structure
- `TrackerItem`: Interface for tracking filing progress
- `Client`: Interface for client information

## State Management

The `useFiling` hook provides:
- `trackerItems`: Array of current filing items
- `addTrackerItem`: Function to add new items
- `updateTrackerItem`: Function to update existing items
- `removeTrackerItem`: Function to remove items

## API Integration

The filing service handles document uploads to the backend API endpoint configured in `filing-service.ts`.
