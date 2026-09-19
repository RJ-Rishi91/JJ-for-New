import React, { useEffect } from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AdminPage from "./pages/AdminPage";
import CommunityPage from "./pages/CommunityPage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import MessagesPage from "./pages/MessagesPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import EditorialStandardsPage from "./pages/EditorialStandardsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/**
 * SEO, Canonical and Trailing Slash Normalization Component
 * Ensures every route ends with a '/' (redirects non-trailing slash URLs to prevent duplicate content),
 * updates canonical <link> in document head, and resets scroll to top on navigation.
 */
function SeoAndRoutingManager() {
  const location = useLocation();

  useEffect(() => {
    // 1. Reset scroll to top on every navigation
    window.scrollTo(0, 0);

    // 2. Manage dynamic canonical tag
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const cleanPath = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
    canonical.setAttribute("href", `https://junior-journalist.onerishi.in${cleanPath}`);
  }, [location]);

  // 3. Normalize non-trailing slash URL with client replace
  if (!location.pathname.endsWith("/")) {
    return (
      <Navigate
        to={{
          pathname: `${location.pathname}/`,
          search: location.search,
          hash: location.hash,
        }}
        replace
      />
    );
  }

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#070412] text-white flex flex-col justify-between relative selection:bg-[#ff2d55]/30 selection:text-white">
      <FuturisticBackground />
      <SeoAndRoutingManager />
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {!isAdminRoute && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore/" element={<ExplorePage />} />
            <Route path="/projects/" element={<ProjectsPage />} />
            <Route path="/messages/" element={<MessagesPage />} />
            <Route path="/submit/" element={<SubmitPage />} />
            <Route path="/events/" element={<EventsPage />} />
            <Route path="/events/:id/" element={<EventDetailPage />} />
            <Route path="/rewards/" element={<RewardsPage />} />
            <Route path="/learn/" element={<LearnPage />} />
            <Route path="/opportunities/" element={<OpportunitiesPage />} />
            <Route path="/profile/:id/" element={<ProfilePage />} />
            <Route path="/dashboard/" element={<DashboardPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/admin/" element={<AdminPage />} />
            <Route path="/community/" element={<CommunityPage />} />
            <Route path="/submissions/:id/" element={<SubmissionDetailPage />} />
            <Route path="/about/" element={<AboutPage />} />
            <Route path="/privacy/" element={<PrivacyPage />} />
            <Route path="/terms/" element={<TermsPage />} />
            <Route path="/editorial-standards/" element={<EditorialStandardsPage />} />
            <Route path="/contact/" element={<ContactPage />} />
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
