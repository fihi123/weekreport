const KEY = 'weekreport_member'

export const MEMBERS = ['팀장', '김민준', '이서연', '박지호', '최유진', '정다은', '한승우']

export function getMember() {
  return localStorage.getItem(KEY)
}

export function setMember(name) {
  localStorage.setItem(KEY, name)
}

export function clearMember() {
  localStorage.removeItem(KEY)
}
