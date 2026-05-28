import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './pages/register'
import AdminLoginPage from './pages/admin'
import AdminCustomersPage from './pages/admin/customers'
import NotFoundPage from './pages/not-found'

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute>
                <AdminCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
