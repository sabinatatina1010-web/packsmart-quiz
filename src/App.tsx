import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QuizShell } from '@/components/quiz/QuizShell'
import { AdminPage } from '@/pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizShell />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
