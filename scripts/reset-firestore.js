// Firestore 데이터 초기화 스크립트
// 사용법: node scripts/reset-firestore.js

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAsS1hMewVIwDKpGZXvfL6VVViXf3rW3M4",
  authDomain: "weekreport-ee284.firebaseapp.com",
  projectId: "weekreport-ee284",
  storageBucket: "weekreport-ee284.firebasestorage.app",
  messagingSenderId: "891734117733",
  appId: "1:891734117733:web:f5e0f0b5110a6a724be58c",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function deleteCollection(colName) {
  const snap = await getDocs(collection(db, colName))
  let count = 0
  for (const d of snap.docs) {
    await deleteDoc(doc(db, colName, d.id))
    count++
  }
  console.log(`  ${colName}: ${count}건 삭제`)
}

async function main() {
  console.log('Firestore 초기화 시작...\n')

  // 기존 데이터 삭제
  await deleteCollection('reports')
  await deleteCollection('settings')

  // 새 팀원 목록 저장
  const members = [
    { name: '백승현', role: 'admin' },
    { name: '윤성현', role: 'reporter' },
  ]
  await setDoc(doc(db, 'settings', 'team'), { members })
  console.log('\n  새 팀원 목록 저장 완료:', members.map(m => `${m.name}(${m.role})`).join(', '))

  console.log('\n초기화 완료!')
  process.exit(0)
}

main().catch((e) => {
  console.error('오류:', e.message)
  process.exit(1)
})
