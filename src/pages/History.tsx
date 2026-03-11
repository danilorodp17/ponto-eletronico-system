import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface TimeRecord { id: string; type: 'ENTRY' | 'EXIT'; timestamp: string }
interface DaySummary { date: string; records: TimeRecord[]; totalMinutes: number }

export default function History() {
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchHistory = useCallback(async (start?: string, end?: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (start) params.startDate = start
      if (end) params.endDate = end
      const { data } = await api.get('/time-records/history', { params })
      setRecords(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchHistory(startDate, endDate) }
  const handleClear = () => { setStartDate(''); setEndDate(''); fetchHistory() }

  const fmt = (ts: string) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const grouped: DaySummary[] = (() => {
    const map: Record<string, TimeRecord[]> = {}
    records.forEach(r => {
      const d = new Date(r.timestamp).toDateString()
      if (!map[d]) map[d] = []
      map[d].push(r)
    })
    return Object.entries(map).map(([date, recs]) => {
      const sorted = [...recs].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
      let total = 0
      for (let i = 0; i < sorted.length - 1; i += 2) {
        if (sorted[i].type === 'ENTRY' && sorted[i+1]?.type === 'EXIT')
          total += (+new Date(sorted[i+1].timestamp) - +new Date(sorted[i].timestamp)) / 60000
      }
      return { date, records: recs, totalMinutes: Math.round(total) }
    })
  })()

  const totalMin = grouped.reduce((s, d) => s + d.totalMinutes, 0)
  const daysWorked = grouped.filter(d => d.totalMinutes > 0).length

  return (
    <Layout>
      <style>{`
        .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }

        .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
        .sum-card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 12px; padding: 18px 20px; }
        .sum-label { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
        .sum-value { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #f1f5f9; }
        .sum-hint { font-size: 11px; color: #334155; margin-top: 4px; }

        .filter-card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 12px; padding: 18px 22px; margin-bottom: 22px; }
        .filter-title { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 14px; }
        .filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
        .filter-field label { display: block; font-size: 12px; color: #475569; font-weight: 500; margin-bottom: 6px; }
        input[type=date] {
          background: #111827; border: 1px solid #252d3d; border-radius: 9px;
          padding: 9px 13px; color: #e2e8f0; font-size: 13px;
          font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s;
        }
        input[type=date]:focus { border-color: #2563eb; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }

        .btn-f { padding: 9px 18px; border-radius: 9px; border: none; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s; }
        .btn-apply { background: #2563eb; color: #fff; }
        .btn-apply:hover { background: #1d4ed8; }
        .btn-clear { background: #111827; border: 1px solid #252d3d; color: #64748b; }
        .btn-clear:hover { color: #94a3b8; background: #1e2330; }

        .day-card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 12px; margin-bottom: 10px; overflow: hidden; transition: border-color 0.15s; }
        .day-card:hover { border-color: #252d3d; }
        .day-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; }
        .day-left { display: flex; align-items: center; gap: 14px; }
        .day-dots { display: flex; flex-direction: column; gap: 4px; }
        .day-dot { width: 5px; height: 5px; border-radius: 50%; }
        .day-date { font-size: 14px; font-weight: 600; color: #e2e8f0; text-transform: capitalize; }
        .day-count { font-size: 12px; color: #475569; margin-top: 2px; }
        .day-right { display: flex; align-items: center; gap: 20px; }
        .day-hours { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; }
        .day-chevron { color: #334155; font-size: 11px; transition: transform 0.2s; }
        .day-chevron.open { transform: rotate(180deg); }

        .day-body { padding: 0 20px 16px; display: flex; flex-direction: column; gap: 7px; }
        .rec-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 9px; }
        .rec-entry { background: #0d1f15; border: 1px solid #14532d; }
        .rec-exit { background: #1c0a0a; border: 1px solid #7f1d1d; }
        .rec-left { display: flex; align-items: center; gap: 9px; }
        .rec-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .rec-entry .rec-dot { background: #22c55e; }
        .rec-exit .rec-dot { background: #ef4444; }
        .rec-type { font-size: 13px; font-weight: 500; }
        .rec-entry .rec-type { color: #4ade80; }
        .rec-exit .rec-type { color: #fca5a5; }
        .rec-time { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #e2e8f0; }

        .empty-state { text-align: center; padding: 56px 20px; color: #334155; }
        .empty-icon { font-size: 32px; margin-bottom: 12px; }
        .empty-text { font-size: 14px; }

        .sk { background: linear-gradient(90deg, #111827 25%, #1e2330 50%, #111827 75%); background-size: 200%; animation: sk 1.4s infinite; border-radius: 10px; }
        @keyframes sk { from{background-position:200% 0} to{background-position:-200% 0} }

        @media(max-width:640px) { .summary-row { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="page-title">Histórico</div>
      <div className="page-sub">Visualize e filtre seus registros de ponto</div>

      {/* Summary */}
      <div className="summary-row">
        <div className="sum-card">
          <div className="sum-label">Dias com registros</div>
          <div className="sum-value">{loading ? '—' : grouped.length}</div>
          <div className="sum-hint">no período</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">Dias trabalhados</div>
          <div className="sum-value" style={{ color: '#60a5fa' }}>{loading ? '—' : daysWorked}</div>
          <div className="sum-hint">com horas computadas</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">Total de horas</div>
          <div className="sum-value" style={{ color: '#4ade80' }}>
            {loading ? '—' : `${Math.floor(totalMin / 60)}h ${String(totalMin % 60).padStart(2, '0')}m`}
          </div>
          <div className="sum-hint">no período</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-card">
        <div className="filter-title">Filtrar período</div>
        <form onSubmit={handleFilter}>
          <div className="filter-row">
            <div className="filter-field">
              <label>Data inicial</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="filter-field">
              <label>Data final</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button type="submit" className="btn-f btn-apply">Aplicar filtro</button>
            <button type="button" className="btn-f btn-clear" onClick={handleClear}>Limpar</button>
          </div>
        </form>
      </div>

      {/* Records */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 58 }} />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">Nenhum registro encontrado para o período selecionado.</div>
        </div>
      ) : (
        grouped.map(day => {
          const d = new Date(day.date)
          const isOpen = expanded === day.date
          const h = Math.floor(day.totalMinutes / 60)
          const m = day.totalMinutes % 60
          const entries = day.records.filter(r => r.type === 'ENTRY').length
          const exits = day.records.filter(r => r.type === 'EXIT').length

          return (
            <div key={day.date} className="day-card">
              <div className="day-header" onClick={() => setExpanded(isOpen ? null : day.date)}>
                <div className="day-left">
                  <div className="day-dots">
                    {entries > 0 && <div className="day-dot" style={{ background: '#22c55e' }} />}
                    {exits > 0 && <div className="day-dot" style={{ background: '#ef4444' }} />}
                  </div>
                  <div>
                    <div className="day-date">
                      {d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </div>
                    <div className="day-count">{day.records.length} registro{day.records.length !== 1 ? 's' : ''} · {entries} entrada{entries !== 1 ? 's' : ''} · {exits} saída{exits !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="day-right">
                  <div className="day-hours" style={{ color: day.totalMinutes > 0 ? '#60a5fa' : '#334155' }}>
                    {day.totalMinutes > 0 ? `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m` : '— h'}
                  </div>
                  <div className={`day-chevron ${isOpen ? 'open' : ''}`}>▼</div>
                </div>
              </div>

              {isOpen && (
                <div className="day-body">
                  {[...day.records]
                    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
                    .map(r => (
                      <div key={r.id} className={`rec-row ${r.type === 'ENTRY' ? 'rec-entry' : 'rec-exit'}`}>
                        <div className="rec-left">
                          <div className="rec-dot" />
                          <span className="rec-type">{r.type === 'ENTRY' ? 'Entrada' : 'Saída'}</span>
                        </div>
                        <span className="rec-time">{fmt(r.timestamp)}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )
        })
      )}
    </Layout>
  )
}
