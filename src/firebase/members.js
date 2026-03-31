import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'

const DOC_ID = 'team'
const COL = 'settings'

const DEFAULT_MEMBERS = ['팀장', '김민준', '이서연', '박지호', '최유진', '정다은', '한승우']

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
