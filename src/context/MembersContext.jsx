import { createContext, useContext, useState, useEffect } from 'react'
import { getMembers } from '../firebase/members'

const MembersContext = createContext([])

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const list = await getMembers()
      setMembers(list)
    } catch {
      // fallback
      setMembers(['팀장', '김민준', '이서연', '박지호', '최유진', '정다은', '한승우'])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function refresh() { load() }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>
    )
  }

  return (
    <MembersContext.Provider value={{ members, refresh }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  return useContext(MembersContext)
}
