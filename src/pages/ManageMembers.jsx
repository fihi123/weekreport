import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMembers } from '../context/MembersContext'
import { saveMembers, ROLE_LABEL } from '../firebase/members'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

export default function ManageMembers() {
  const navigate = useNavigate()
  const { members, refresh } = useMembers()
  const [list, setList] = useState(members.map((m) => ({ ...m })))
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('reporter')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    if (list.some((m) => m.name === name)) {
      setToast({ message: '이미 존재하는 이름입니다', type: 'error' })
      return
    }
    setList([...list, { name, role: newRole }])
    setNewName('')
  }

  function handleRemove(name) {
    setList(list.filter((m) => m.name !== name))
    setDeleteTarget(null)
  }

  function toggleRole(index) {
    setList(list.map((m, i) =>
      i === index ? { ...m, role: m.role === 'admin' ? 'reporter' : 'admin' } : m
    ))
  }

  function handleMoveUp(i) {
    if (i === 0) return
    const next = [...list]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setList(next)
  }

  function handleMoveDown(i) {
    if (i === list.length - 1) return
    const next = [...list]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setList(next)
  }

  async function handleSave() {
    if (list.length === 0) {
      setToast({ message: '최소 1명의 팀원이 필요합니다', type: 'error' })
      return
    }
    setSaving(true)
    try {
      await saveMembers(list)
      await refresh()
      setToast({ message: '팀원 목록이 저장되었습니다', type: 'success' })
    } catch {
      setToast({ message: '저장 중 오류가 발생했습니다', type: 'error' })
    }
    setSaving(false)
  }

  const hasChanges = JSON.stringify(list) !== JSON.stringify(members)

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← 뒤로
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-6">팀원 관리</h2>

      {/* 추가 */}
      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="팀원 이름 입력"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="reporter">보고자</option>
          <option value="admin">관리자</option>
        </select>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          추가
        </button>
      </div>

      {/* 목록 */}
      <div className="flex flex-col gap-2 mb-6">
        {list.map((m, i) => (
          <div key={m.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {m.name[0]}
              </div>
              <span className="font-medium text-gray-800 text-sm">{m.name}</span>
              <button
                onClick={() => toggleRole(i)}
                className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                  m.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                {ROLE_LABEL[m.role]}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleMoveUp(i)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs">▲</button>
              <button onClick={() => handleMoveDown(i)} disabled={i === list.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs">▼</button>
              <button
                onClick={() => setDeleteTarget(m.name)}
                className="ml-2 p-1 text-red-400 hover:text-red-600 text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">팀원이 없습니다. 위에서 추가해주세요.</p>
        )}
      </div>

      {/* 저장 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="팀원 삭제"
          message={`'${deleteTarget}'을(를) 목록에서 제거하시겠습니까?`}
          confirmText="삭제"
          onConfirm={() => handleRemove(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
