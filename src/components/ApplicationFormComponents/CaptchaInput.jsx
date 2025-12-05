import React, { useState, useEffect } from 'react'
import { t } from '../../i18n'

/**
 * Component hiển thị và xử lý captcha
 * @param {string} value - Giá trị input captcha
 * @param {function} onChange - Callback khi input thay đổi
 * @param {function} onCodeChange - Callback khi captcha code thay đổi (để parent có thể lưu code)
 */
const CaptchaInput = ({ value, onChange, onCodeChange }) => {
    // Generate random captcha code
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const [captchaCode, setCaptchaCode] = useState('')

    // Initialize captcha on component mount
    useEffect(() => {
        const code = generateCaptcha()
        setCaptchaCode(code)
        if (onCodeChange) {
            onCodeChange(code)
        }
    }, [])

    // Refresh captcha function
    const refreshCaptcha = () => {
        const newCode = generateCaptcha()
        setCaptchaCode(newCode)
        if (onCodeChange) {
            onCodeChange(newCode)
        }
        if (onChange) {
            onChange({ target: { name: 'captcha', value: '' } })
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('application_form_captcha')}</label>
            <div className="flex items-center gap-4">
                <div className="bg-gray-200 p-4 rounded border text-2xl font-bold text-gray-700 select-none">
                    {captchaCode}
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        name="captcha"
                        value={value || ''}
                        onChange={onChange}
                        placeholder={t('application_form_enter_captcha')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={refreshCaptcha}
                className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
            >
                {t('application_form_try_new_code')}
            </button>
        </div>
    )
}

export default CaptchaInput

