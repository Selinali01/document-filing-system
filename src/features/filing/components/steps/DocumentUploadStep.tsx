import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface DocumentUploadStepProps {
  onNext: (file: File) => void;
  onCancel: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onNext,
  onCancel,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    // Reset the file input
    const fileInput = document.getElementById(
      'pdf-document'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadedFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    onNext(uploadedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="pdf-document"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          PDF Form Document *
        </label>

        {!uploadedFile ? (
          <div className="relative">
            <input
              id="pdf-document"
              name="Documents"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf"
              required
              onChange={handleFileSelect}
            />
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-200 ${isDragOver ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-400 hover:bg-purple-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                {isDragOver ? (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-purple-500 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-lg font-medium text-purple-700 mb-2">
                      Drop your PDF file here
                    </div>
                    <div className="text-sm text-purple-600">
                      Release to upload
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-lg font-medium text-gray-900 mb-2">
                      Choose a PDF file
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      or drag and drop here
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m3-3v12"
                        />
                      </svg>
                      Browse Files
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-green-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div className="text-sm font-medium text-green-800">
                    {uploadedFile.name}
                  </div>
                  <div className="text-xs text-green-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                title="Remove file"
              >
                <svg
                  className="w-5 h-5"
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
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Upload a single PDF form document
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h4 className="font-medium text-gray-900 mb-2">
          PDF Form Requirements:
        </h4>
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
          onClick={onCancel}
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
  );
};
