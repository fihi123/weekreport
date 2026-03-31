import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SelectMember from './pages/SelectMember'
import Dashboard from './pages/Dashboard'
import Write from './pages/Write'
import History from './pages/History'
import ReportDetail from './pages/ReportDetail'
import Layout from './components/Layout'
import { getMember } from './utils/member'

function PrivateRoute({ children }) {
  return getMember() ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectMember />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/write" element={<PrivateRoute><Write /></PrivateRoute>} />
          <Route path="/write/:id" element={<PrivateRoute><Write /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/report/:id" element={<PrivateRoute><ReportDetail /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
