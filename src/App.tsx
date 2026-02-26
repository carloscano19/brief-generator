import { useState } from 'react';
import './index.css';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Layout/Sidebar';
import { Stepper } from './components/Layout/Stepper';
import { ConfigForm } from './components/Step1/ConfigForm';
import { SeedKeywords } from './components/Step2/SeedKeywords';
import { KeywordSelection } from './components/Step3/KeywordSelection';
import { BriefView } from './components/Step4/BriefView';
import { HistoryPanel } from './components/History/HistoryPanel';

function App() {
  const { currentStep, showHistory } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ConfigForm />;
      case 2: return <SeedKeywords />;
      case 3: return <KeywordSelection />;
      case 4: return <BriefView />;
      default: return <ConfigForm />;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always rendered once */}
      <Sidebar onClose={() => setSidebarOpen(false)} mobileOpen={sidebarOpen} />

      {/* Main content */}
      <main className="main-content">
        <Stepper />
        {renderStep()}
      </main>

      {/* History Panel */}
      {showHistory && <HistoryPanel />}
    </div>
  );
}

export default App;
