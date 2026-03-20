// src/components/TimeInput.tsx

interface Props {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

export function TimeInput({ hour, minute, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 24 }}>
      <select value={hour} onChange={(e) => onChange(Number(e.target.value), minute)}>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
        ))}
      </select>
      <span>:</span>
      <select value={minute} onChange={(e) => onChange(hour, Number(e.target.value))}>
        {[0, 10, 20, 30, 40, 50].map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  )
}
