import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'

const DOC_ID = 'team'
const COL = 'settings'

// role: 'admin' (관리자) | 'reporter' (보고자)
const DEFAULT_MEMBERS = [
  { name: '백승현', role: 'admin' },
  { name: '윤성현', role: 'reporter' },
]

export const ROLE_LABEL = {
  admin: '관리자',
  reporter: '보고자',
}

// 팀원 목록 조회 (없으면 기본값 저장 후 반환)
export async function getMembers() {
  const snap = await getDoc(doc(db, COL, DOC_ID))
  if (snap.exists()) {
    return snap.data().members
  }
  await setDoc(doc(db, COL, DOC_ID), { members: DEFAULT_MEMBERS })
  return DEFAULT_MEMBERS
}

// 팀원 목록 저장
export async function saveMembers(members) {
  await setDoc(doc(db, COL, DOC_ID), { members })
}
