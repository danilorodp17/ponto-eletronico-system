import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import api from '../services/api'

interface DailyHours { hours: number; minutes: number; totalMinutes: number }
interface TimeRecord { id: string; type: 'ENTRY' | 'EXIT'; timestamp: string }

function calcWorkedMinutes(records: TimeRecord[]): number {
  const sorted = [...records].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
  let total = 0
  for (let i = 0; i < sorted.length - 1; i += 2) {
    if (sorted[i].type === 'ENTRY' && sorted[i + 1]?.type === 'EXIT')
      total += (+new Date(sorted[i + 1].timestamp) - +new Date(sorted[i].timestamp)) / 60000
  }
  return Math.round(total)
}

function fmtBalance(minutes: number): string {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${minutes >= 0 ? '+' : '-'}${h}h ${String(m).padStart(2, '0')}m`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [punching, setPunching] = useState<'ENTRY' | 'EXIT' | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [dailyHours, setDailyHours] = useState<DailyHours | null>(null)
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([])
  const [fetching, setFetching] = useState(true)
  const [weekBalance, setWeekBalance] = useState<number | null>(null)
  const [totalBalance, setTotalBalance] = useState<number | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const [h, hist] = await Promise.all([
        api.get('/time-records/daily-hours'),
        api.get('/time-records/history'),
      ])
      setDailyHours(h.data)
      const allRecords: TimeRecord[] = hist.data
      const today = new Date().toDateString()
      setTodayRecords(allRecords.filter(r => new Date(r.timestamp).toDateString() === today))

      // Group by day
      const byDay: Record<string, TimeRecord[]> = {}
      allRecords.forEach(r => {
        const d = new Date(r.timestamp).toDateString()
        if (!byDay[d]) byDay[d] = []
        byDay[d].push(r)
      })

      // Weekly balance (Mon–Sun of current week)
      const now = new Date()
      const day = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)

      const weekRecs = allRecords.filter(r => {
        const t = new Date(r.timestamp)
        return t >= monday && t <= sunday
      })
      const weekDays = new Set(weekRecs.map(r => new Date(r.timestamp).toDateString())).size
      const weekWorked = calcWorkedMinutes(weekRecs)
      setWeekBalance(weekWorked - weekDays * 480)

      // Total balance
      let totalWorked = 0
      let totalExpected = 0
      Object.entries(byDay).forEach(([, recs]) => {
        totalWorked += calcWorkedMinutes(recs)
        totalExpected += 480
      })
      setTotalBalance(totalWorked - totalExpected)

    } catch { /* silent */ }
    finally { setFetching(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const punch = async (type: 'ENTRY' | 'EXIT') => {
    setPunching(type)
    try {
      await api.post('/time-records/punch', { type })
      const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      showToast(`${type === 'ENTRY' ? 'Entrada' : 'Saída'} registrada às ${t}`, true)
      fetchData()
    } catch { showToast('Erro ao registrar. Tente novamente.', false) }
    finally { setPunching(null) }
  }

  const fmt = (ts: string) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const last = todayRecords[0] ?? null
  const progress = dailyHours ? Math.min(100, (dailyHours.totalMinutes / 480) * 100) : 0
  const hoursStr = dailyHours ? `${String(dailyHours.hours).padStart(2, '0')}h ${String(dailyHours.minutes).padStart(2, '0')}m` : '—'
  const status = last?.type === 'ENTRY' ? 'working' : last?.type === 'EXIT' ? 'out' : 'none'

  return (
    <Layout>
      <style>{`
        .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 12px; padding: 20px 22px; }
        .stat-label { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1; }
        .stat-hint { font-size: 12px; color: #334155; margin-top: 6px; }

        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 14px; padding: 24px; }
        .card-title { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 20px; letter-spacing: 0.3px; }

        /* Punch */
        .punch-greeting { font-size: 14px; color: #64748b; margin-bottom: 3px; }
        .punch-name { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .punch-status { display: inline-flex; align-items: center; gap: 7px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 24px; }
        .status-working { background: #0d2015; border: 1px solid #166534; color: #4ade80; }
        .status-out { background: #1c0a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
        .status-none { background: #111827; border: 1px solid #252d3d; color: #64748b; }
        .status-dot-g { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
        .status-dot-r { width: 5px; height: 5px; border-radius: 50%; background: #ef4444; }
        .status-dot-n { width: 5px; height: 5px; border-radius: 50%; background: #475569; }

        .punch-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px; }
        .punch-btn {
          padding: 18px 12px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
          transition: all 0.18s; display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .punch-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        .punch-entry { background: #0d2015; border: 1px solid #166534; color: #4ade80; }
        .punch-entry:hover:not(:disabled) { background: #0a2510; border-color: #22c55e; transform: translateY(-1px); }
        .punch-exit { background: #1c0a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
        .punch-exit:hover:not(:disabled) { background: #1c0808; border-color: #ef4444; transform: translateY(-1px); }
        .punch-icon { font-size: 22px; }
        .punch-label { font-size: 14px; }
        .punch-time { font-size: 11px; opacity: 0.6; }

        .progress-label-row { display: flex; justify-content: space-between; margin-bottom: 7px; }
        .progress-label { font-size: 12px; color: #475569; }
        .progress-pct { font-size: 12px; color: #60a5fa; font-weight: 600; }
        .progress-track { height: 5px; background: #1e2330; border-radius: 3px; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #06b6d4); border-radius: 3px; transition: width 0.8s ease; }

        /* Records */
        .rec-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; border-radius: 9px; margin-bottom: 7px; }
        .rec-entry { background: #0d1f15; border: 1px solid #14532d; }
        .rec-exit { background: #1c0a0a; border: 1px solid #7f1d1d; }
        .rec-left { display: flex; align-items: center; gap: 10px; }
        .rec-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .rec-dot-e { background: #22c55e; }
        .rec-dot-x { background: #ef4444; }
        .rec-type { font-size: 13px; font-weight: 500; }
        .rec-entry .rec-type { color: #4ade80; }
        .rec-exit .rec-type { color: #fca5a5; }
        .rec-time { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #e2e8f0; }

        .empty { text-align: center; padding: 28px 0; color: #334155; }
        .empty-icon { font-size: 26px; margin-bottom: 8px; }
        .empty-text { font-size: 13px; }

        .sk { background: linear-gradient(90deg, #111827 25%, #1e2330 50%, #111827 75%); background-size: 200%; animation: sk 1.4s infinite; border-radius: 8px; }
        @keyframes sk { from{background-position:200% 0} to{background-position:-200% 0} }

        /* Toast */
        .toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; padding: 13px 18px; border-radius: 11px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; animation: toastIn 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .toast-ok { background: #0d2015; border: 1px solid #166534; color: #4ade80; }
        .toast-err { background: #1c0a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin 0.65s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        @media(max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } .bottom-grid { grid-template-columns: 1fr; } }
        @media(max-width: 520px) { .stats-row { grid-template-columns: 1fr; } }
      `}</style>

      {toast && (
        <div className={`toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>
          <span>{toast.ok ? '✓' : '⚠'}</span>{toast.msg}
        </div>
      )}

      <div className="page-title">Dashboard</div>
      <div className="page-sub">Bem-vindo, {user?.name?.split(' ')[0]}. Registre seu ponto abaixo.</div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Horas hoje</div>
          {fetching ? <div className="sk" style={{ height: 32, width: 80 }} /> : <div className="stat-value" style={{ color: '#60a5fa' }}>{hoursStr}</div>}
          <div className="stat-hint">Meta: 08h 00m</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo da semana</div>
          {fetching || weekBalance === null
            ? <div className="sk" style={{ height: 32, width: 100 }} />
            : <div className="stat-value" style={{ color: weekBalance >= 0 ? '#4ade80' : '#f87171' }}>
                {fmtBalance(weekBalance)}
              </div>
          }
          <div className="stat-hint">seg a dom atual</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo acumulado</div>
          {fetching || totalBalance === null
            ? <div className="sk" style={{ height: 32, width: 100 }} />
            : <div className="stat-value" style={{ color: totalBalance >= 0 ? '#4ade80' : '#f87171' }}>
                {fmtBalance(totalBalance)}
              </div>
          }
          <div className="stat-hint">total do período</div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom-grid">

        {/* Punch */}
        <div className="card">
          <div className="punch-greeting">Olá,</div>
          <div className="punch-name">{user?.name?.split(' ')[0]} 👋</div>
          <div className={`punch-status ${status === 'working' ? 'status-working' : status === 'out' ? 'status-out' : 'status-none'}`}>
            <div className={status === 'working' ? 'status-dot-g' : status === 'out' ? 'status-dot-r' : 'status-dot-n'} />
            {status === 'working' ? 'Trabalhando' : status === 'out' ? 'Fora' : 'Sem registro hoje'}
          </div>

          <div className="punch-row">
            <button className="punch-btn punch-entry" onClick={() => punch('ENTRY')} disabled={punching !== null}>
              <span className="punch-icon">{punching === 'ENTRY' ? <div className="spinner-sm" /> : '↓'}</span>
              <span className="punch-label">Entrada</span>
              <span className="punch-time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </button>
            <button className="punch-btn punch-exit" onClick={() => punch('EXIT')} disabled={punching !== null}>
              <span className="punch-icon">{punching === 'EXIT' ? <div className="spinner-sm" /> : '↑'}</span>
              <span className="punch-label">Saída</span>
              <span className="punch-time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </button>
          </div>

          <div className="progress-label-row">
            <span className="progress-label">Progresso da jornada</span>
            <span className="progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Records */}
        <div className="card">
          <div className="card-title">Registros de hoje</div>
          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="sk" style={{ height: 42 }} />)}
            </div>
          ) : todayRecords.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Nenhum registro ainda hoje.</div>
            </div>
          ) : (
            todayRecords.slice(0, 8).map(r => (
              <div key={r.id} className={`rec-item ${r.type === 'ENTRY' ? 'rec-entry' : 'rec-exit'}`}>
                <div className="rec-left">
                  <div className={`rec-dot ${r.type === 'ENTRY' ? 'rec-dot-e' : 'rec-dot-x'}`} />
                  <span className="rec-type">{r.type === 'ENTRY' ? 'Entrada' : 'Saída'}</span>
                </div>
                <span className="rec-time">{fmt(r.timestamp)}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  )
}
