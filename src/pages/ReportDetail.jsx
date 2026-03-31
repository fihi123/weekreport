import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReportById } from '../firebase/reports'
import { getWeekLabel } from '../utils/weeks'
import { getMember } from '../utils/member'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = getMember()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReportById(id).then((data) => {
      setReport(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>
  if (!report) return <div className="text-center py-20 text-gray-400">보고서를 찾을 수 없습니다</div>

  const isMe = report.member === me
  const isMine = isMe

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← 뒤로
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{report.member}님의 주간보고</h2>
          <p className="text-sm text-gray-500 mt-1">{getWeekLabel(report.weekStart)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              report.status === 'submitted'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {report.status === 'submitted' ? '제출완료' : '임시저장'}
          </span>
          {isMine && (
            <button
              onClick={() => navigate(`/write/${id}`)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              수정하기
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {report.items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-600 mb-2">{item.label}</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {item.content || <span className="text-gray-300">내용 없음</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
