import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import AIAssistant from './pages/AIAssistant';
import KnowledgeHub from './pages/KnowledgeHub';
import SOPLibrary from './pages/SOPLibrary';
import SearchExplorer from './pages/SearchExplorer';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import Settings from './pages/Settings';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
        {/* Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#070B14]">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/assistant" element={<AIAssistant />} />
                <Route path="/knowledge" element={<KnowledgeHub />} />
                <Route path="/library" element={<SOPLibrary />} />
                <Route path="/search" element={<SearchExplorer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<ActivityHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
