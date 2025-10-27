import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../images/Logo.png'
import { t, onLangChange } from '../i18n'

function getInitials(name) {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'U'
}

const FolderIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
)

const MicIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0014 0" />
        <path d="M12 19v3" />
    </svg>
)

const StarIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.48 3.5a1 1 0 011.04 0l3.12 1.87 3.54.52a1 1 0 01.55 1.7l-2.56 2.5.6 3.5a1 1 0 01-1.45 1.06L12 13.9 8.68 15.7a1 1 0 01-1.45-1.06l.6-3.5L5.27 7.6a1 1 0 01.55-1.7l3.54-.52 3.12-1.87z" />
    </svg>
)

const CampaignIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M3 3h18v18H3V3z" />
        <path d="M9 9h6v6H9V9z" />
        <path d="M12 3v18" />
        <path d="M3 12h18" />
    </svg>
)

const LogoutIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const navItems = [
    { to: '/director/campaigns', key: 'sidebar_campaign', icon: CampaignIcon },
    { to: '/interviews', key: 'sidebar_interviews', icon: MicIcon },
    { to: '/scoring', key: 'sidebar_evaluation', icon: StarIcon },
]

const DirectorSidebar = ({ username = 'Nguyễn Văn A' }) => {
    const [displayName, setDisplayName] = useState(username)
    const [role, setRole] = useState('Director')
    const initials = getInitials(displayName)
    const [, setLangTick] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        // Load employee data from localStorage
        const employee = localStorage.getItem('employee')
        if (employee) {
            const employeeData = JSON.parse(employee)
            if (employeeData.displayName) {
                setDisplayName(employeeData.displayName)
            }
            if (employeeData.role === 'director') {
                setRole('Director')
            }
        }
    }, [])

    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1))
        return () => off()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('employee');
        window.dispatchEvent(new Event('auth-changed'))
        navigate('/')
    }

    return (
        <aside className="h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col">
            <div className="h-36 px-4 flex items-center justify-center border-b border-slate-200 bg-slate-50/70 shadow-inner">
                <img src={logo} alt="Logo" className="h-24 w-auto object-contain drop-shadow-sm" />
            </div>

            <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
                    {initials}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-slate-800 font-semibold tracking-tight">{displayName}</span>
                    <span className="text-xs text-slate-500">{role}</span>
                </div>
            </div>

            <nav className="p-3 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-sm border-indigo-600'
                                : 'text-slate-700 hover:bg-slate-100 border-transparent'
                            }`
                        }
                    >
                        {(() => {
                            const Icon = item.icon; return (
                                <Icon className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-800 group-[.active]:text-white" />
                            )
                        })()}
                        <span className="leading-5">{t(item.key)}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 border-t border-slate-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogoutIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-5">{t('sidebar_logout')}</span>
                </button>
                <div className="text-xs text-slate-500 mt-2">
                    © {new Date().getFullYear()} Cabin HR
                </div>
            </div>
        </aside>
    )
}

export default DirectorSidebar


