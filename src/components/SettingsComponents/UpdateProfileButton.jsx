import React from 'react';
import { t } from '../../i18n';

const UpdateProfileButton = ({ isLoading }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang cập nhật...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <path d="M17 21v-8H7v8" />
                                <path d="M7 3v5h8" />
                            </svg>
                            {t('update_profile')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default UpdateProfileButton;

