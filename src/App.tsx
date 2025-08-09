import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AdminPanel } from './components/AdminPanel';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

interface Client {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  isPending?: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  webViewLink?: string;
  mimeType?: string;
  isPending?: boolean;
}

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
const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch(`${API_BASE_URL}/list_clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
};

const fetchTemplates = async (): Promise<DocumentTemplate[]> => {
  const response = await fetch(`${API_BASE_URL}/list_documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
};

const uploadClient = async (clientData: NewClientData): Promise<Client> => {
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
  
  // Return optimistic client data since backend doesn't return the created client
  return {
    id: `temp-${Date.now()}`,
    name: clientData.name,
    createdTime: new Date().toISOString(),
  };
};

const uploadTemplate = async (templateData: NewTemplateData): Promise<DocumentTemplate> => {
  const formData = new FormData();
  templateData.documents.forEach(file => {
    formData.append('field-0', file);
  });

  const response = await fetch(`${API_BASE_URL}/upload_document`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload template');
  
  // Return optimistic template data
  return {
    id: `temp-${Date.now()}`,
    name: templateData.documents[0].name,
    mimeType: 'application/pdf',
  };
};

function App() {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'preview' | 'processing'>('select');
  const [showAdmin, setShowAdmin] = useState(false);

  // TanStack Query for data fetching
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  // Optimistic Mutations
  const clientMutation = useMutation({
    mutationFn: uploadClient,
    onMutate: async (newClientData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      
      // Snapshot previous value
      const previousClients = queryClient.getQueryData<Client[]>(['clients']);
      
      // Optimistically update cache
      const optimisticClient: Client = {
        id: `optimistic-${Date.now()}`,
        name: newClientData.name,
        createdTime: new Date().toISOString(),
        isPending: true,
      };
      
      queryClient.setQueryData<Client[]>(['clients'], (old = []) => [
        ...old,
        optimisticClient,
      ]);
      
      return { previousClients, optimisticClient };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
      toast.error('Failed to add client');
    },
    onSuccess: () => {
      toast.success('Client added successfully!');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const templateMutation = useMutation({
    mutationFn: uploadTemplate,
    onMutate: async (newTemplateData) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      
      const previousTemplates = queryClient.getQueryData<DocumentTemplate[]>(['templates']);
      
      const optimisticTemplate: DocumentTemplate = {
        id: `optimistic-${Date.now()}`,
        name: newTemplateData.documents[0].name,
        mimeType: 'application/pdf',
        isPending: true,
      };
      
      queryClient.setQueryData<DocumentTemplate[]>(['templates'], (old = []) => [
        ...old,
        optimisticTemplate,
      ]);
      
      return { previousTemplates, optimisticTemplate };
    },
    onError: (err, variables, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
      toast.error('Failed to upload template');
    },
    onSuccess: () => {
      toast.success('Template uploaded successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  // Form handlers using optimistic mutations

  const previewForm = async () => {
    if (!selectedTemplate || !selectedClient) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/parse_form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedTemplate.name,
          name: selectedClient.name
        }),
      });
      const fields = await response.json();
      setFormFields(fields);
      setStep('preview');
      toast.success('Form analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze form');
      console.error('Error analyzing form:', error);
    }
    setLoading(false);
  };

  const generateDocument = async () => {
    if (!selectedTemplate || !selectedClient) return;

    setLoading(true);
    setStep('processing');
    try {
      const response = await fetch(`${API_BASE_URL}/fill_form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedTemplate.name,
          name: selectedClient.name
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedClient.name}_${selectedTemplate.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Document generated and downloaded successfully!');
        setStep('select');
      } else {
        throw new Error('Failed to generate document');
      }
    } catch (error) {
      toast.error('Failed to generate document');
      console.error('Error generating document:', error);
      setStep('preview');
    }
    setLoading(false);
  };

  const resetSelection = () => {
    setSelectedClient(null);
    setSelectedTemplate(null);
    setFormFields([]);
    setStep('select');
  };

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
    
    // Use optimistic mutation
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
    
    // Use optimistic mutation
    templateMutation.mutate(templateData, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Filing System</h1>
              <p className="text-gray-600">AI-powered document generation and management</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowAdmin(true)}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Admin Panel
              </Button>
              {step !== 'select' && (
                <Button 
                  onClick={resetSelection}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'select' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Client Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Select Client</h2>
                  <span className="text-sm text-gray-500">{clients.length} clients</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {clientsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="w-6 h-6 mr-2" />
                      <span className="text-gray-500">Loading clients...</span>
                    </div>
                  )}
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => !client.isPending && setSelectedClient(client)}
                      className={`p-4 border rounded-lg transition-colors ${
                        client.isPending
                          ? 'border-yellow-300 bg-yellow-50 opacity-75 cursor-wait'
                          : selectedClient?.id === client.id
                          ? 'border-blue-500 bg-blue-50 cursor-pointer'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center">
                            {client.name}
                            {client.isPending && (
                              <Spinner className="w-4 h-4 ml-2" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {client.isPending ? 'Adding...' : client.createdTime ? `Created: ${new Date(client.createdTime).toLocaleDateString()}` : 'Recently added'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No clients found. Add a client below to get started.
                    </p>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Select Document Template</h2>
                  <span className="text-sm text-gray-500">{templates.length} templates</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {templatesLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="w-6 h-6 mr-2" />
                      <span className="text-gray-500">Loading templates...</span>
                    </div>
                  )}
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => !template.isPending && setSelectedTemplate(template)}
                      className={`p-4 border rounded-lg transition-colors ${
                        template.isPending
                          ? 'border-yellow-300 bg-yellow-50 opacity-75 cursor-wait'
                          : selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50 cursor-pointer'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {template.name}
                        {template.isPending && (
                          <Spinner className="w-4 h-4 ml-2" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {template.isPending ? 'Uploading...' : 'PDF Document'}
                      </p>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No templates found. Upload a template below to get started.
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                    {clientMutation.isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
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
                    {templateMutation.isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                    {templateMutation.isPending ? 'Uploading...' : 'Upload Template'}
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}

        {step === 'select' && selectedClient && selectedTemplate && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ready to Generate Document</h3>
              <p className="text-gray-600 mb-6">
                Client: <span className="font-medium">{selectedClient.name}</span> | 
                Template: <span className="font-medium">{selectedTemplate.name}</span>
              </p>
              <Button 
                onClick={previewForm}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                Analyze Form & Preview
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Preview</h2>
            <div className="mb-6">
              <p className="text-gray-600">
                Document: <span className="font-medium">{selectedTemplate?.name}</span> for{' '}
                <span className="font-medium">{selectedClient?.name}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {formFields.map((field) => (
                <div key={field.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{field.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                  <p className="text-xs text-gray-400">Page {field.page}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setStep('select')}
                variant="outline"
                className="text-gray-600 border-gray-300"
              >
                Back to Selection
              </Button>
              <Button 
                onClick={generateDocument}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                Generate & Download PDF
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <Spinner className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Document</h3>
              <p className="text-gray-600">
                AI is filling out the form with {selectedClient?.name}'s information...
              </p>
            </div>
          </div>
        )}
      </main>

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

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