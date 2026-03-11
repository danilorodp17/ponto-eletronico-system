import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface TimeRecord { id: string; type: 'ENTRY' | 'EXIT'; timestamp: string }

interface WeekSummary {
  weekLabel: string
  workedMinutes: number
  expectedMinutes: number
  balanceMinutes: number
  days: number
}

function calcWorkedMinutes(records: TimeRecord[]): number {
  const sorted = [...records].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
  let total = 0
  for (let i = 0; i < sorted.length - 1; i += 2) {
    if (sorted[i].type === 'ENTRY' && sorted[i + 1]?.type === 'EXIT')
      total += (+new Date(sorted[i + 1].timestamp) - +new Date(sorted[i].timestamp)) / 60000
  }
  return Math.round(total)
}

function fmtMin(minutes: number): string {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sign = minutes < 0 ? '-' : '+'
  return `${sign}${h}h ${String(m).padStart(2, '0')}m`
}

function fmtMinAbs(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekLabel(weekKey: string): string {
  const start = new Date(weekKey + 'T12:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

const RULES = [
  {
    icon: '⏱',
    title: 'Jornada Normal',
    value: '8h/dia · 44h/semana',
    desc: 'A jornada padrão de trabalho conforme a CLT é de 8 horas diárias e 44 horas semanais.',
    color: '#3b82f6',
    bg: '#0d1829',
    border: '#1e3a5f',
  },
  {
    icon: '⚡',
    title: 'Horas Extras',
    value: 'Até 2h/dia',
    desc: 'O limite legal de horas extras é de 2 horas por dia, totalizando no máximo 10h de trabalho diário.',
    color: '#f59e0b',
    bg: '#1a1200',
    border: '#4a3000',
  },
  {
    icon: '📅',
    title: 'Limite Diário Total',
    value: '10h/dia',
    desc: 'Somando jornada normal + horas extras, o máximo permitido por dia é de 10 horas de trabalho.',
    color: '#ef4444',
    bg: '#1a0808',
    border: '#4a1515',
  },
  {
    icon: '🏦',
    title: 'Banco de Horas',
    value: 'Compensação em 6 meses',
    desc: 'Por acordo individual, horas extras podem ser compensadas com folgas dentro do prazo de 6 meses.',
    color: '#22c55e',
    bg: '#0a1a0d',
    border: '#144d1e',
  },
  {
    icon: '🌙',
    title: 'Descanso Entre Jornadas',
    value: 'Mínimo 11h',
    desc: 'É obrigatório um intervalo mínimo de 11 horas consecutivas entre o encerramento de uma jornada e o início da próxima.',
    color: '#a78bfa',
    bg: '#110d1e',
    border: '#2e1f4e',
  },
  {
    icon: '🍽',
    title: 'Intervalo de Almoço',
    value: '1h a 2h',
    desc: 'Para jornadas acima de 6 horas, é obrigatório intervalo de no mínimo 1 hora para refeição e descanso.',
    color: '#06b6d4',
    bg: '#061419',
    border: '#0e3040',
  },
]

export default function Rules() {
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/time-records/history')
      setRecords(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Group records by day
  const byDay: Record<string, TimeRecord[]> = {}
  records.forEach(r => {
    const d = new Date(r.timestamp).toDateString()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(r)
  })

  // Group days into weeks
  const byWeek: Record<string, { records: TimeRecord[]; days: Set<string> }> = {}
  Object.entries(byDay).forEach(([day, recs]) => {
    const wk = getWeekKey(new Date(day))
    if (!byWeek[wk]) byWeek[wk] = { records: [], days: new Set() }
    byWeek[wk].records.push(...recs)
    byWeek[wk].days.add(day)
  })

  // Build week summaries
  const weeks: WeekSummary[] = Object.entries(byWeek)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([wk, { records: recs, days }]) => {
      const worked = calcWorkedMinutes(recs)
      const daysCount = days.size
      const expected = daysCount * 480 // 8h per worked day
      return {
        weekLabel: getWeekLabel(wk),
        workedMinutes: worked,
        expectedMinutes: expected,
        balanceMinutes: worked - expected,
        days: daysCount,
      }
    })

  // Accumulated balance across all weeks
  const totalBalance = weeks.reduce((s, w) => s + w.balanceMinutes, 0)
  const totalWorked = weeks.reduce((s, w) => s + w.workedMinutes, 0)
  const totalExpected = weeks.reduce((s, w) => s + w.expectedMinutes, 0)

  // Current week
  const currentWeekKey = getWeekKey(new Date())
  const currentWeekLabel = getWeekLabel(currentWeekKey)
  const currentWeek = weeks.find(w => w.weekLabel === currentWeekLabel)

  return (
    <Layout>
      <style>{`
        .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }

        /* BALANCE SUMMARY */
        .balance-top { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 28px; }
        .bal-card { background: #0a0d13; border: 1px solid #1a2035; border-radius: 14px; padding: 20px 22px; }
        .bal-label { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }
        .bal-value { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; }
        .bal-hint { font-size: 12px; color: #334155; margin-top: 6px; }
        .positive { color: #4ade80; }
        .negative { color: #f87171; }
        .neutral { color: #60a5fa; }

        .bal-main {
          background: #0a0d13; border-radius: 14px; padding: 22px 26px;
          margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px;
          flex-wrap: wrap;
        }
        .bal-main-left { }
        .bal-main-label { font-size: 12px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
        .bal-main-value { font-family: 'Space Grotesk', sans-serif; font-size: 42px; font-weight: 700; line-height: 1; letter-spacing: -1px; }
        .bal-main-sub { font-size: 13px; color: #475569; margin-top: 6px; }
        .bal-main-right { display: flex; gap: 12px; flex-wrap: wrap; }
        .bal-pill { padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; white-space: nowrap; }
        .bal-pill-pos { background: #0a1a0d; border: 1px solid #144d1e; color: #4ade80; }
        .bal-pill-neg { background: #1a0808; border: 1px solid #4a1515; color: #f87171; }
        .bal-pill-neu { background: #0d1829; border: 1px solid #1e3a5f; color: #60a5fa; }

        /* SECTION TITLE */
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #e2e8f0; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .section-line { flex: 1; height: 1px; background: #1a2035; }

        /* WEEK TABLE */
        .week-table { background: #0a0d13; border: 1px solid #1a2035; border-radius: 14px; overflow: hidden; margin-bottom: 28px; }
        .week-table-head { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr; padding: 12px 20px; background: #111827; border-bottom: 1px solid #1a2035; }
        .wth { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; }
        .week-row { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr; padding: 14px 20px; border-bottom: 1px solid #111827; transition: background 0.15s; align-items: center; }
        .week-row:last-child { border-bottom: none; }
        .week-row:hover { background: #0f1520; }
        .week-row.current-week { background: #0d1829; border-left: 2px solid #2563eb; }
        .wtd { font-size: 13px; color: #94a3b8; }
        .wtd-week { font-size: 13px; font-weight: 600; color: #e2e8f0; }
        .wtd-bal { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; }
        .badge-current { display: inline-flex; padding: 2px 8px; border-radius: 20px; background: #1e3a5f; color: #60a5fa; font-size: 10px; font-weight: 600; margin-left: 8px; letter-spacing: 0.5px; }

        /* RULES GRID */
        .rules-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 28px; }
        .rule-card { border-radius: 14px; padding: 20px 22px; transition: transform 0.15s; }
        .rule-card:hover { transform: translateY(-2px); }
        .rule-icon { font-size: 22px; margin-bottom: 14px; }
        .rule-title { font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .rule-value { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 10px; line-height: 1.2; }
        .rule-desc { font-size: 12px; color: #64748b; line-height: 1.6; }
        .rule-divider { height: 1px; margin: 12px 0; }

        /* ALERT BOX */
        .alert-box { border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; display: flex; align-items: flex-start; gap: 14px; }
        .alert-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .alert-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .alert-text { font-size: 13px; line-height: 1.6; }

        .sk { background: linear-gradient(90deg, #111827 25%, #1e2330 50%, #111827 75%); background-size: 200%; animation: sk 1.4s infinite; border-radius: 8px; }
        @keyframes sk { from{background-position:200% 0} to{background-position:-200% 0} }

        @media(max-width: 900px) {
          .balance-top { grid-template-columns: 1fr 1fr; }
          .rules-grid { grid-template-columns: 1fr 1fr; }
          .week-table-head, .week-row { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
          .week-table-head .wth:nth-child(2), .week-row .wtd:nth-child(2) { display: none; }
        }
        @media(max-width: 600px) {
          .balance-top { grid-template-columns: 1fr; }
          .rules-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-title">Regras & Banco de Horas</div>
      <div className="page-sub">Controle de jornada, horas extras e saldo acumulado</div>

      {/* ── SALDO PRINCIPAL ── */}
      <div className="bal-main" style={{
        border: `1px solid ${totalBalance >= 0 ? '#144d1e' : '#4a1515'}`,
      }}>
        <div className="bal-main-left">
          <div className="bal-main-label">Saldo acumulado total</div>
          <div className={`bal-main-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
            {loading ? '—' : fmtMin(totalBalance)}
          </div>
          <div className="bal-main-sub">
            {totalBalance > 0
              ? 'Você tem horas extras a compensar ou receber'
              : totalBalance < 0
              ? 'Você tem um débito de horas a recuperar'
              : 'Sua jornada está em dia'}
          </div>
        </div>
        <div className="bal-main-right">
          <div className={`bal-pill ${totalBalance >= 0 ? 'bal-pill-pos' : 'bal-pill-neg'}`}>
            {totalBalance >= 0 ? '↑ Crédito' : '↓ Débito'}
          </div>
          <div className="bal-pill bal-pill-neu">
            {loading ? '—' : fmtMinAbs(totalWorked)} trabalhadas
          </div>
          <div className="bal-pill bal-pill-neu">
            {loading ? '—' : fmtMinAbs(totalExpected)} esperadas
          </div>
        </div>
      </div>

      {/* ── CARDS DE RESUMO ── */}
      <div className="balance-top">
        <div className="bal-card">
          <div className="bal-label">Semana atual</div>
          {loading ? <div className="sk" style={{ height: 32, width: 100 }} /> : (
            <div className={`bal-value ${!currentWeek ? 'neutral' : currentWeek.balanceMinutes >= 0 ? 'positive' : 'negative'}`}>
              {currentWeek ? fmtMin(currentWeek.balanceMinutes) : '+0h 00m'}
            </div>
          )}
          <div className="bal-hint">
            {currentWeek ? `${fmtMinAbs(currentWeek.workedMinutes)} de ${fmtMinAbs(currentWeek.expectedMinutes)}` : 'Sem registros esta semana'}
          </div>
        </div>
        <div className="bal-card">
          <div className="bal-label">Dias registrados</div>
          {loading ? <div className="sk" style={{ height: 32, width: 60 }} /> : (
            <div className="bal-value neutral">{Object.keys(byDay).length}</div>
          )}
          <div className="bal-hint">com batidas de ponto</div>
        </div>
        <div className="bal-card">
          <div className="bal-label">Semanas no período</div>
          {loading ? <div className="sk" style={{ height: 32, width: 60 }} /> : (
            <div className="bal-value neutral">{weeks.length}</div>
          )}
          <div className="bal-hint">com histórico de horas</div>
        </div>
      </div>

      {/* ── TABELA SEMANAL ── */}
      <div className="section-title">
        Saldo por semana
        <div className="section-line" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {[1,2,3].map(i => <div key={i} className="sk" style={{ height: 50 }} />)}
        </div>
      ) : weeks.length === 0 ? (
        <div style={{ background: '#0a0d13', border: '1px solid #1a2035', borderRadius: 14, padding: '32px 20px', textAlign: 'center', color: '#334155', marginBottom: 28, fontSize: 14 }}>
          Nenhum registro encontrado para calcular o saldo.
        </div>
      ) : (
        <div className="week-table" style={{ marginBottom: 28 }}>
          <div className="week-table-head">
            <div className="wth">Semana</div>
            <div className="wth">Dias</div>
            <div className="wth">Trabalhado</div>
            <div className="wth">Esperado</div>
            <div className="wth">Saldo</div>
          </div>
          {weeks.map((w, i) => {
            const isCurrent = w.weekLabel === currentWeekLabel
            return (
              <div key={i} className={`week-row ${isCurrent ? 'current-week' : ''}`}>
                <div className="wtd-week">
                  {w.weekLabel}
                  {isCurrent && <span className="badge-current">ATUAL</span>}
                </div>
                <div className="wtd">{w.days}d</div>
                <div className="wtd">{fmtMinAbs(w.workedMinutes)}</div>
                <div className="wtd">{fmtMinAbs(w.expectedMinutes)}</div>
                <div className={`wtd-bal ${w.balanceMinutes >= 0 ? 'positive' : 'negative'}`}>
                  {fmtMin(w.balanceMinutes)}
                </div>
              </div>
            )
          })}
          {/* Total row */}
          <div className="week-row" style={{ background: '#111827', borderTop: '1px solid #1e2a3a' }}>
            <div className="wtd-week" style={{ color: '#94a3b8' }}>Total acumulado</div>
            <div className="wtd">{Object.keys(byDay).length}d</div>
            <div className="wtd" style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmtMinAbs(totalWorked)}</div>
            <div className="wtd" style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmtMinAbs(totalExpected)}</div>
            <div className={`wtd-bal ${totalBalance >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: 15 }}>
              {fmtMin(totalBalance)}
            </div>
          </div>
        </div>
      )}

      {/* ── ALERT: banco de horas ── */}
      {!loading && totalBalance !== 0 && (
        <div className="alert-box" style={
          totalBalance > 0
            ? { background: '#0a1a0d', border: '1px solid #144d1e', marginBottom: 28 }
            : { background: '#1a0808', border: '1px solid #4a1515', marginBottom: 28 }
        }>
          <div className="alert-icon">{totalBalance > 0 ? '💡' : '⚠️'}</div>
          <div>
            <div className="alert-title" style={{ color: totalBalance > 0 ? '#4ade80' : '#f87171' }}>
              {totalBalance > 0 ? 'Você possui horas extras acumuladas' : 'Você possui débito de horas'}
            </div>
            <div className="alert-text" style={{ color: totalBalance > 0 ? '#86efac' : '#fca5a5' }}>
              {totalBalance > 0
                ? `Você trabalhou ${fmtMin(totalBalance).replace('+', '')} a mais que o esperado. Conforme o banco de horas, essas horas podem ser compensadas com folgas em até 6 meses. Converse com seu gestor para agendar a compensação.`
                : `Você tem ${fmtMin(totalBalance).replace('-', '')} de débito. Você precisará recuperar essas horas para zerar o banco. Isso pode ser feito trabalhando além da jornada normal nos próximos dias.`
              }
            </div>
          </div>
        </div>
      )}

      {/* ── REGRAS DE NEGÓCIO ── */}
      <div className="section-title">
        Regras de jornada (CLT)
        <div className="section-line" />
      </div>

      <div className="rules-grid">
        {RULES.map(rule => (
          <div
            key={rule.title}
            className="rule-card"
            style={{ background: rule.bg, border: `1px solid ${rule.border}` }}
          >
            <div className="rule-icon">{rule.icon}</div>
            <div className="rule-title">{rule.title}</div>
            <div className="rule-value" style={{ color: rule.color }}>{rule.value}</div>
            <div className="rule-divider" style={{ background: rule.border }} />
            <div className="rule-desc">{rule.desc}</div>
          </div>
        ))}
      </div>

      {/* ── AVISO LEGAL ── */}
      <div style={{ background: '#0a0d13', border: '1px solid #1a2035', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>📌</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Aviso importante</div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
            As informações acima são baseadas na Consolidação das Leis do Trabalho (CLT) e servem como referência informativa. Acordos coletivos, convenções sindicais ou contratos individuais podem estabelecer condições diferentes. Consulte sempre o RH ou departamento jurídico da sua empresa para esclarecimentos específicos.
          </div>
        </div>
      </div>

    </Layout>
  )
}
