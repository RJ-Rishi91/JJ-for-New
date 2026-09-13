import React from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import FuturisticBackground from "./components/common/FuturisticBackground";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SubmitPage from "./pages/SubmitPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import RewardsPage from "./pages/RewardsPage";
import LearnPage from "./pages/LearnPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import CommunityPage from "./pages/CommunityPage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#070412] text-white flex flex-col justify-between relative selection:bg-[#ff2d55]/30 selection:text-white">
          <FuturisticBackground />
          <div className="relative z-10 flex flex-col min-h-screen justify-between">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/submit" element={<SubmitPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
