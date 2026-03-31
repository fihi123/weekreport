import * as XLSX from 'xlsx'

// 특정 주 전체 보고서를 엑셀로 다운로드
export function exportWeekToExcel(reports, weekLabel, members) {
  const rows = []

  members.forEach((name) => {
    const report = reports.find((r) => r.member === name)
    const row = { '팀원': name, '상태': '미제출' }

    if (report) {
      row['상태'] = report.status === 'submitted' ? '제출완료' : '임시저장'
      report.items.forEach((item) => {
        const label = item.group ? `이슈사항 - ${item.label}` : item.label
        row[label] = item.content || ''
      })
    }

    rows.push(row)
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // 열 너비
  ws['!cols'] = [
    { wch: 10 }, // 팀원
    { wch: 10 }, // 상태
    { wch: 40 }, // 이번 주 완료 업무
    { wch: 40 }, // 다음 주 계획
    { wch: 30 }, // 이슈사항 - 해결
    { wch: 30 }, // 이슈사항 - 미해결
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '주간보고')

  const fileName = `주간보고_${weekLabel.replace(/[\/\(\)~\s]/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
