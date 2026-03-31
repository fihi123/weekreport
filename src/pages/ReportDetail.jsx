import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReportById, deleteReport } from '../firebase/reports'
import { getWeekLabel } from '../utils/weeks'
import { getMember } from '../utils/member'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = getMember()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getReportById(id)
      .then((data) => { setReport(data); setLoading(false) })
      .catch(() => { setError('보고서를 불러오는 중 오류가 발생했습니다.'); setLoading(false) })
  }, [id])

  async function handleDelete() {
    setShowDeleteConfirm(false)
    try {
      await deleteReport(id)
      navigate('/history', { replace: true })
    } catch {
      setToast({ message: '삭제 중 오류가 발생했습니다', type: 'error' })
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-3">{error}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">뒤로</button>
    </div>
  )
  if (!report) return <div className="text-center py-20 text-gray-400">보고서를 찾을 수 없습니다</div>

  const isMine = report.member === me

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
          <p className="text-sm text-gray-500 mt-1">
            {getWeekLabel(report.weekStart)}
            {report.updatedAt?.toDate && (
              <span className="ml-2 text-gray-400">
                · {report.updatedAt.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <>
              <button
                onClick={() => navigate(`/write/${id}`)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {(() => {
          const rendered = new Set()
          return report.items.map((item, i) => {
            if (item.group === '이슈사항') {
              if (rendered.has('이슈사항')) return null
              rendered.add('이슈사항')
              const issueItems = report.items.filter((it) => it.group === '이슈사항')
              return (
                <div key="issue-group" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm font-semibold text-gray-600 mb-4">이슈사항</p>
                  <div className="flex flex-col gap-4">
                    {issueItems.map((issue, j) => (
                      <div key={j}>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            issue.label === '해결'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {issue.label}
                        </span>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mt-2">
                          {issue.content || <span className="text-gray-300">내용 없음</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-600 mb-2">{item.label}</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {item.content || <span className="text-gray-300">내용 없음</span>}
                </p>
              </div>
            )
          })
        })()}
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="보고서 삭제"
          message="이 보고서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
          confirmText="삭제"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          danger
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
