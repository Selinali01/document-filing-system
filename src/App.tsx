import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

interface FormField {
  id: number;
  page: number;
  name: string;
  description: string;
}

interface NewClientData {
  name: string;
  docType: string;
  content: string;
  documents?: File[];
}

interface NewTemplateData {
  documents: File[];
}

const API_BASE_URL = 'http://localhost:5678/webhook';

// API Functions

const uploadClient = async (clientData: NewClientData): Promise<void> => {
  const formData = new FormData();
  formData.append('field-0', clientData.name);
  formData.append('field-1', clientData.docType);
  formData.append('field-3', clientData.content);
  
  if (clientData.documents) {
    clientData.documents.forEach(file => {
      formData.append('field-2', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/upload_client_document`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload client');
};

const uploadTemplate = async (templateData: NewTemplateData): Promise<void> => {
  const formData = new FormData();
  templateData.documents.forEach(file => {
    formData.append('field-0', file);
  });

  const response = await fetch(`${API_BASE_URL}/upload_document`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload template');
};

function App() {
  const queryClient = useQueryClient();


  // No data fetching needed for simplified app

  // Simple Mutations
  const clientMutation = useMutation({
    mutationFn: uploadClient,
    onError: () => {
      toast.error('Failed to add client');
    },
    onSuccess: () => {
      toast.success('Client added successfully!');
    },
  });

  const templateMutation = useMutation({
    mutationFn: uploadTemplate,
    onError: () => {
      toast.error('Failed to upload template');
    },
    onSuccess: () => {
      toast.success('Template uploaded successfully!');
    },
  });

  // Form handlers

  const handleClientUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const clientData: NewClientData = {
      name: (form.elements.namedItem('Name') as HTMLInputElement).value,
      docType: (form.elements.namedItem('Doc type') as HTMLSelectElement).value,
      content: (form.elements.namedItem('Content') as HTMLTextAreaElement).value,
    };

    const fileInput = form.elements.namedItem('Documents') as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      clientData.documents = Array.from(fileInput.files);
    }
    
    clientMutation.mutate(clientData, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  const handleTemplateUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const fileInput = form.elements.namedItem('Documents') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    const templateData: NewTemplateData = {
      documents: Array.from(fileInput.files),
    };
    
    templateMutation.mutate(templateData, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">DocuBubble</h1>
          <p className="text-sm text-gray-600 mt-1">AI Document System</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Main</h2>
            <ul className="space-y-1">
              <li>
                <div className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-blue-500 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">AI-powered document generation and management</p>
              </div>
              <div className="flex space-x-3">
                {/* Action buttons can be added here in the future */}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Upload Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Client */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">+</span>
                    Add New Client
                  </h3>
                  <a 
                    href="http://localhost:5678/webhook/upload_client_document" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 underline font-medium"
                  >
                    Open Full Form ↗
                  </a>
                </div>
                <form onSubmit={handleClientUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <Input
                      name="Name"
                      type="text"
                      placeholder="Enter client name"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      name="Doc type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Bank Statement">Bank Statement</option>
                      <option value="Bills">Bills</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Documents
                    </label>
                    <input
                      name="Documents"
                      type="file"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Information
                    </label>
                    <textarea
                      name="Content"
                      placeholder="Enter any additional client information..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={clientMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {clientMutation.isPending ? <Spinner /> : null}
                    {clientMutation.isPending ? 'Adding Client...' : 'Add Client'}
                  </Button>
                </form>
              </div>

              {/* Upload Document Template */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">📄</span>
                    Upload Document Template
                  </h3>
                  <a 
                    href="http://localhost:5678/webhook/upload_document" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Open Full Form ↗
                  </a>
                </div>
                <form onSubmit={handleTemplateUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PDF Template File *
                    </label>
                    <input
                      name="Documents"
                      type="file"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Template Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Must be a PDF file with fillable form fields</li>
                      <li>• Form fields should have descriptive names</li>
                      <li>• Common fields: Name, Address, Phone, Email, Date</li>
                      <li>• AI will automatically map client data to fields</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={templateMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {templateMutation.isPending ? <Spinner /> : null}
                    {templateMutation.isPending ? 'Uploading...' : 'Upload Template'}
                  </Button>
                </form>
              </div>
          </div>
        </main>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;