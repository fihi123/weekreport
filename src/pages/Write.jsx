import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMember } from '../utils/member'
import { getMonday, getWeekLabel } from '../utils/weeks'
import { saveReport, getReport, getReportById } from '../firebase/reports'

const DEFAULT_ITEMS = [
  { label: '이번 주 완료 업무', content: '', group: null },
  { label: '다음 주 계획', content: '', group: null },
  { label: '해결', content: '', group: '이슈사항' },
  { label: '미해결', content: '', group: '이슈사항' },
]

export default function Write() {
  const { id } = useParams()
  const navigate = useNavigate()
  const member = getMember()
  const [weekStart] = useState(getMonday())
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingReport, setExistingReport] = useState(null)

  useEffect(() => {
    async function load() {
      let report = null
      if (id) {
        report = await getReportById(id)
      } else {
        report = await getReport(member, weekStart)
      }
      if (report) {
        setExistingReport(report)
        // 기존 데이터에 group 필드 없으면 DEFAULT_ITEMS 기준으로 병합
        const merged = DEFAULT_ITEMS.map((def, i) => ({
          ...def,
          content: report.items[i]?.content ?? '',
        }))
        setItems(merged)
      }
      setLoading(false)
    }
    load()
  }, [id, member, weekStart])

  function updateItem(index, value) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, content: value } : item)))
  }

  async function handleSave(status) {
    setSaving(true)
    try {
      await saveReport({ member, weekStart, items, status })
      if (status === 'submitted') {
        navigate('/dashboard')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>

  const isSubmitted = existingReport?.status === 'submitted'
  const weekLabel = getWeekLabel(weekStart)

  // 이슈사항 그룹 인덱스
  const issueIndexes = items
    .map((item, i) => (item.group === '이슈사항' ? i : null))
    .filter((i) => i !== null)

  const rendered = new Set()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">보고서 작성</h2>
        <p className="text-sm text-gray-500 mt-1">{weekLabel} · {member}</p>
      </div>

      {isSubmitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          이미 제출된 보고서입니다. 수정 후 다시 제출할 수 있습니다.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {items.map((item, i) => {
          // 이슈사항 그룹 - 첫 번째 항목일 때만 카드 렌더링
          if (item.group === '이슈사항') {
            if (rendered.has('이슈사항')) return null
            rendered.add('이슈사항')
            return (
              <div key="issue-group" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">이슈사항</p>
                <div className="flex flex-col gap-4">
                  {issueIndexes.map((idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            items[idx].label === '해결'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {items[idx].label}
                        </span>
                      </div>
                      <textarea
                        value={items[idx].content}
                        onChange={(e) => updateItem(idx, e.target.value)}
                        rows={3}
                        placeholder={`${items[idx].label} 이슈를 입력하세요`}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          // 일반 항목
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{item.label}</label>
              <textarea
                value={item.content}
                onChange={(e) => updateItem(i, e.target.value)}
                rows={4}
                placeholder="내용을 입력하세요"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          임시저장
        </button>
        <button
          onClick={() => handleSave('submitted')}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40"
        >
          제출하기
        </button>
      </div>
    </div>
  )
}
