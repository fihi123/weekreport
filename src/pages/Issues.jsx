import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllReportsWithIssues } from '../firebase/reports'
import { getWeekLabel } from '../utils/weeks'
import { useMembers } from '../context/MembersContext'

const TABS = ['미해결', '해결']

export default function Issues() {
  const navigate = useNavigate()
  const { members: MEMBERS } = useMembers()
  const [tab, setTab] = useState('미해결')
  const [allIssues, setAllIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [memberFilter, setMemberFilter] = useState('전체')

  useEffect(() => {
    getAllReportsWithIssues()
      .then((data) => { setAllIssues(data); setLoading(false) })
      .catch(() => { setError('이슈를 불러오는 중 오류가 발생했습니다.'); setLoading(false) })
  }, [])

  const filtered = allIssues
    .flatMap((report) => {
      const issueItem = report.items.find((it) => it.group === '이슈사항' && it.label === tab)
      if (!issueItem || !issueItem.content.trim()) return []
      return [{
        reportId: report.id,
        member: report.member,
        weekStart: report.weekStart,
        content: issueItem.content.trim(),
      }]
    })
    .filter((issue) => memberFilter === '전체' || issue.member === memberFilter)

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-5">이슈 현황</h2>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              tab === t
                ? t === '미해결'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t}
            {!loading && (
              <span className="ml-1.5 text-xs opacity-80">
                ({allIssues.flatMap((r) => {
                  const item = r.items.find((it) => it.group === '이슈사항' && it.label === t)
                  return item?.content?.trim() ? [1] : []
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {['전체', ...MEMBERS].map((name) => (
          <button
            key={name}
            onClick={() => setMemberFilter(name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              memberFilter === name
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
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">{tab === '미해결' ? '✅' : '📋'}</p>
          <p>{tab === '미해결' ? '미해결 이슈가 없습니다' : '해결된 이슈가 없습니다'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((issue, i) => (
            <div
              key={i}
              onClick={() => navigate(`/report/${issue.reportId}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {issue.member[0]}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{issue.member}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      tab === '해결' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {tab}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{getWeekLabel(issue.weekStart)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {issue.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
