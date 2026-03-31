import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getMember, clearMember } from '../utils/member'
import { getAllReportsWithIssues } from '../firebase/reports'

export default function Layout() {
  const member = getMember()
  const navigate = useNavigate()
  const [unresolvedCount, setUnresolvedCount] = useState(0)

  useEffect(() => {
    getAllReportsWithIssues()
      .then((reports) => {
        const count = reports.filter((r) =>
          r.items?.some((it) => it.group === '이슈사항' && it.label === '미해결' && it.content?.trim())
        ).length
        setUnresolvedCount(count)
      })
      .catch(() => {})
  }, [])

  function handleLogout() {
    clearMember()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'font-semibold underline' : 'opacity-80 hover:opacity-100'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight">주간보고</span>
            <nav className="flex gap-4 text-sm">
              <NavLink to="/dashboard" className={linkClass}>전체 현황</NavLink>
              <NavLink to="/write" className={linkClass}>보고서 작성</NavLink>
              <NavLink to="/history" className={linkClass}>이력 조회</NavLink>
              <NavLink to="/issues" className={linkClass}>
                이슈 현황
                {unresolvedCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {unresolvedCount}
                  </span>
                )}
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-80">{member}</span>
            <NavLink
              to="/members"
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs"
            >
              팀원관리
            </NavLink>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs"
            >
              나가기
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
