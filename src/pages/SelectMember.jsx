import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setMember, getMember } from '../utils/member'
import { useMembers } from '../context/MembersContext'
import { ROLE_LABEL, verifyAdminPassword } from '../firebase/members'
import Toast from '../components/Toast'

export default function SelectMember() {
  const navigate = useNavigate()
  const { members } = useMembers()
  const current = getMember()
  const [selected, setSelected] = useState(current || '')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function handleStart() {
    if (!selected) return

    const member = members.find((m) => m.name === selected)
    if (member?.role === 'admin') {
      setShowPassword(true)
      return
    }

    setMember(selected)
    navigate('/dashboard')
  }

  async function handleAdminLogin() {
    setLoading(true)
    try {
      const ok = await verifyAdminPassword(password)
      if (ok) {
        setMember(selected)
        navigate('/dashboard')
      } else {
        setToast({ message: '비밀번호가 틀렸습니다', type: 'error' })
        setPassword('')
      }
    } catch {
      setToast({ message: '인증 중 오류가 발생했습니다', type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">주간보고</h1>
        <p className="text-gray-500 text-sm text-center mb-8">팀원을 선택해 주세요</p>

        {!showPassword ? (
          <>
            <div className="flex flex-col gap-2 mb-8">
              {members.map(({ name, role }) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`py-3 px-4 rounded-lg border-2 text-left font-medium transition-all flex items-center justify-between ${
                    selected === name
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {ROLE_LABEL[role]}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              disabled={!selected}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              시작하기
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  {selected[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selected}</p>
                  <p className="text-xs text-purple-600">관리자 인증</p>
                </div>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="비밀번호를 입력하세요"
                autoFocus
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowPassword(false); setPassword('') }}
                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                뒤로
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={loading || !password}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-40 hover:bg-purple-700 transition-colors"
              >
                {loading ? '확인 중...' : '로그인'}
              </button>
            </div>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
