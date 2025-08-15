import { Client } from '@/features/filing/types';

export const hardcodedClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    previousDocuments: [
      {
        id: 'doc1',
        name: 'Passport Application',
        type: 'Passport',
        uploadDate: '2024-01-15',
        status: 'verified',
      },
      {
        id: 'doc2',
        name: 'Bank Statement Verification',
        type: 'Bank Statement',
        uploadDate: '2024-01-10',
        status: 'verified',
      },
      {
        id: 'doc3',
        name: 'Utility Bill',
        type: 'Bills',
        uploadDate: '2024-01-05',
        status: 'pending_verification',
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 987-6543',
    previousDocuments: [
      {
        id: 'doc4',
        name: 'Passport Renewal',
        type: 'Passport',
        uploadDate: '2024-01-20',
        status: 'pending_verification',
      },
    ],
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 456-7890',
    previousDocuments: [
      {
        id: 'doc5',
        name: 'Bank Account Verification',
        type: 'Bank Statement',
        uploadDate: '2024-01-18',
        status: 'verified',
      },
      {
        id: 'doc6',
        name: 'Credit Card Statement',
        type: 'Bills',
        uploadDate: '2024-01-12',
        status: 'verified',
      },
    ],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 234-5678',
    previousDocuments: [
      {
        id: 'doc7',
        name: 'Driver License Renewal',
        type: 'License',
        uploadDate: '2024-01-22',
        status: 'verified',
      },
      {
        id: 'doc8',
        name: 'Insurance Certificate',
        type: 'Insurance',
        uploadDate: '2024-01-19',
        status: 'pending_verification',
      },
    ],
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 345-6789',
    previousDocuments: [
      {
        id: 'doc9',
        name: 'Tax Return',
        type: 'Tax',
        uploadDate: '2024-01-25',
        status: 'verified',
      },
    ],
  },
];
