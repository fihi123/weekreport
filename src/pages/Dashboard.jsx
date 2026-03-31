import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMonday, getWeekLabel, getRecentWeeks, dateToId } from '../utils/weeks'
import { getWeekReports } from '../firebase/reports'
import { getMember } from '../utils/member'
import { useMembers } from '../context/MembersContext'
import { ROLE_LABEL } from '../firebase/members'
import { exportWeekToExcel } from '../utils/exportExcel'

const STATUS_LABEL = {
  submitted: { text: '제출완료', cls: 'bg-green-100 text-green-700' },
  draft: { text: '임시저장', cls: 'bg-yellow-100 text-yellow-700' },
  none: { text: '미제출', cls: 'bg-gray-100 text-gray-400' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const me = getMember()
  const { names, getRole } = useMembers()
  const weeks = getRecentWeeks(8)
  const [selectedWeek, setSelectedWeek] = useState(weeks[0])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getWeekReports(selectedWeek)
      .then((data) => { setReports(data); setLoading(false) })
      .catch(() => { setError('보고서를 불러오는 중 오류가 발생했습니다.'); setLoading(false) })
  }, [selectedWeek])

  const reportMap = Object.fromEntries(reports.map((r) => [r.member, r]))
  const reporterNames = names.filter((n) => getRole(n) === 'reporter')
  const submittedCount = reporterNames.filter((n) => reportMap[n]?.status === 'submitted').length

  const isCurrentWeek = dateToId(selectedWeek) === dateToId(weeks[0])
  const myRole = getRole(me)
  const myReport = reportMap[me]
  const myStatus = myReport?.status

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">전체 현황</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportWeekToExcel(reports, getWeekLabel(selectedWeek), names)}
            disabled={loading || reports.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            엑셀 다운로드
          </button>
          {myRole === 'reporter' && (
            <button
              onClick={() => navigate('/write')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              내 보고서 작성
            </button>
          )}
        </div>
      </div>

      {/* 내 제출 상태 배너 (보고자만) */}
      {isCurrentWeek && !loading && myRole === 'reporter' && (
        <div
          className={`mb-5 p-3 rounded-lg text-sm flex items-center justify-between ${
            myStatus === 'submitted'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : myStatus === 'draft'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}
        >
          <span>
            {myStatus === 'submitted'
              ? '이번 주 보고서를 제출했습니다.'
              : myStatus === 'draft'
              ? '이번 주 보고서가 임시저장 상태입니다.'
              : '이번 주 보고서를 아직 작성하지 않았습니다.'}
          </span>
          {myStatus !== 'submitted' && (
            <button onClick={() => navigate('/write')} className="font-semibold underline ml-3 whitespace-nowrap">
              작성하기
            </button>
          )}
        </div>
      )}

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
          <span className="text-gray-500 text-sm mb-1">/ {reporterNames.length}명 제출</span>
        </div>
        <div className="mt-3 bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${reporterNames.length > 0 ? (submittedCount / reporterNames.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 팀원 목록 */}
      {error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">
            새로고침
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-10 text-gray-400">불러오는 중...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {names.map((name) => {
            const report = reportMap[name]
            const role = getRole(name)
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
                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm ${
                    role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {name[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {ROLE_LABEL[role]}
                    </span>
                    {isMe && <span className="text-xs text-blue-500">나</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report?.updatedAt && (
                    <span className="text-xs text-gray-400">
                      {report.updatedAt.toDate ? report.updatedAt.toDate().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  )}
                  {role === 'reporter' && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{text}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
