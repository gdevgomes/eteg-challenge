import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notFound">
      <span className="notFoundCode">{"404"}</span>
      <p className="notFoundMessage">{"Página não encontrada"}</p>
      <Link to="/" className="notFoundLink">{"Voltar ao início"}</Link>
    </div>
  )
}
