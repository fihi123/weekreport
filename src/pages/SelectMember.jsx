import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setMember, getMember } from '../utils/member'
import { useMembers } from '../context/MembersContext'

export default function SelectMember() {
  const navigate = useNavigate()
  const { members } = useMembers()
  const current = getMember()
  const [selected, setSelected] = useState(current || '')

  function handleStart() {
    if (!selected) return
    setMember(selected)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">주간보고</h1>
        <p className="text-gray-500 text-sm text-center mb-8">팀원을 선택해 주세요</p>

        <div className="flex flex-col gap-2 mb-8">
          {members.map((name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`py-3 px-4 rounded-lg border-2 text-left font-medium transition-all ${
                selected === name
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              {name}
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
      </div>
    </div>
  )
}
