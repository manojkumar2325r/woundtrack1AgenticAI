import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DisclaimerBanner from "./components/DisclaimerBanner";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage from "./pages/AnalysisPage";
import HistoryPage from "./pages/HistoryPage";
import ProgressPage from "./pages/ProgressPage";
import AssistantPage from "./pages/AssistantPage";
import ReportsPage from "./pages/ReportsPage";
import StatusPage from "./pages/StatusPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case "landing":
        return (
          <LandingPage
            onStartAnalysis={() => setActiveTab("analysis")}
            onExploreDashboard={() => setActiveTab("dashboard")}
          />
        );
      case "dashboard":
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            setSelectedAnalysisId={setSelectedAnalysisId}
          />
        );
      case "analysis":
        return (
          <AnalysisPage
            selectedAnalysisId={selectedAnalysisId}
            setSelectedAnalysisId={setSelectedAnalysisId}
          />
        );
      case "history":
        return (
          <HistoryPage
            setActiveTab={setActiveTab}
            setSelectedAnalysisId={setSelectedAnalysisId}
          />
        );
      case "progress":
        return <ProgressPage />;
      case "assistant":
        return <AssistantPage selectedAnalysisId={selectedAnalysisId} />;
      case "reports":
        return <ReportsPage />;
      case "status":
        return <StatusPage />;
      case "about":
        return <AboutPage />;
      default:
        return (
          <LandingPage
            onStartAnalysis={() => setActiveTab("analysis")}
            onExploreDashboard={() => setActiveTab("dashboard")}
          />
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Persistent Medical Disclaimer Banner */}
      <DisclaimerBanner />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header Bar */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Page Body View Container */}
          <main style={{ flex: 1, padding: "24px", backgroundColor: "#0b132b", overflowY: "auto" }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
