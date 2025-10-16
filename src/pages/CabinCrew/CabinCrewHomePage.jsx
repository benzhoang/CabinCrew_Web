import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';

const CabinCrewHomePage = () => {

    // Tự động re-render khi đổi ngôn ngữ
    const [langTick, setLangTick] = useState(0);
    
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
                                    e.currentTarget.outerHTML = '<div class="w-full h-[360px] sm:h-[420px] lg:h-[520px] bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-400">Hình minh hoạ</div>';
                                }}
                            />
                        </div>
                    </div>

                    {/* Content right */}
                    <div className="lg:col-span-5">
                        <div className="text-left lg:text-left">
                            <p className="tracking-widest text-xs font-semibold text-gray-500 uppercase mb-4">
                                {t('hero_brand')}
                            </p>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                {t('hero_title_1')}
                                <br />
                                {t('hero_title_2')}
                            </h1>
                            <p className="mt-6 text-gray-600 text-base lg:text-lg max-w-xl">
                                {t('hero_desc')}
                            </p>

                            <div className="mt-8">
                                <Link
                                    to="/recruitment"
                                    className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                                >
                                    {t('hero_cta')}
                                    <span className="ml-2">→</span>
                                </Link>
                            </div>

                            <ul className="mt-8 space-y-2 text-sm text-gray-600">
                                <li>{t('req_bullet_1')}</li>
                                <li>{t('req_bullet_2')}</li>
                                <li>{t('req_bullet_3')}</li>
                                <li>{t('req_bullet_4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('features_title')}</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('features_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🌍</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f1_title')}</h3>
                            <p className="text-gray-600">{t('f1_desc')}</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💼</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f2_title')}</h3>
                            <p className="text-gray-600">{t('f2_desc')}</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f3_title')}</h3>
                            <p className="text-gray-600">{t('f3_desc')}</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f4_title')}</h3>
                            <p className="text-gray-600">{t('f4_desc')}</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f5_title')}</h3>
                            <p className="text-gray-600">{t('f5_desc')}</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('f6_title')}</h3>
                            <p className="text-gray-600">{t('f6_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Requirements Section */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t('req_title')}</h2>
                            <p className="text-lg text-gray-600 mb-8">{t('req_subtitle')}</p>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-600 font-semibold">1</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('req_basic_title')}</h3>
                                        <ul className="text-gray-600 space-y-1">
                                            <li>{t('req_basic_b1')}</li>
                                            <li>{t('req_basic_b2')}</li>
                                            <li>{t('req_basic_b3')}</li>
                                            <li>{t('req_basic_b4')}</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-600 font-semibold">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('req_lang_title')}</h3>
                                        <ul className="text-gray-600 space-y-1">
                                            <li>{t('req_lang_b1')}</li>
                                            <li>{t('req_lang_b2')}</li>
                                            <li>{t('req_lang_b3')}</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-600 font-semibold">3</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('req_look_title')}</h3>
                                        <ul className="text-gray-600 space-y-1">
                                            <li>{t('req_look_b1')}</li>
                                            <li>{t('req_look_b2')}</li>
                                            <li>{t('req_look_b3')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('process_title')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{t('process_1_h')}</h4>
                                        <p className="text-sm text-gray-600">{t('process_1_p')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{t('process_2_h')}</h4>
                                        <p className="text-sm text-gray-600">{t('process_2_p')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{t('process_3_h')}</h4>
                                        <p className="text-sm text-gray-600">{t('process_3_p')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{t('process_4_h')}</h4>
                                        <p className="text-sm text-gray-600">{t('process_4_p')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">5</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{t('process_5_h')}</h4>
                                        <p className="text-sm text-gray-600">{t('process_5_p')}</p>
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
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('benefits_title')}</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('benefits_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-white">💵</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('b1_title')}</h3>
                            <ul className="text-gray-600 space-y-2 text-sm">
                                <li>{t('b1_i1')}</li>
                                <li>{t('b1_i2')}</li>
                                <li>{t('b1_i3')}</li>
                                <li>{t('b1_i4')}</li>
                            </ul>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-white">🏥</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('b2_title')}</h3>
                            <ul className="text-gray-600 space-y-2 text-sm">
                                <li>{t('b2_i1')}</li>
                                <li>{t('b2_i2')}</li>
                                <li>{t('b2_i3')}</li>
                                <li>{t('b2_i4')}</li>
                            </ul>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-white">✈️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('b3_title')}</h3>
                            <ul className="text-gray-600 space-y-2 text-sm">
                                <li>{t('b3_i1')}</li>
                                <li>{t('b3_i2')}</li>
                                <li>{t('b3_i3')}</li>
                                <li>{t('b3_i4')}</li>
                            </ul>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-white">🏠</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('b4_title')}</h3>
                            <ul className="text-gray-600 space-y-2 text-sm">
                                <li>{t('b4_i1')}</li>
                                <li>{t('b4_i2')}</li>
                                <li>{t('b4_i3')}</li>
                                <li>{t('b4_i4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('testi_title')}</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('testi_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-blue-600 font-semibold">A</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Anna Nguyen</h4>
                                    <p className="text-sm text-gray-600">{t('testi_1_role')}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">{t('testi_1_quote')}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-blue-600 font-semibold">M</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                                    <p className="text-sm text-gray-600">{t('testi_2_role')}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">{t('testi_2_quote')}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-blue-600 font-semibold">S</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                                    <p className="text-sm text-gray-600">{t('testi_3_role')}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">{t('testi_3_quote')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t('cta_title')}</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        {t('cta_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/recruitment"
                            className="inline-flex items-center px-8 py-4 rounded-xl text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold"
                        >
                            {t('cta_primary')}
                            <span className="ml-2">→</span>
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center px-8 py-4 rounded-xl text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold"
                        >
                            {t('cta_secondary')}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CabinCrewHomePage;