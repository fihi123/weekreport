import { createContext, useContext, useState, useEffect } from 'react'
import { getMembers } from '../firebase/members'

const MembersContext = createContext({ members: [], names: [], getRole: () => 'reporter', refresh: () => {} })

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const list = await getMembers()
      setMembers(list)
    } catch {
      setMembers([
        { name: '백승현', role: 'admin' },
        { name: '윤성현', role: 'reporter' },
      ])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const names = members.map((m) => m.name)

  function getRole(name) {
    return members.find((m) => m.name === name)?.role || 'reporter'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>
    )
  }

  return (
    <MembersContext.Provider value={{ members, names, getRole, refresh: load }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  return useContext(MembersContext)
}
