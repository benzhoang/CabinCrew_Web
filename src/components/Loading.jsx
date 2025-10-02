import React, { useEffect, useState } from 'react';
import { t, onLangChange } from '../i18n';

const Loading = ({ message }) => {
    const [langTick, setLangTick] = useState(0);

    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
                <div className="text-center">
                    {/* Spinner */}
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>

                    {/* Loading text */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {message || t('loading_default_message')}
                    </h3>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>

                    {/* Additional info */}
                    <p className="text-sm text-gray-600">
                        {t('loading_please_wait')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Loading;
