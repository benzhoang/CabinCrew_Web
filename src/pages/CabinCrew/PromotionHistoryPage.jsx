import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';

const PromotionHistoryPage = () => {
  const navigate = useNavigate();

  // Tự động re-render khi đổi ngôn ngữ
  const [, setLangTick] = useState(0);
  useEffect(() => {
      const off = onLangChange(() => setLangTick((v) => v + 1));
      return () => off();
  }, []);

  // Mock data cho lịch sử tuyển dụng
  const recruitmentHistory = [
      {
          id: 1,
          position: 'Tuyển dụng Tiếp viên Hàng không 2025',
          company: 'Vietnam Airlines',
          appliedDate: '2024-01-15',
          status: 'pending',
          statusText: 'Đang xem xét',
          statusTextEn: 'Under Review',
          location: 'Hà Nội, TP.HCM',
          salary: '$2,500 - $3,500/month',
          description: 'Cơ hội trở thành tiếp viên hàng không chuyên nghiệp.'
      },
      {
          id: 2,
          position: 'Ground Staff Intake',
          company: 'Bamboo Airways',
          appliedDate: '2023-12-20',
          status: 'rejected',
          statusText: 'Không đạt yêu cầu',
          statusTextEn: 'Not Qualified',
          location: 'Đà Nẵng',
          salary: '$2,200 - $3,200/month',
          description: 'Tuyển dụng nhân viên mặt đất phụ trách làm thủ tục.'
      },
      {
          id: 3,
          position: 'Pilot Cadet Program',
          company: 'VietJet Air',
          appliedDate: '2023-11-10',
          status: 'accepted',
          statusText: 'Đã được chấp nhận',
          statusTextEn: 'Accepted',
          location: 'TP.HCM',
          salary: '$2,800 - $3,800/month',
          description: 'Chương trình học viên phi công đã kết thúc.'
      },
      {
          id: 4,
          position: 'Customer Service Expansion',
          company: 'Pacific Airlines',
          appliedDate: '2023-10-05',
          status: 'rejected',
          statusText: 'Không đạt yêu cầu',
          statusTextEn: 'Not Qualified',
          location: 'Hà Nội',
          salary: '$800 - $1,200/month',
          description: 'Mở rộng đội ngũ chăm sóc khách hàng tại sân bay Nội Bài.'
      }
  ];

  const getStatusColor = (status) => {
      switch (status) {
          case 'accepted':
              return 'bg-green-100 text-green-800';
          case 'pending':
              return 'bg-yellow-100 text-yellow-800';
          case 'rejected':
              return 'bg-red-100 text-red-800';
          default:
              return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusText = (item) => {
      const lang = localStorage.getItem('lang') || 'vi';
      return lang === 'vi' ? item.statusText : item.statusTextEn;
  };

  // Hàm xử lý khi nhấn nút "Xem chi tiết"
  const handleViewDetails = (application) => {
      // Tạo campaign object từ application data để truyền vào ApplicationForm
      const campaignData = {
          id: application.id,
          title: application.position,
          company: application.company,
          location: application.location,
          salary: application.salary,
          description: application.description,
          status: application.status,
          appliedDate: application.appliedDate
      };

      // Điều hướng đến ApplicationForm với state chứa campaign data
      navigate('/application-form', {
          state: {
              campaign: campaignData,
              isUpdate: true // Flag để biết đây là chế độ cập nhật
          }
      });
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {t('recruitment_history')}
                  </h1>
                  <p className="text-gray-600">
                      {t('recruitment_history_subtitle')}
                  </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">{t('total_applications')}</p>
                              <p className="text-2xl font-semibold text-gray-900">{recruitmentHistory.length}</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">{t('accepted')}</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                  {recruitmentHistory.filter(item => item.status === 'accepted').length}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                  {recruitmentHistory.filter(item => item.status === 'pending').length}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-lg">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">Không đạt yêu cầu</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                  {recruitmentHistory.filter(item => item.status === 'rejected').length}
                              </p>
                          </div>
                      </div>
                  </div>

              </div>

              {/* Applications List */}
              <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">{t('application_history')}</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                      {recruitmentHistory.map((application) => (
                          <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <h3 className="text-lg font-semibold text-gray-900">
                                              {application.position}
                                          </h3>
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                              {getStatusText(application)}
                                          </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{application.company}</p>
                                      <p className="text-sm text-gray-500 mb-3">{application.description}</p>
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                          <div className="flex items-center gap-1">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                              </svg>
                                              {application.location}
                                          </div>
                                          <div className="flex items-center gap-1">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                              </svg>
                                              {application.salary}
                                          </div>
                                          <div className="flex items-center gap-1">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                              {t('applied_on')}: {new Date(application.appliedDate).toLocaleDateString()}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="ml-4 flex flex-col gap-2">
                                      <button
                                          onClick={() => handleViewDetails(application)}
                                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                      >
                                          {t('view_details')}
                                      </button>
                                      {application.status === 'accepted' && (
                                          <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                              {t('accept_offer')}
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Empty State (if no applications) */}
              {recruitmentHistory.length === 0 && (
                  <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_applications')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('no_applications_desc')}</p>
                      <div className="mt-6">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                              {t('browse_jobs')}
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
}

export default PromotionHistoryPage