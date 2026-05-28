import { useAdminLoginViewModel } from './useAdminLoginViewModel'
import './admin-login.css'

export default function AdminLoginPage() {
  const { form, onSubmit, isSubmitting, rootError, showPassword, onTogglePassword } = useAdminLoginViewModel()
  const { register, formState: { errors } } = form

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={onSubmit} noValidate>
        <div className="loginCardHeader">
          <p className="loginCardOverline">{"Área restrita"}</p>
          <h1 className="loginCardTitle">{"Entrar"}</h1>
        </div>

        <div className="field">
          <label className="fieldLabel" htmlFor="username">{"Usuário"}</label>
          <input
            id="username"
            className={`fieldInput ${errors.username ? 'fieldInputError' : ''}`}
            type="text"
            autoCapitalize="none"
            autoComplete="username"
            {...register('username')}
          />
          {errors.username && <span className="fieldError">{errors.username.message}</span>}
        </div>

        <div className="field">
          <label className="fieldLabel" htmlFor="password">{"Senha"}</label>
          <div className="fieldInputWrapper">
            <input
              id="password"
              className={`fieldInput fieldInputIcon ${errors.password ? 'fieldInputError' : ''}`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
            />
            <button type="button" className="fieldEye" onClick={onTogglePassword} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <span className="fieldError">{errors.password.message}</span>}
        </div>

        {rootError && <p className="loginCardRootError">{rootError}</p>}

        <button className="btnPrimary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
