import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t, onLangChange } from "../../i18n";

const CabinCrewHomePage = () => {
  // Tự động re-render khi đổi ngôn ngữ
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Image left */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://www.emiratesgroupcareers.com/media/y5cb5x4e/02-w1200x750.jpg"
                alt="Tuyển dụng tiếp viên hàng không"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // fallback: simple gradient if remote image fails
                  e.currentTarget.outerHTML =
                    '<div class="w-full h-[360px] sm:h-[420px] lg:h-[520px] bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-400">Hình minh hoạ</div>';
                }}
              />
            </div>
          </div>

          {/* Content right */}
          <div className="lg:col-span-5">
            <div className="text-left lg:text-left">
              <p className="tracking-widest text-xs font-semibold text-gray-500 uppercase mb-4">
                {t("hero_brand")}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {t("hero_title_1")}
                <br />
                {t("hero_title_2")}
              </h1>
              <p className="mt-6 text-gray-600 text-base lg:text-lg max-w-xl">
                {t("hero_desc")}
              </p>

              <div className="mt-8">
                <Link
                  to="/cabin-crew/promotion"
                  className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  {t("hero_cta")}
                  <span className="ml-2">→</span>
                </Link>
              </div>

              <ul className="mt-8 space-y-2 text-sm text-gray-600">
                <li>{t("req_bullet_1")}</li>
                <li>{t("req_bullet_2")}</li>
                <li>{t("req_bullet_3")}</li>
                <li>{t("req_bullet_4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("features_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("features_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f1_title")}
              </h3>
              <p className="text-gray-600">{t("f1_desc")}</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f2_title")}
              </h3>
              <p className="text-gray-600">{t("f2_desc")}</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f3_title")}
              </h3>
              <p className="text-gray-600">{t("f3_desc")}</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f4_title")}
              </h3>
              <p className="text-gray-600">{t("f4_desc")}</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f5_title")}
              </h3>
              <p className="text-gray-600">{t("f5_desc")}</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("f6_title")}
              </h3>
              <p className="text-gray-600">{t("f6_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Requirements Box */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Requirements</h2>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="space-y-5 flex-1">
                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Form</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">Cover letters</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Age</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">Not less than 21 years of age</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Experience</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">Must have at least 36 months of uninterrupted serve as a cabin crew</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Flight Hours</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">Total flying hours at least 2,000 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Test</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">Satisfactory completion of safety test must be at least 80% points</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">Valid English certificate</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">TOEIC 600 or higher</p>
                        <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">(TOEFL iBT home edition and other certificates that cannot be verified in Vietnam are not accepted.)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion Process Box */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">Promotion Process</h3>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="space-y-5 flex-1">
                  <div className="flex items-start space-x-4 pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        1
                      </div>
                      <div className="absolute left-1/2 top-full w-0.5 h-5 bg-gray-200 transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-base">Screening</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Initial document review and application screening to verify all promotion requirements are met.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        2
                      </div>
                      <div className="absolute left-1/2 top-full w-0.5 h-5 bg-gray-200 transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-base">Flight Hours Confirmation</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Verification of total flying hours and service records to confirm eligibility for promotion.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        3
                      </div>
                      <div className="absolute left-1/2 top-full w-0.5 h-5 bg-gray-200 transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-base">Practical Test</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Hands-on assessment of safety procedures, emergency protocols, and operational competencies.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        4
                      </div>
                      <div className="absolute left-1/2 top-full w-0.5 h-5 bg-gray-200 transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-base">Interview</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Comprehensive interview to evaluate leadership potential, communication skills, and readiness for advanced responsibilities.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        5
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-gray-900 mb-1.5 text-base">Final</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Final review and approval process. Successful candidates will receive promotion confirmation and updated role assignments.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("benefits_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("benefits_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">💵</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("b1_title")}
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>{t("b1_i1")}</li>
                <li>{t("b1_i2")}</li>
                <li>{t("b1_i3")}</li>
                <li>{t("b1_i4")}</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🏥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("b2_title")}
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>{t("b2_i1")}</li>
                <li>{t("b2_i2")}</li>
                <li>{t("b2_i3")}</li>
                <li>{t("b2_i4")}</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">✈️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("b3_title")}
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>{t("b3_i1")}</li>
                <li>{t("b3_i2")}</li>
                <li>{t("b3_i3")}</li>
                <li>{t("b3_i4")}</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("b4_title")}
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>{t("b4_i1")}</li>
                <li>{t("b4_i2")}</li>
                <li>{t("b4_i3")}</li>
                <li>{t("b4_i4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("testi_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("testi_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">A</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Anna Nguyen</h4>
                  <p className="text-sm text-gray-600">{t("testi_1_role")}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{t("testi_1_quote")}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-600">{t("testi_2_role")}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{t("testi_2_quote")}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">{t("testi_3_role")}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{t("testi_3_quote")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t("cta_title")}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t("cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/recruitment"
              className="inline-flex items-center px-8 py-4 rounded-xl text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold"
            >
              {t("cta_primary")}
              <span className="ml-2">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 rounded-xl text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold"
            >
              {t("cta_secondary")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CabinCrewHomePage;
