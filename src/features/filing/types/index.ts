export type FilingStep = 'document_upload' | 'client_info';

export interface FilingData {
  name: string;
  docType?: string;
  content?: string;
  documents?: File[];
}

export interface TrackerItem {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  dueDate: string;
  owner: string;
  step: FilingStep | 'completed';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  previousDocuments: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    status: 'verified' | 'pending_verification';
  }>;
}
