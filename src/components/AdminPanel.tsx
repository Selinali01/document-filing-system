import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5678/webhook';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'templates'>('clients');
  const [clientName, setClientName] = useState('');
  const [clientDocType, setClientDocType] = useState('Passport');
  const [clientContent, setClientContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Name', clientName);
      formData.append('Doc type', clientDocType);
      formData.append('Content', clientContent);
      if (selectedFile) {
        formData.append('Documents', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/upload_client_document`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Client added successfully!');
        setClientName('');
        setClientContent('');
        setSelectedFile(null);
      } else {
        throw new Error('Failed to add client');
      }
    } catch (error) {
      toast.error('Failed to add client');
      console.error('Error adding client:', error);
    }
    setLoading(false);
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) {
      toast.error('Please select a PDF template file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Documents', templateFile);

      const response = await fetch(`${API_BASE_URL}/upload_document`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Template uploaded successfully!');
        setTemplateFile(null);
      } else {
        throw new Error('Failed to upload template');
      }
    } catch (error) {
      toast.error('Failed to upload template');
      console.error('Error uploading template:', error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Clients
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload Templates
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'clients' && (
            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <Input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={clientDocType}
                  onChange={(e) => setClientDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Passport">Passport</option>
                  <option value="Bank Statement">Bank Statement</option>
                  <option value="Bills">Bills</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Documents
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={clientContent}
                  onChange={(e) => setClientContent(e.target.value)}
                  placeholder="Enter any additional client information..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {loading ? 'Adding Client...' : 'Add Client'}
              </Button>
            </form>
          )}

          {activeTab === 'templates' && (
            <form onSubmit={handleTemplateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Template File *
                </label>
                <input
                  type="file"
                  onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload PDF forms that can be filled automatically with client data.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Template Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Must be a PDF file with fillable form fields</li>
                  <li>• Form fields should have descriptive names</li>
                  <li>• Common fields: Name, Address, Phone, Email, Date, etc.</li>
                  <li>• The AI will automatically map client data to form fields</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || !templateFile}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {loading ? 'Uploading Template...' : 'Upload Template'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};