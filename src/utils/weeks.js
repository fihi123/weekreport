// 날짜로 해당 주의 월요일 반환
export function getMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// 주간 레이블 (예: 2025년 14주차 (03/31~04/06))
export function getWeekLabel(mondayDate) {
  const monday = new Date(mondayDate)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const year = monday.getFullYear()
  const weekNum = getWeekNumber(monday)

  const fmt = (d) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`

  return `${year}년 ${weekNum}주차 (${fmt(monday)}~${fmt(sunday)})`
}

// ISO 주차 계산
export function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  )
}

// mondayDate를 문서 ID로 사용할 문자열로 변환 (YYYY-MM-DD)
export function dateToId(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// 최근 N주 목록 반환
export function getRecentWeeks(n = 12) {
  const weeks = []
  const monday = getMonday()
  for (let i = 0; i < n; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() - i * 7)
    weeks.push(d)
  }
  return weeks
}
