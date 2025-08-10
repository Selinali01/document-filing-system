import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { ClientSelectionStep } from './steps/ClientSelectionStep';
import { FilingStep, FilingData, Client, TrackerItem } from '../types';
import { uploadClient } from '../services/filing-service';

interface FilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilingComplete: (newTrackerItem: TrackerItem) => void;
}

export const FilingModal: React.FC<FilingModalProps> = ({
  isOpen,
  onClose,
  onFilingComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<FilingStep>('document_upload');
  const [currentClientData, setCurrentClientData] = useState<
    Partial<FilingData>
  >({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clientMutation = useMutation({
    mutationFn: uploadClient,
    onError: () => {
      toast.error('Failed to add document');
    },
    onSuccess: () => {
      toast.success('Document added successfully!');
    },
  });

  const handleDocumentUpload = (file: File) => {
    setCurrentClientData((prev) => ({ ...prev, documents: [file] }));
    setCurrentStep('client_info');
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentClientData((prev) => ({
      ...prev,
      name: client.name,
    }));
  };

  const handleBack = () => {
    setCurrentStep('document_upload');
    setSelectedClient(null);
  };

  const handleSubmit = () => {
    if (!selectedClient) return;

    const finalClientData: FilingData = {
      ...currentClientData,
      name: selectedClient.name,
    } as FilingData;

    // Add to tracker
    const newTrackerItem: TrackerItem = {
      id: Date.now().toString(),
      name: finalClientData.name,
      status: 'in_progress',
      progress: 50,
      dueDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      owner: 'You',
      step: 'completed',
    };

    onFilingComplete(newTrackerItem);

    clientMutation.mutate(finalClientData, {
      onSuccess: () => {
        // Update tracker item to completed
        onFilingComplete({
          ...newTrackerItem,
          status: 'completed',
          progress: 100,
        });
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setCurrentStep('document_upload');
    setCurrentClientData({});
    setSelectedClient(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-200">
        {/* Modal Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              File New Document
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="mt-4 flex items-center">
            <div
              className={`flex items-center ${currentStep === 'document_upload' ? 'text-purple-600' : 'text-green-600'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'document_upload'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {currentStep === 'document_upload' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">Upload Documents</span>
            </div>
            <div className="flex-1 mx-4">
              <div
                className={`h-1 rounded ${currentStep === 'client_info' ? 'bg-purple-200' : 'bg-gray-200'}`}
              ></div>
            </div>
            <div
              className={`flex items-center ${currentStep === 'client_info' ? 'text-purple-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'client_info'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Choose Client</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {currentStep === 'document_upload' ? (
            <DocumentUploadStep
              onNext={handleDocumentUpload}
              onCancel={handleClose}
            />
          ) : (
            <ClientSelectionStep
              selectedClient={selectedClient}
              onClientSelect={handleClientSelect}
              onBack={handleBack}
              onSubmit={handleSubmit}
              currentClientData={currentClientData}
              isSubmitting={clientMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};
