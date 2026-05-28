import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { ApiError } from '../../services/api'

const schema = z.object({
  username: z.string().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
})

type FormData = z.infer<typeof schema>

export function useAdminLoginViewModel() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  if (isAuthenticated) {
    navigate('/admin/customers', { replace: true })
  }

  async function onSubmit(data: FormData) {
    try {
      await login(data)
      navigate('/admin/customers', { replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao autenticar'
      form.setError('root', { message })
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    rootError: form.formState.errors.root?.message,
    showPassword,
    onTogglePassword: () => setShowPassword((v) => !v),
  }
}
