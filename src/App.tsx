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

interface TrackerItem {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  dueDate: string;
  owner: string;
  step: 'client_info' | 'document_upload' | 'completed';
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
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [currentStep, setCurrentStep] = useState<'document_upload' | 'client_info'>('document_upload');
  const [currentClientData, setCurrentClientData] = useState<Partial<NewClientData>>({});

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

  const handleDocumentUploadSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const fileInput = form.elements.namedItem('Documents') as HTMLInputElement;
    let documents: File[] = [];
    
    if (fileInput.files && fileInput.files.length > 0) {
      documents = [fileInput.files[0]]; // Take only the first file
    }

    setCurrentClientData(prev => ({ ...prev, documents }));
    setCurrentStep('client_info');
  };

  const handleClientInfoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    const clientData = {
      name: (form.elements.namedItem('Name') as HTMLInputElement).value,
      docType: (form.elements.namedItem('Doc type') as HTMLSelectElement).value,
      content: (form.elements.namedItem('Content') as HTMLTextAreaElement).value,
    };

    const finalClientData: NewClientData = {
      ...currentClientData,
      ...clientData,
    } as NewClientData;

    // Add to tracker
    const newTrackerItem: TrackerItem = {
      id: Date.now().toString(),
      name: finalClientData.name,
      status: 'in_progress',
      progress: 50,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      owner: 'You',
      step: 'completed'
    };

    setTrackerItems(prev => [...prev, newTrackerItem]);
    
    clientMutation.mutate(finalClientData, {
      onSuccess: () => {
        // Update tracker item to completed
        setTrackerItems(prev => 
          prev.map(item => 
            item.id === newTrackerItem.id 
              ? { ...item, status: 'completed', progress: 100 }
              : item
          )
        );
        setShowAddNew(false);
        setCurrentStep('document_upload');
        setCurrentClientData({});
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

  const getStatusColor = (status: TrackerItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: TrackerItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400';
      case 'in_progress': return 'bg-purple-400';
      case 'completed': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">DocuBubble</h1>
          <p className="text-sm text-gray-600 mt-1">Powered by Bubble Lab, Inc.</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Main</h2>
            <ul className="space-y-1">
              <li>
                <div className="bg-purple-50 text-purple-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg border border-purple-100">
                  <svg className="text-purple-500 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <main className="p-6">
          {/* Dashboard Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">AI-powered document generation and management</p>
          </div>

          {/* Client & Document Tracker */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tracker Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Client & Document Tracker</h3>
                  <p className="text-gray-600 mt-1">Track filing progress and document generation</p>
                </div>
                <Button 
                  onClick={() => setShowAddNew(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  + Add New
                </Button>
              </div>
            </div>

            {/* Tracker Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trackerItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No items yet. Click "Add New" to create your first client entry.
                      </td>
                    </tr>
                  ) : (
                    trackerItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${getStatusDot(item.status)}`}></div>
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status === 'in_progress' ? 'On track' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{item.progress}% completed</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs text-gray-600">{item.owner.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-900">{item.owner}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>


          </div>

          {/* Add New Client Modal/Form */}
          {showAddNew && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-200">
                {/* Modal Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Client</h3>
                    <button
                      onClick={() => {
                        setShowAddNew(false);
                        setCurrentStep('document_upload');
                        setCurrentClientData({});
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Steps Indicator */}
                  <div className="mt-4 flex items-center">
                    <div className={`flex items-center ${currentStep === 'document_upload' ? 'text-purple-600' : 'text-green-600'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep === 'document_upload' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {currentStep === 'document_upload' ? '1' : '✓'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Upload Documents</span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded ${currentStep === 'client_info' ? 'bg-purple-200' : 'bg-gray-200'}`}></div>
                    </div>
                    <div className={`flex items-center ${currentStep === 'client_info' ? 'text-purple-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep === 'client_info' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        2
                      </div>
                      <span className="ml-2 text-sm font-medium">Client Information</span>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {currentStep === 'document_upload' ? (
                    <form onSubmit={handleDocumentUploadSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PDF Form Document *
                        </label>
                        <input
                          name="Documents"
                          type="file"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          accept=".pdf"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a single PDF form document
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-medium text-gray-900 mb-2">PDF Form Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Must be a PDF file with fillable form fields</li>
                          <li>• Only one document per client entry</li>
                          <li>• Form fields should have descriptive names</li>
                          <li>• File size limit: 10MB</li>
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          onClick={() => setShowAddNew(false)}
                          className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                          Continue
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleClientInfoSubmit} className="space-y-4">
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
                          defaultValue={currentClientData.name || ''}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type *
                        </label>
                        <select
                          name="Doc type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          defaultValue={currentClientData.docType || 'Passport'}
                          required
                        >
                          <option value="Passport">Passport</option>
                          <option value="Bank Statement">Bank Statement</option>
                          <option value="Bills">Bills</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Information
                        </label>
                        <textarea
                          name="Content"
                          placeholder="Enter any additional client information..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          defaultValue={currentClientData.content || ''}
                        />
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-medium text-gray-900 mb-2">PDF Form Summary:</h4>
                        <div className="text-sm text-gray-600">
                          {currentClientData.documents && currentClientData.documents.length > 0 ? (
                            <p><strong>File:</strong> {currentClientData.documents[0].name}</p>
                          ) : (
                            <p>No PDF form uploaded yet</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep('document_upload')}
                          className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={clientMutation.isPending}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                          {clientMutation.isPending ? <Spinner /> : null}
                          {clientMutation.isPending ? 'Adding Client...' : 'Complete'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
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