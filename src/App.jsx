import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import SidebarRecruiter from "./components/SidebarRecruiter";
import Footer from "./pages/Candidate/Footer";
import AdminLayout from "./layouts/AdminLayout";
import AirlinePartnerDashboardPage from "./pages/Admin/AirlinePartnerDashboardPage";
import AirlinePartnerListPage from "./pages/Admin/AirlinePartnerListPage";
import CabinCrewDashboardPage from "./pages/Admin/CabinCrewDashboardPage";
import CabinCrewListPage from "./pages/Admin/CabinCrewListPage";
import CandidateDashboardPage from "./pages/Admin/CandidateDashboardPage";
import CandidateListPage from "./pages/Admin/CandidateListPage";
import CampaignListPage from "./pages/Admin/CampaignListPage";
import RecruiterListPage from "./pages/Admin/RecruiterListPage";
import MainPage from "./pages/MainPage";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import HomePage from "./pages/Candidate/HomePage";
import Settings from "./pages/Candidate/Settings";
import Contact from "./pages/Candidate/Contact";
import Recruiment from "./pages/Candidate/Recruiment";
import Apply from "./pages/Candidate/Apply";
import ApplicationForm from "./pages/Candidate/ApplicationForm";
import RecruitmentHistory from "./pages/Candidate/RecruitmentHistory";
import RecruitmentStages from "./pages/Candidate/RecruitmentStages";
import ProfilePage from "./pages/Candidate/ProfilePage";
import Forget from "./pages/Forget";
import Campaign from "./pages/Recruiter/Campaign";
import CampaignDetail from "./pages/Recruiter/CampaignDetail";
import Screening from "./pages/Recruiter/Screening";
import FinalReview from "./pages/Recruiter/FinalReview";
import CandidateApplyDetail from "./pages/Recruiter/CandidateApplyDetail";
import Tasks from "./pages/Recruiter/Tasks";
import AirlinePartnerLayout from "./layouts/AirlinePartnerLayout";
import CandidateDetailPage from "./pages/AirlinePartner/CandidateDetailPage";
import BatchDetailPage from "./pages/AirlinePartner/BatchDetailPage";
import CabinCrewHomePage from "./pages/CabinCrew/CabinCrewHomePage";
import PromotionHistoryPage from "./pages/CabinCrew/PromotionHistoryPage";
import PromotionStagesPage from "./pages/CabinCrew/PromotionStagesPage";
import ApplicationDetailPage from "./pages/CabinCrew/ApplicationDetailPage";
import CabinCrewLayout from "./layouts/CabinCrewLayout";
import PromotionPage from "./pages/CabinCrew/PromotionPage";
import PromotionApplyPage from "./pages/CabinCrew/PromotionApplyPage";
import ProfileCabinCrewPage from "./pages/CabinCrew/ProfileCabinCrewPage";
import DirectorSidebar from "./components/DirectorSidebar";
import DirectorCampaign from "./pages/Director/DirectorCampaign";
import DirectorCampInfo from "./pages/Director/DirectorCampDetail/DirectorCampInfo";
import SettingsPage from "./pages/CabinCrew/SettingsPage";
import SeniorCampaignPage from "./pages/SeniorRecruiter/SeniorCampaignPage";
import SeniorRecruiterLayout from "./layouts/SeniorRecruiterLayout";
import SeniorCampaignDetailPage from "./pages/SeniorRecruiter/SeniorCampaignDetailPage";
import SeniorRequestPage from "./pages/SeniorRecruiter/SeniorRequestPage";
import AirlineRequestPage from "./pages/AirlinePartner/AirlineRequestPage";
import SeniorCreateCampaignPage from "./pages/SeniorRecruiter/SeniorCreateCampaignPage";
import DirectorRequestList from "./pages/Director/RequestList";
import RequestCampInfo from "./pages/Director/RequestDetail/RequestCampInfo";
import ExaminerSidebar from "./components/ExaminerComponent/ExaminerSidebar";
import ExaminerCampaign from "./pages/Examiner/ExaminerCampaign";
import ExaminerCampDetail from "./pages/Examiner/ExaminerDetail/ExaminerCampDetail";
import AirlineRequestDetailPage from "./pages/AirlinePartner/AirlineRequestDetailPage";
import SeniorRequestDetailPage from "./pages/SeniorRecruiter/SeniorRequestDetailPage";
import ExaminerApplyList from "./pages/Examiner/ExaminerDetail/ExaminerApplyList";
import ExaminerCandidateEvaluation from "./pages/Examiner/ExaminerDetail/ExaminerCandidateEvaluation";
import Test from "./pages/Candidate/Test";
import ExamPage from "./pages/Candidate/ExamTest/ExamPage";
import ExamResultPage from "./pages/Candidate/ExamResult/ExamResultPage";
import ScoreReport from "./pages/Candidate/ScoreReport";
import ExamReportPage from "./pages/Candidate/ExamReport/ExamReportPage";
import TestListPage from "./pages/CabinCrew/TestListPage";
import TestPage from "./pages/CabinCrew/TestPage";
import ScoreListPage from "./pages/Examiner/ExaminerDetail/ScoreListPage";
import AppealDetail from "./pages/Examiner/ExaminerDetail/AppealUpdate/AppealDetail";
import ExamCampaignListPage from "./pages/Examiner/ExamCampaignListPage";
import PromotionAppointmentInterviewPage from "./pages/CabinCrew/PromotionAppointmentInterviewPage";
import AppointmentPage from "./pages/Candidate/Appointment";
import AppearanceResultPage from "./pages/Candidate/AppearanceResultPage";
import InterviewResultPage from "./pages/Candidate/InterviewResultPage";
import DetailResultPage from "./pages/Candidate/DetailResultPage";
import TestResultPage from "./pages/CabinCrew/TestResultPage";
import ExaminerListPage from "./pages/Admin/ExaminerListPage";
import TestingPage from "./pages/Examiner/TestingPage";
import TestDetailPage from "./pages/Examiner/TestDetailPage";
import CreatePromotionRequestPage from "./pages/AirlinePartner/CreatePromotionRequestPage";
import CreateCampaignRequestPage from "./pages/AirlinePartner/CreateCampaignRequestPage";
import CreateTestPage from "./pages/Examiner/CreateTestPage";
import ExamTask from "./pages/Examiner/ExamTask";
import ExaminerCabinCrewEvaluationPage from "./pages/Examiner/ExaminerDetail/ExaminerCabinCrewEvaluationPage";
import DirectorApplyList from "./pages/Director/DirectorApplyList";
import AirlineCampaignDetailPage from "./pages/AirlinePartner/AirlineCampaignDetailPage";
import AirlineCampaignPage from "./pages/AirlinePartner/AirlineCampaignPage";
import TestQuestionDetail from "./pages/Examiner/ExaminerDetail/TestQuestionDetail";
import ExaminerTestSessionDetail from "./pages/Examiner/ExaminerDetail/ExaminerTestSessionDetail";
import PracticalTestReportPage from "./pages/CabinCrew/TestReport/PracticalTestReportPage";
import ScoreReportPage from "./pages/CabinCrew/TestReport/ScoreReportPage";
import ApplicationFormPage from "./pages/CabinCrew/ApplicationFormPage";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<MainPage />} />
        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<Forget />} />
        <Route
          path="/settings"
          element={
            <>
              <Navbar />
              <Settings />
              <Footer />
            </>
          }
        />
        <Route
          path="/profile/:applicationId"
          element={
            <>
              <Navbar />
              <ProfilePage />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route
          path="/recruitment"
          element={
            <>
              <Navbar />
              <Recruiment />
              <Footer />
            </>
          }
        />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/application-form/:id" element={<ApplicationForm />} />
        <Route
          path="/recruitment-history"
          element={
            <>
              <Navbar />
              <RecruitmentHistory />
              <Footer />
            </>
          }
        />
        <Route
          path="/recruitment-stages"
          element={
            <>
              <Navbar />
              <RecruitmentStages />
              <Footer />
            </>
          }
        />
        <Route
          path="/appearance-result/:activityId"
          element={
            <>
              <Navbar />
              <AppearanceResultPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/interview-result/:activityId"
          element={
            <>
              <Navbar />
              <InterviewResultPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/detail-result/:id"
          element={
            <>
              <Navbar />
              <DetailResultPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/test/:id"
          element={
            <>
              <Navbar />
              <Test />
              <Footer />
            </>
          }
        />
        <Route
          path="/exam/:id"
          element={
            <>
              <ExamPage />
            </>
          }
        />
        <Route
          path="/exam-result/:id"
          element={
            <>
              <Navbar />
              <ExamResultPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/appointment"
          element={
            <>
              <Navbar />
              <AppointmentPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/score-report"
          element={
            <>
              <Navbar />
              <ScoreReport />
              <Footer />
            </>
          }
        />
        <Route
          path="/exam-report/:id"
          element={
            <>
              <Navbar />
              <ExamReportPage />
              <Footer />
            </>
          }
        />
        {/* Recruiter Routes */}
        <Route
          path="/recruiter/campaigns"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <Campaign />
              </main>
            </div>
          }
        />

        <Route
          path="/recruiter/campaigns/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <CampaignDetail />
              </main>
            </div>
          }
        />
        <Route
          path="/recruiter/tasks"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <Tasks />
              </main>
            </div>
          }
        />
        <Route
          path="/recruiter/applications/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <Screening />
              </main>
            </div>
          }
        />
        <Route
          path="/recruiter/final-review/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <FinalReview />
              </main>
            </div>
          }
        />
        <Route
          path="/candidate/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <SidebarRecruiter />
              <main className="flex-1 overflow-auto">
                <CandidateApplyDetail />
              </main>
            </div>
          }
        />
      </Routes>
      {/* Admin Routes */}
      <Routes>
        <Route
          path="/admin/dashboard/cabin-crews"
          element={
            <AdminLayout>
              <CabinCrewDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/dashboard/candidates"
          element={
            <AdminLayout>
              <CandidateDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/dashboard/airline-partners"
          element={
            <AdminLayout>
              <AirlinePartnerDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/account/cabin-crews"
          element={
            <AdminLayout>
              <CabinCrewListPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/account/recruiters"
          element={
            <AdminLayout>
              <RecruiterListPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/account/candidates"
          element={
            <AdminLayout>
              <CandidateListPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/account/airline-partners"
          element={
            <AdminLayout>
              <AirlinePartnerListPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/account/examiners"
          element={
            <AdminLayout>
              <ExaminerListPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/campaigns"
          element={
            <AdminLayout>
              <CampaignListPage />
            </AdminLayout>
          }
        />
      </Routes>

      {/* Airline Partner Routes */}
      <Routes>
        <Route
          path="/airline-partner/campaigns"
          element={
            <AirlinePartnerLayout>
              <AirlineCampaignPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/campaigns/:id"
          element={
            <AirlinePartnerLayout>
              <AirlineCampaignDetailPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/campaigns/:id/candidate"
          element={
            <AirlinePartnerLayout>
              <BatchDetailPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/campaigns/:id/candidates/:candidateId"
          element={
            <AirlinePartnerLayout>
              <CandidateDetailPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/requests/campaign/create"
          element={
            <AirlinePartnerLayout>
              <CreateCampaignRequestPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/requests/promotion/create"
          element={
            <AirlinePartnerLayout>
              <CreatePromotionRequestPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/requests"
          element={
            <AirlinePartnerLayout>
              <AirlineRequestPage />
            </AirlinePartnerLayout>
          }
        />
        <Route
          path="/airline-partner/requests/:id"
          element={
            <AirlinePartnerLayout>
              <AirlineRequestDetailPage />
            </AirlinePartnerLayout>
          }
        />
      </Routes>

      {/* Cabin Crew Routes */}
      <Routes>
        <Route
          path="/cabin-crew/home"
          element={
            <CabinCrewLayout>
              <CabinCrewHomePage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/promotion-history"
          element={
            <CabinCrewLayout>
              <PromotionHistoryPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/promotion-stages"
          element={
            <CabinCrewLayout>
              <PromotionStagesPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/application/detail"
          element={
            <CabinCrewLayout>
              <ApplicationDetailPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/promotion"
          element={
            <CabinCrewLayout>
              <PromotionPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/promotion/apply/:id"
          element={
            <CabinCrewLayout>
              <PromotionApplyPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/profile/:id"
          element={
            <CabinCrewLayout>
              <ProfileCabinCrewPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/settings"
          element={
            <CabinCrewLayout>
              <SettingsPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/tests/:id"
          element={
            <CabinCrewLayout>
              <TestListPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/exams/:id"
          element={
            <>
              <TestPage />
            </>
          }
        />
        <Route
          path="/cabin-crew/test-result/:id"
          element={
            <CabinCrewLayout>
              <TestResultPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/interview-appointments"
          element={
            <CabinCrewLayout>
              <PromotionAppointmentInterviewPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/score-report"
          element={
            <CabinCrewLayout>
              <ScoreReportPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/score-report/:id"
          element={
            <CabinCrewLayout>
              <PracticalTestReportPage />
            </CabinCrewLayout>
          }
        />
        <Route
          path="/cabin-crew/application-form/:id"
          element={
            <CabinCrewLayout>
              <ApplicationFormPage />
            </CabinCrewLayout>
          }
        />
      </Routes>

      {/* Senior Recruiter Routes */}
      <Routes>
        <Route
          path="/senior-recruiter/campaigns"
          element={
            <SeniorRecruiterLayout>
              <SeniorCampaignPage />
            </SeniorRecruiterLayout>
          }
        />
        <Route
          path="/senior-recruiter/campaigns/:id"
          element={
            <SeniorRecruiterLayout>
              <SeniorCampaignDetailPage />
            </SeniorRecruiterLayout>
          }
        />
        <Route
          path="/senior-recruiter/campaigns/:id/create"
          element={
            <SeniorRecruiterLayout>
              <SeniorCreateCampaignPage />
            </SeniorRecruiterLayout>
          }
        />
        <Route
          path="/senior-recruiter/requests"
          element={
            <SeniorRecruiterLayout>
              <SeniorRequestPage />
            </SeniorRecruiterLayout>
          }
        />
        <Route
          path="/senior-recruiter/requests/:id"
          element={
            <SeniorRecruiterLayout>
              <SeniorRequestDetailPage />
            </SeniorRecruiterLayout>
          }
        />
      </Routes>

      {/* Examiner Routes */}
      <Routes>
        <Route
          path="/examiner/campaigns"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerCampaign />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerCampDetail />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/tasks"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExamTask />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/:id/applications/:campaignRoundId"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerApplyList />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/candidate/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerCandidateEvaluation />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/cabin-crew/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerCabinCrewEvaluationPage />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/exam-campaigns"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExamCampaignListPage />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/:id/score-list/:campaignRoundId"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ScoreListPage />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/campaigns/:id/test-question/:testId"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <TestQuestionDetail />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/appeal/:testSessionId"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <AppealDetail />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/candidate/test-session/:testSessionId"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <ExaminerTestSessionDetail />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/testing"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <TestingPage />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/testing/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <TestDetailPage />
              </main>
            </div>
          }
        />
        <Route
          path="/examiner/testing/create"
          element={
            <div className="flex h-screen bg-gray-50">
              <ExaminerSidebar />
              <main className="flex-1 overflow-auto">
                <CreateTestPage />
              </main>
            </div>
          }
        />
      </Routes>

      {/* Director Routes */}
      <Routes>
        <Route
          path="/director/campaigns"
          element={
            <div className="flex h-screen bg-gray-50">
              <DirectorSidebar />
              <main className="flex-1 overflow-auto">
                <DirectorCampaign />
              </main>
            </div>
          }
        />
        <Route
          path="/director/campaigns/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <DirectorSidebar />
              <main className="flex-1 overflow-auto">
                <div className="space-y-2">
                  <DirectorCampInfo />
                </div>
              </main>
            </div>
          }
        />
        <Route
          path="/director/requirements"
          element={
            <div className="flex h-screen bg-gray-50">
              <DirectorSidebar />
              <main className="flex-1 overflow-auto">
                <DirectorRequestList />
              </main>
            </div>
          }
        />
        <Route
          path="/director/requirements/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <DirectorSidebar />
              <main className="flex-1 overflow-auto">
                <div className="space-y-2">
                  <RequestCampInfo />
                </div>
              </main>
            </div>
          }
        />
        <Route
          path="/director/applications/:id"
          element={
            <div className="flex h-screen bg-gray-50">
              <DirectorSidebar />
              <main className="flex-1 overflow-auto">
                <DirectorApplyList />
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
