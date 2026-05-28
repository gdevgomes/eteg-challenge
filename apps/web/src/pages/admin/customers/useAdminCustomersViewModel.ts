import { useState, useEffect, useCallback } from 'react'
import { getCustomers, type Customer } from '../../../services/api'

interface Meta {
  total: number
  page: number
  loading: boolean
  error: string | null
}

const LIMIT = 10

export function useAdminCustomersViewModel() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, loading: true, error: null })

  const fetchPage = useCallback(async (page: number) => {
    setMeta((m) => ({ ...m, page, loading: true, error: null }))
    try {
      const res = await getCustomers(page, LIMIT)
      setCustomers(res.data)
      setSelected(null)
      setMeta({ total: res.total, page, loading: false, error: null })
    } catch {
      setMeta((m) => ({ ...m, loading: false, error: 'Falha ao carregar clientes' }))
    }
  }, [])

  useEffect(() => {
    void fetchPage(1)
  }, [fetchPage])

  const totalPages = Math.max(1, Math.ceil(meta.total / LIMIT))

  return {
    customers,
    selected,
    onSelectCustomer: setSelected,
    meta,
    totalPages,
    onPrevPage: () => { if (meta.page > 1) void fetchPage(meta.page - 1) },
    onNextPage: () => { if (meta.page < totalPages) void fetchPage(meta.page + 1) },
  }
}
