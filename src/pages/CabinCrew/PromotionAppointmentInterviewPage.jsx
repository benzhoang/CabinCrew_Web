import { useEffect, useMemo, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';

// Mock data for interview appointments
const mockAppointments = [
  {
    id: 'APT-001',
    title: 'Phỏng vấn Thăng bậc: Senior Flight Attendant',
    stage: 'Vòng phỏng vấn trực tiếp',
    date: '2025-11-15',
    time: '09:00 - 10:00',
    location: 'Phòng 402, Trụ sở SkyCabin, Q.1, TP.HCM',
    status: 'upcoming', // upcoming | completed | canceled
    notes: 'Có mặt trước 15 phút, mang theo CMND/CCCD',
  },
  {
    id: 'APT-002',
    title: 'Phỏng vấn Thăng bậc: Purser',
    stage: 'Vòng đánh giá hội đồng',
    date: '2025-11-10',
    time: '14:00 - 15:30',
    location: 'Phòng 305, Trung tâm Đào tạo SkyCabin, Hà Nội',
    status: 'completed',
    notes: 'Đã hoàn thành. Chờ kết quả tổng hợp',
  },
  {
    id: 'APT-003',
    title: 'Phỏng vấn Thăng bậc: Senior FA - Bổ sung',
    stage: 'Phỏng vấn trực tuyến',
    date: '2025-11-20',
    time: '10:30 - 11:00',
    location: 'Microsoft Teams (link qua email)',
    status: 'upcoming',
    notes: 'Kiểm tra kết nối trước giờ phỏng vấn 10 phút',
  },
  {
    id: 'APT-004',
    title: 'Phỏng vấn Thăng bậc: Senior FA',
    stage: 'Phỏng vấn trực tiếp',
    date: '2025-10-30',
    time: '09:00 - 09:30',
    location: 'Phòng 202, Cơ sở Tân Sơn Nhất',
    status: 'canceled',
    notes: 'Buổi phỏng vấn đã hủy theo yêu cầu của hội đồng',
  },
];

const statusBadgeClass = (status) => {
  if (status === 'upcoming') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (status === 'completed') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
  if (status === 'canceled') return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
};

const PromotionAppointmentInterviewPage = () => {
  //const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all | upcoming | completed | canceled
  const [, setLangVersion] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((apt) => {
      const matchStatus = filter === 'all' ? true : apt.status === filter;
      const q = search.trim().toLowerCase();
      const matchQuery = !q
        ? true
        : [apt.id, apt.title, apt.stage, apt.location].some((f) => f.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-blue-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {t('interview_appointments_title')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('interview_appointments_subtitle')}
              </p>
            </div>
{/* 
            <button
              onClick={() => navigate('/cabin-crew/promotion-stages')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('back')}
            </button> */}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'upcoming', 'completed', 'canceled'].map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition ${
                  filter === key
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {key === 'all' && t('all')}
                {key === 'upcoming' && t('upcoming')}
                {key === 'completed' && t('completed')}
                {key === 'canceled' && t('canceled')}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 && (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-600">
              {t('no_interviews_found')}
            </div>
          )}

          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadgeClass(apt.status)}`}>
                        {apt.status === 'upcoming' && t('upcoming')}
                        {apt.status === 'completed' && t('completed')}
                        {apt.status === 'canceled' && t('canceled')}
                      </span>
                      <span className="text-xs text-gray-500">#{apt.id}</span>
                    </div>
                    <h3 className="mt-2 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {apt.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{apt.stage}</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 sm:col-span-1 col-span-2">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657L12 22l5.657-5.343z" />
                        </svg>
                        <span className="truncate">{apt.location}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                        {apt.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {apt.status === 'upcoming' && (
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                      >
                        {t('view_details') || 'Xem chi tiết'}
                      </button>
                    )}
                    {apt.status === 'completed' && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg ring-1 ring-blue-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {t('completed') || 'Đã hoàn thành'}
                      </span>
                    )}
                    {apt.status === 'canceled' && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 rounded-lg ring-1 ring-red-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t('canceled') || 'Đã hủy'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionAppointmentInterviewPage;