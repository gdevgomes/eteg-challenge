import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      {isAuthenticated && (
        <header className="topbar">
          <Link to="/" className="topbarBrand">
            <img src="/logo.png" alt="eteg. technology" />
          </Link>
          <nav className="topbarNav">
            <Link to="/admin/customers" className="topbarLink">{"Área do Admin"}</Link>
            <button className="topbarLogout" onClick={logout}>{"Sair"}</button>
          </nav>
        </header>
      )}
      <main>{children}</main>
    </>
  )
}
