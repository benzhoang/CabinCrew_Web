import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import SidebarRecruiter from './components/SidebarRecruiter';
import Footer from './pages/Candidate/Footer';
import AdminLayout from './layouts/AdminLayout';
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
import ApplicationForm from './pages/Candidate/ApplicationForm';
import RecruitmentHistory from './pages/Candidate/RecruitmentHistory';
import RecruitmentStages from './pages/Candidate/RecruitmentStages';
import ProfilePage from './pages/Candidate/ProfilePage';
import Forget from './pages/Forget';
import Campaign from './pages/Recruiter/Campaign';
import CampaignDetail from './pages/Recruiter/CampaignDetail';
import Screening from './pages/Recruiter/Screening';
import FinalReview from './pages/Recruiter/FinalReview';
import CandidateApplyDetail from './pages/Recruiter/CandidateApplyDetail';
import CampaignPage from "./pages/AirlinePartner/CampaignPage";
import AirlinePartnerLayout from "./layouts/AirlinePartnerLayout";
import CampaignDetailPage from './pages/AirlinePartner/CampaignDetailPage';
import CandidateDetailPage from './pages/AirlinePartner/CandidateDetailPage';
import BatchDetailPage from "./pages/AirlinePartner/BatchDetailPage";
import CabinCrewHomePage from './pages/CabinCrew/CabinCrewHomePage';
import PromotionHistoryPage from "./pages/CabinCrew/PromotionHistoryPage";
import PromotionStagesPage from "./pages/CabinCrew/PromotionStagesPage";
import ApplicationDetailPage from "./pages/CabinCrew/ApplicationDetailPage";
import CabinCrewLayout from "./layouts/CabinCrewLayout";
import PromotionPage from "./pages/CabinCrew/PromotionPage";
import PromotionApplyPage from "./pages/CabinCrew/PromotionApplyPage";
import ProfileCabinCrewPage from "./pages/CabinCrew/ProfileCabinCrewPage";
import DirectorSidebar from './components/DirectorSidebar';
import DirectorCampaign from './pages/Director/DirectorCampaign';
import DirectorCampInfo from './pages/Director/DirectorCampDetail/DirectorCampInfo';
import CreateCampaignInfoPage from "./pages/AirlinePartner/CreateCampaignInfoPage";
import SettingsPage from "./pages/CabinCrew/SettingsPage";
import SeniorCampaignPage from "./pages/SeniorRecruiter/SeniorCampaignPage";
import SeniorRecruiterLayout from "./layouts/SeniorRecruiterLayout";
import SeniorCampaignDetailPage from "./pages/SeniorRecruiter/SeniorCampaignDetailPage";
import CreatePromotionInfoPage from "./pages/AirlinePartner/CreatePromotionInfo";
import SeniorRequestPage from "./pages/SeniorRecruiter/SeniorRequestPage";
import AirlineRequestPage from "./pages/AirlinePartner/AirlineRequestPage";
import SeniorCreateCampaignPage from "./pages/SeniorRecruiter/SeniorCreateCampaignPage";
import DirectorRequestList from './pages/Director/RequestList';
import RequestCampInfo from './pages/Director/RequestDetail/RequestCampInfo';
import DirectorBatchInfo from './pages/Director/DirectorCampDetail/DirectorBatchInfo';
import ExaminerSidebar from './components/ExaminerSidebar';
import ExaminerCampaign from './pages/Examiner/ExaminerCampaign';

// import ReportPage from "./pages/AirlinePartner/ReportPage";


function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
            <Footer />
          </>
        } />
        <Route path="/login" element={<MainPage />} />
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
        <Route path="/profile" element={
          <>
            <Navbar />
            <ProfilePage />
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
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/recruitment-history" element={
          <>
            <Navbar />
            <RecruitmentHistory />
            <Footer />
          </>
        } />
        <Route path="/recruitment-stages" element={
          <>
            <Navbar />
            <RecruitmentStages />
            <Footer />
          </>
        } />
        {/* Recruiter Routes */}
        <Route path="/recruiter/campaigns" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <Campaign />
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
        <Route path="/recruiter/applications" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <Screening />
            </main>
          </div>
        } />
        <Route path="/recruiter/final-review" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <FinalReview />
            </main>
          </div>
        } />
        <Route path="/candidate/:id" element={
          <div className="flex h-screen bg-gray-50">
            <SidebarRecruiter />
            <main className="flex-1 overflow-auto">
              <CandidateApplyDetail />
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
        <Route path="/airline-partner/campaigns/:id/candidate" element={<AirlinePartnerLayout><BatchDetailPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/:id/candidates/:candidateId" element={<AirlinePartnerLayout><CandidateDetailPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/create" element={<AirlinePartnerLayout><CreateCampaignInfoPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/campaigns/create/promotion" element={<AirlinePartnerLayout><CreatePromotionInfoPage /></AirlinePartnerLayout>} />
        <Route path="/airline-partner/requests" element={<AirlinePartnerLayout><AirlineRequestPage /></AirlinePartnerLayout>} />

        {/* <Route path="/airline-partner/report" element={<AirlinePartnerLayout><ReportPage /></AirlinePartnerLayout>} /> */}
      </Routes>

      {/* Cabin Crew Routes */}
      <Routes>
        <Route path="/cabin-crew/home" element={<CabinCrewLayout><CabinCrewHomePage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/promotion-history" element={<CabinCrewLayout><PromotionHistoryPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/promotion-stages" element={<CabinCrewLayout><PromotionStagesPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/application/detail" element={<CabinCrewLayout><ApplicationDetailPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/promotion" element={<CabinCrewLayout><PromotionPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/promotion/apply" element={<CabinCrewLayout><PromotionApplyPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/profile" element={<CabinCrewLayout><ProfileCabinCrewPage /></CabinCrewLayout>} />
        <Route path="/cabin-crew/settings" element={<CabinCrewLayout><SettingsPage /></CabinCrewLayout>} />
      </Routes>

      {/* Senior Recruiter Routes */}
      <Routes>
        <Route path="/senior-recruiter/campaigns" element={<SeniorRecruiterLayout><SeniorCampaignPage /></SeniorRecruiterLayout>} />
        <Route path="/senior-recruiter/campaigns/:id" element={<SeniorRecruiterLayout><SeniorCampaignDetailPage /></SeniorRecruiterLayout>} />
        <Route path="/senior-recruiter/campaigns/create" element={<SeniorRecruiterLayout><SeniorCreateCampaignPage /></SeniorRecruiterLayout>} />
        <Route path="/senior-recruiter/requests" element={<SeniorRecruiterLayout><SeniorRequestPage /></SeniorRecruiterLayout>} />
      </Routes>

      {/* Examiner Routes */}
      <Routes>
        <Route path="/examiner/campaigns" element={
          <div className="flex h-screen bg-gray-50">
            <ExaminerSidebar />
            <main className="flex-1 overflow-auto">
              <ExaminerCampaign />
            </main>
          </div>
        } />
      </Routes>


      {/* Director Routes */}
      <Routes>
        <Route path="/director/campaigns" element={
          <div className="flex h-screen bg-gray-50">
            <DirectorSidebar />
            <main className="flex-1 overflow-auto">
              <DirectorCampaign />
            </main>
          </div>
        } />
        <Route path="/director/campaigns/:id" element={
          <div className="flex h-screen bg-gray-50">
            <DirectorSidebar />
            <main className="flex-1 overflow-auto">
              <div className="space-y-2">
                <DirectorCampInfo />
                <DirectorBatchInfo />
              </div>
            </main>
          </div>
        } />
        <Route path="/director/requirements" element={
          <div className="flex h-screen bg-gray-50">
            <DirectorSidebar />
            <main className="flex-1 overflow-auto">
              <DirectorRequestList />
            </main>
          </div>
        } />
        <Route path="/director/requirements/:id" element={
          <div className="flex h-screen bg-gray-50">
            <DirectorSidebar />
            <main className="flex-1 overflow-auto">
              <div className="space-y-2">
                <RequestCampInfo />
              </div>
            </main>
          </div>
        } />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
