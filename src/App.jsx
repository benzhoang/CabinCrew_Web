import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import SidebarRecruiter from './components/SidebarRecruiter';
import Footer from './pages/Candidate/Footer';
import AdminLayout from './layout/AdminLayout';
import AirlinePartnerDashboardPage from './pages/Admin/AirlinePartnerDashboardPage';
import AirlinePartnerListPage from './pages/Admin/AirlinePartnerListPage';
import CabinCrewDashboardPage from './pages/Admin/CabinCrewDashboardPage';
import CabinCrewListPage from './pages/Admin/CabinCrewListPage';
import CandidateDashboardPage from './pages/Admin/CandidateDashboardPage';
import CandidateListPage from './pages/Admin/CandidateListPage';
import CampaignListPage from './pages/Admin/CampaignListPage';
import RecruiterListPage from './pages/Admin/RecruiterListPage';
import MainPage from './pages/MainPage';
import Signup from './pages/Signup';
import OTP from './pages/OTP';
import HomePage from './pages/Candidate/HomePage';
import Settings from './pages/Candidate/Settings';
import Contact from './pages/Candidate/Contact';
import Recruiment from './pages/Candidate/Recruiment';
import Apply from './pages/Candidate/Apply';
import Forget from './pages/Forget';
import Campaign from './pages/Recruiter/Campaign';
import CampaignDetail from './pages/Recruiter/CampaignDetail';
import CreateCampaign from './pages/Recruiter/CreateCampaign';
import Screening from './pages/Recruiter/Screening';
import CampaignPage from "./pages/AirlinePartner/CampaignPage";
import AirlinePartnerLayout from "./layout/AirlinePartnerLayout";
import ReportPage from "./pages/AirlinePartner/ReportPage";
import CampaignDetailPage from './pages/AirlinePartner/CampaignDetailPage';
import CandidateDetail from './pages/AirlinePartner/CandidateDetail';
import CreateCampaignInfo from './pages/AirlinePartner/CreateCampaignInfo';
import BatchDetail from "./pages/AirlinePartner/BatchDetail";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home" element={
          <>
            <Navbar />
            <HomePage />
            <Footer />
          </>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<Forget />} />
        <Route path="/settings" element={
          <>
            <Navbar />
            <Settings />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        } />
        <Route path="/recruitment" element={
          <>
            <Navbar />
            <Recruiment />
            <Footer />
          </>
        } />
        <Route path="/apply" element={<Apply />} />
        <Route path="/recruiter/campaigns" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <Campaign />
            </main>
          </div>
        } />
        <Route path="/recruiter/campaigns/create" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <CreateCampaign />
            </main>
          </div>
        } />
        <Route path="/recruiter/campaigns/:id" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <CampaignDetail />
            </main>
          </div>
        } />
        <Route path="/applications" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <Screening />
            </main>
          </div>
        } />
      </Routes>
      {/* Admin Routes */}
      <Routes>
        <Route path="/admin/dashboard/cabin-crews" element={<AdminLayout><CabinCrewDashboardPage /></AdminLayout>} />
        <Route path="/admin/dashboard/candidates" element={<AdminLayout><CandidateDashboardPage /></AdminLayout>} />
        <Route path="/admin/dashboard/airline-partners" element={<AdminLayout><AirlinePartnerDashboardPage /></AdminLayout>} />
        <Route path="/admin/account/cabin-crews" element={<AdminLayout><CabinCrewListPage /></AdminLayout>} />
        <Route path="/admin/account/recruiters" element={<AdminLayout><RecruiterListPage /></AdminLayout>} />
        <Route path="/admin/account/candidates" element={<AdminLayout><CandidateListPage /></AdminLayout>} />
        <Route path="/admin/account/airline-partners" element={<AdminLayout><AirlinePartnerListPage /></AdminLayout>} />
        <Route path="/admin/campaigns" element={<AdminLayout><CampaignListPage /></AdminLayout>} />
      </Routes>

      {/* Airline Partner Routes */}
      <Routes>
        <Route path="/airline-partner/campaigns" element={<AirlinePartnerLayout><CampaignPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/:id" element={<AirlinePartnerLayout><CampaignDetailPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/:id/candidate" element={<AirlinePartnerLayout><BatchDetail /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/:id/candidates/:candidateId" element={<AirlinePartnerLayout><CandidateDetail /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/report" element={<AirlinePartnerLayout><ReportPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/create" element={<AirlinePartnerLayout><CreateCampaignInfo /></AirlinePartnerLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
