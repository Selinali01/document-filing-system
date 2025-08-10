import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  FilingTracker,
  FilingModal,
  useFiling,
  TrackerItem,
} from '@/features/filing';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [showAddNew, setShowAddNew] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { trackerItems, addTrackerItem, updateTrackerItem } = useFiling();

  const handleFilingComplete = (newTrackerItem: TrackerItem) => {
    // Check if this is an update to an existing item
    const existingItem = trackerItems.find(
      (item) => item.id === newTrackerItem.id
    );
    if (existingItem) {
      updateTrackerItem(newTrackerItem.id, newTrackerItem);
    } else {
      addTrackerItem(newTrackerItem);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <>
                <h1 className="text-2xl font-bold text-gray-900">DocuBubble</h1>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </>
            )}
            {sidebarCollapsed && (
              <div className="flex flex-col items-center w-full">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <p className="text-sm text-gray-600 mt-1">
              Powered by Bubble Lab, Inc.
            </p>
          )}
        </div>

        <nav className="mt-6">
          <div className={`${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
            {!sidebarCollapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Main
              </h2>
            )}
            <ul className="space-y-1">
              <li>
                <div
                  className={`bg-purple-50 text-purple-700 group flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'} py-2.5 text-sm font-medium rounded-lg border border-purple-100`}
                >
                  <svg
                    className={`text-purple-500 ${sidebarCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {!sidebarCollapsed && 'Dashboard'}
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
            <p className="text-gray-600 mt-1">
              AI-powered document generation and management
            </p>
          </div>

          {/* Client & Document Tracker */}
          <FilingTracker
            trackerItems={trackerItems}
            onAddNew={() => setShowAddNew(true)}
          />

          {/* Filing Modal */}
          <FilingModal
            isOpen={showAddNew}
            onClose={() => setShowAddNew(false)}
            onFilingComplete={handleFilingComplete}
          />
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
