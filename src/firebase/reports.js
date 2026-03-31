import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { dateToId, getMonday } from '../utils/weeks'

const COL = 'reports'

// 문서 ID: {weekStart}_{memberName} (예: 2025-03-31_김민준)
function makeId(weekStart, member) {
  return `${dateToId(weekStart)}_${member}`
}

// 보고서 저장 (작성 중 / 제출)
export async function saveReport({ member, weekStart, items, status = 'draft' }) {
  const id = makeId(weekStart, member)
  await setDoc(doc(db, COL, id), {
    id,
    member,
    weekStart: dateToId(weekStart),
    items,
    status, // 'draft' | 'submitted'
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return id
}

// 특정 보고서 조회
export async function getReport(member, weekStart) {
  const id = makeId(weekStart, member)
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? snap.data() : null
}

// ID로 보고서 조회
export async function getReportById(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? snap.data() : null
}

// 특정 주의 전체 팀원 보고서 조회
export async function getWeekReports(weekStart) {
  const q = query(
    collection(db, COL),
    where('weekStart', '==', dateToId(weekStart)),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data()).sort((a, b) => a.member.localeCompare(b.member))
}

// 특정 팀원의 전체 이력 조회
export async function getMemberHistory(member) {
  const q = query(
    collection(db, COL),
    where('member', '==', member),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data()).sort((a, b) => b.weekStart.localeCompare(a.weekStart))
}

// 이번 주 내 보고서 조회
export async function getMyThisWeekReport(member) {
  const monday = getMonday()
  return getReport(member, monday)
}
