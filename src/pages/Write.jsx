import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMember } from '../utils/member'
import { getMonday, getWeekLabel, dateToId } from '../utils/weeks'
import { saveReport, getReport, getReportById } from '../firebase/reports'

const DEFAULT_ITEMS = [
  { label: '이번 주 완료 업무', content: '' },
  { label: '다음 주 계획', content: '' },
  { label: '이슈 / 건의사항', content: '' },
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
        setItems(report.items)
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
        {items.map((item, i) => (
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
        ))}
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
