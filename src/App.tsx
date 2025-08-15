import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  FilingModal,
  FilingTracker,
  Clients,
  useFiling,
  TrackerItem,
} from '@/features/filing';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [showAddNew, setShowAddNew] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'clients'>(
    'dashboard'
  );
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
                <button
                  type="button"
                  className={`${activeView === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'} group flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left`}
                  onClick={() => setActiveView('dashboard')}
                  aria-label="Dashboard"
                >
                  <svg
                    className={`${activeView === 'dashboard' ? 'text-purple-500' : 'text-gray-500'} ${sidebarCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}`}
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
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${activeView === 'clients' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'} group flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left`}
                  onClick={() => setActiveView('clients')}
                  aria-label="Clients"
                >
                  <svg
                    className={`${activeView === 'clients' ? 'text-purple-500' : 'text-gray-500'} ${sidebarCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  {!sidebarCollapsed && 'Clients'}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <main className="p-6">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">
                  AI-powered document generation and management
                </p>
              </div>
              <FilingTracker
                trackerItems={trackerItems}
                onAddNew={() => setShowAddNew(true)}
              />
            </>
          )}

          {/* Clients View */}
          {activeView === 'clients' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
                <p className="text-gray-600 mt-1">
                  Manage and view all client information
                </p>
              </div>
              <Clients />
            </>
          )}

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
