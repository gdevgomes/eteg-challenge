import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  lookupCustomer,
  createCustomer,
  updateCustomer,
  getColors,
  ApiError,
  type Color,
} from '../../services/api'

const schema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
  fullName: z.string().optional(),
  email: z.string().refine(
    (v) => !v || v.includes('*') || z.string().email().safeParse(v).success,
    { message: 'E-mail inválido' },
  ).optional(),
  colorId: z.string().uuid('Selecione uma cor'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>
type Mode = 'create' | 'edit'

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function maskPart(value: string): string {
  if (value.length <= 2) return value
  return value.slice(0, 2) + '*'.repeat(value.length - 2)
}

export function maskName(name: string): string {
  return name.trim().split(' ').map(maskPart).join(' ')
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const [host, ...ext] = domain.split('.')
  return `${maskPart(local)}@${maskPart(host)}.${ext.join('.')}`
}

export function useRegisterViewModel() {
  const [mode, setMode] = useState<Mode>('create')
  const [success, setSuccess] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [cpfVerified, setCpfVerified] = useState(false)
  const [maskedInfo, setMaskedInfo] = useState<{ name: string; email: string } | null>(null)
  const [colors, setColors] = useState<Color[]>([])
  const cpfInputRef = useRef<HTMLInputElement>(null)
  const originalData = useRef<{ fullName: string; email: string } | null>(null)

  useEffect(() => {
    getColors().then(setColors).catch(() => null)
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: '', fullName: '', email: '', colorId: '', notes: '' },
  })

  async function onCpfChange(value: string) {
    const masked = maskCpf(value)
    form.setValue('cpf', masked, { shouldValidate: form.formState.isSubmitted })

    if (masked.length !== 14) {
      setCpfVerified(false)
      return
    }

    setLookupLoading(true)
    setCpfVerified(false)
    try {
      const customer = await lookupCustomer({ cpf: masked })
      const maskedName = maskName(customer.fullName)
      const maskedEmail = maskEmail(customer.email)
      setMode('edit')
      setMaskedInfo({ name: maskedName, email: maskedEmail })
      originalData.current = { fullName: customer.fullName, email: customer.email }
      form.setValue('fullName', maskedName)
      form.setValue('email', maskedEmail)
      form.setValue('colorId', customer.color.id)
      form.setValue('notes', customer.notes ?? '')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMode('create')
        setMaskedInfo(null)
        originalData.current = null
        form.setValue('fullName', '')
        form.setValue('email', '')
        form.setValue('colorId', '')
        form.setValue('notes', '')
      }
    } finally {
      setLookupLoading(false)
      setCpfVerified(true)
      cpfInputRef.current?.blur()
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    const orig = originalData.current
    const fullName = !data.fullName || data.fullName === maskedInfo?.name ? orig?.fullName ?? '' : data.fullName
    const email = !data.email || data.email === maskedInfo?.email ? orig?.email ?? '' : data.email

    if (!fullName || !email) {
      form.setError('root', { message: 'Nome e e-mail são obrigatórios.' })
      return
    }

    try {
      const payload = { ...data, fullName, email }
      if (mode === 'create') {
        await createCustomer(payload)
      } else {
        await updateCustomer(payload)
      }
      setSuccess(true)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar. Tente novamente.'
      form.setError('root', { message })
    }
  })

  function onReset() {
    form.reset()
    setMode('create')
    setSuccess(false)
    setCpfVerified(false)
    setMaskedInfo(null)
    originalData.current = null
  }

  return {
    form,
    mode,
    success,
    colors,
    lookupLoading,
    cpfVerified,
    maskedInfo,
    cpfInputRef,
    onCpfChange,
    onSubmit,
    onReset,
  }
}
