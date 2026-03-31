import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getMember, clearMember } from '../utils/member'

export default function Layout() {
  const member = getMember()
  const navigate = useNavigate()

  function handleLogout() {
    clearMember()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight">주간보고</span>
            <nav className="flex gap-4 text-sm">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? 'font-semibold underline' : 'opacity-80 hover:opacity-100'
                }
              >
                전체 현황
              </NavLink>
              <NavLink
                to="/write"
                className={({ isActive }) =>
                  isActive ? 'font-semibold underline' : 'opacity-80 hover:opacity-100'
                }
              >
                보고서 작성
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive ? 'font-semibold underline' : 'opacity-80 hover:opacity-100'
                }
              >
                이력 조회
              </NavLink>
              <NavLink
                to="/issues"
                className={({ isActive }) =>
                  isActive ? 'font-semibold underline' : 'opacity-80 hover:opacity-100'
                }
              >
                이슈 현황
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-80">{member}</span>
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
