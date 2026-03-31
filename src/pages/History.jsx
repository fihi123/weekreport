import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMember } from '../utils/member'
import { useMembers } from '../context/MembersContext'
import { getMemberHistory } from '../firebase/reports'
import { getWeekLabel } from '../utils/weeks'

const STATUS_LABEL = {
  submitted: { text: '제출완료', cls: 'bg-green-100 text-green-700' },
  draft: { text: '임시저장', cls: 'bg-yellow-100 text-yellow-700' },
}

export default function History() {
  const navigate = useNavigate()
  const me = getMember()
  const { names: MEMBERS } = useMembers()
  const [selectedMember, setSelectedMember] = useState(me)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getMemberHistory(selectedMember)
      .then((data) => { setReports(data); setLoading(false) })
      .catch(() => { setError('이력을 불러오는 중 오류가 발생했습니다.'); setLoading(false) })
  }, [selectedMember])

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">이력 조회</h2>

      <div className="flex gap-2 flex-wrap mb-6">
        {MEMBERS.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedMember(name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedMember === name
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">
            새로고침
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-10 text-gray-400">불러오는 중...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>작성된 보고서가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const { text, cls } = STATUS_LABEL[report.status] || STATUS_LABEL.draft
            return (
              <div
                key={report.id}
                onClick={() => navigate(`/report/${report.id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {getWeekLabel(report.weekStart)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{report.member}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{text}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
