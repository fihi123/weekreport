import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MembersProvider } from './context/MembersContext'
import SelectMember from './pages/SelectMember'
import Dashboard from './pages/Dashboard'
import Write from './pages/Write'
import History from './pages/History'
import Issues from './pages/Issues'
import ManageMembers from './pages/ManageMembers'
import ReportDetail from './pages/ReportDetail'
import Layout from './components/Layout'
import { getMember } from './utils/member'

function PrivateRoute({ children }) {
  return getMember() ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <MembersProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SelectMember />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/write" element={<PrivateRoute><Write /></PrivateRoute>} />
            <Route path="/write/:id" element={<PrivateRoute><Write /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/issues" element={<PrivateRoute><Issues /></PrivateRoute>} />
            <Route path="/members" element={<PrivateRoute><ManageMembers /></PrivateRoute>} />
            <Route path="/report/:id" element={<PrivateRoute><ReportDetail /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MembersProvider>
  )
}
