import { useState, useRef, useEffect } from 'react'
import type { Color } from '../../services/api'

interface SelectProps {
  colors: Color[]
  value: string
  onChange: (id: string) => void
  error?: boolean
}

export function Select({ colors, value, onChange, error }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = colors.find((c) => c.id === value) ?? null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function onSelect(id: string) {
    onChange(id)
    setOpen(false)
  }

  return (
    <div className="colorSelect" ref={ref}>
      <button
        type="button"
        className={`colorSelectTrigger fieldInput ${error ? 'fieldInputError' : ''} ${open ? 'colorSelectTriggerOpen' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {selected ? (
          <span className="colorSelectOption">
            <span className="colorSelectDot" style={{ background: selected.hex }} />
            <span className="colorSelectLabel" style={{ color: selected.hex }}>{selected.name}</span>
          </span>
        ) : (
          <span className="colorSelectPlaceholder">{"Selecione uma cor"}</span>
        )}
        <svg
          className={`colorSelectChevron ${open ? 'colorSelectChevronUp' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="colorSelectDropdown">
          {colors.map((c) => (
            <li
              key={c.id}
              className={`colorSelectItem ${c.id === value ? 'colorSelectItemSelected' : ''}`}
              onClick={() => onSelect(c.id)}
            >
              <span className="colorSelectDot" style={{ background: c.hex }} />
              <span className="colorSelectLabel" style={{ color: c.hex }}>{c.name}</span>
              {c.id === value && <span className="colorSelectCheck">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
