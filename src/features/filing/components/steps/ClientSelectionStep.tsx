import React from 'react';
import { Button } from '@/components/ui/button';
import { Client, FilingData } from '../../types';
import { hardcodedClients } from '@/data/clients';

interface ClientSelectionStepProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
  onBack: () => void;
  onSubmit: () => void;
  currentClientData: Partial<FilingData>;
  isSubmitting: boolean;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({
  selectedClient,
  onClientSelect,
  onBack,
  onSubmit,
  currentClientData,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div>
        <label
          htmlFor="client-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Client *
        </label>
        <select
          id="client-select"
          value={selectedClient?.id || ''}
          onChange={(e) => {
            const client = hardcodedClients.find(
              (c) => c.id === e.target.value
            );
            if (client) {
              onClientSelect(client);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          required
        >
          <option value="">-- Select a client --</option>
          {hardcodedClients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Client Information */}
      {selectedClient && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium text-gray-900">{selectedClient.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">
                {selectedClient.email}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium text-gray-900">
                {selectedClient.phone}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Documents:</span>
              <p className="font-medium text-gray-900">
                {selectedClient.previousDocuments.length} previous
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Previous Documents */}
      {selectedClient && selectedClient.previousDocuments.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Previous Documents</h4>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Document
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Upload Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedClient.previousDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {doc.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {doc.type}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {doc.uploadDate}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doc.status === 'verified'
                          ? 'Verified'
                          : 'Pending Verification'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Form Summary */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h4 className="font-medium text-gray-900 mb-2">PDF Form Summary:</h4>
        <div className="text-sm text-gray-600">
          {currentClientData.documents &&
          currentClientData.documents.length > 0 ? (
            <p>
              <strong>File:</strong> {currentClientData.documents[0].name}
            </p>
          ) : (
            <p>No PDF form uploaded yet</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !selectedClient}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Filing Document...' : 'File Document'}
        </Button>
      </div>
    </div>
  );
};
