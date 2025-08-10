import { FilingData } from '../types';

const API_BASE_URL = 'http://localhost:5678/webhook';

export const uploadClient = async (clientData: FilingData): Promise<void> => {
  const formData = new FormData();
  formData.append('field-0', clientData.name);

  if (clientData.docType) {
    formData.append('field-1', clientData.docType);
  }

  if (clientData.content) {
    formData.append('field-3', clientData.content);
  }

  if (clientData.documents) {
    clientData.documents.forEach((file) => {
      formData.append('field-2', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/upload_client_document`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload client');
};
