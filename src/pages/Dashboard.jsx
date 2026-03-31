import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMonday, getWeekLabel, getRecentWeeks, dateToId } from '../utils/weeks'
import { getWeekReports } from '../firebase/reports'
import { MEMBERS, getMember } from '../utils/member'

const STATUS_LABEL = {
  submitted: { text: '제출완료', cls: 'bg-green-100 text-green-700' },
  draft: { text: '임시저장', cls: 'bg-yellow-100 text-yellow-700' },
  none: { text: '미제출', cls: 'bg-gray-100 text-gray-400' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const me = getMember()
  const weeks = getRecentWeeks(8)
  const [selectedWeek, setSelectedWeek] = useState(weeks[0])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getWeekReports(selectedWeek).then((data) => {
      setReports(data)
      setLoading(false)
    })
  }, [selectedWeek])

  const reportMap = Object.fromEntries(reports.map((r) => [r.member, r]))
  const submittedCount = reports.filter((r) => r.status === 'submitted').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">전체 현황</h2>
        <button
          onClick={() => navigate('/write')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          내 보고서 작성
        </button>
      </div>

      {/* 주차 선택 */}
      <div className="flex gap-2 flex-wrap mb-6">
        {weeks.map((w) => {
          const id = dateToId(w)
          const isSelected = dateToId(selectedWeek) === id
          return (
            <button
              key={id}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {getWeekLabel(w).split(' ').slice(0, 3).join(' ')}
            </button>
          )
        })}
      </div>

      {/* 요약 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <p className="text-sm text-gray-500 mb-1">{getWeekLabel(selectedWeek)}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-blue-600">{submittedCount}</span>
          <span className="text-gray-500 text-sm mb-1">/ {MEMBERS.length}명 제출</span>
        </div>
        <div className="mt-3 bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(submittedCount / MEMBERS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 팀원 목록 */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">불러오는 중...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {MEMBERS.map((name) => {
            const report = reportMap[name]
            const statusKey = report?.status || 'none'
            const { text, cls } = STATUS_LABEL[statusKey]
            const isMe = name === me

            return (
              <div
                key={name}
                onClick={() => report && navigate(`/report/${report.id}`)}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between transition-all ${
                  report ? 'cursor-pointer hover:border-blue-300' : 'opacity-60'
                } ${isMe ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{name}</span>
                    {isMe && <span className="ml-2 text-xs text-blue-500">나</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{text}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
