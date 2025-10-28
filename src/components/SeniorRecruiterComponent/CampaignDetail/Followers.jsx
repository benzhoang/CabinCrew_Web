import React from 'react'

const Followers = ({ followers }) => {
    const list = Array.isArray(followers) && followers.length ? followers : new Array(6).fill(null)
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">Người theo dõi</div>
            <div className="p-5">
                <div className="flex items-center gap-2 flex-wrap">
                    {list.map((u, idx) => (
                        u && u.avatar ? (
                            <img
                                key={idx}
                                src={u.avatar}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover border border-slate-200"
                            />
                        ) : (
                            <div key={idx} className="h-8 w-8 rounded-full bg-slate-200 border border-slate-200" />
                        )
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Followers
