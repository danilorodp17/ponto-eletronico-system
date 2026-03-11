import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

type View = 'login' | 'register' | 'forgot' | 'forgot-success'

export default function Login() {
  const [view, setView] = useState<View>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch { setError('Email ou senha incorretos.') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return }
    if (form.password.length < 6) { setError('Senha mínima de 6 caracteres.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err: any) { setError(err?.response?.data?.error || 'Erro ao criar conta.') }
    finally { setLoading(false) }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false); setView('forgot-success')
  }

  const switchView = (v: View) => { setError(''); setForm({ name: '', email: '', password: '', confirm: '' }); setView(v) }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 4 ? 1 : form.password.length < 7 ? 2 : form.password.length < 10 ? 3 : 4
  const pwColors = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e']
  const pwLabels = ['', 'Fraca', 'Média', 'Boa', 'Forte']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; }

        .login-wrap {
          min-height: 100vh;
          background: #0f1117;
          display: flex;
          font-family: 'Inter', sans-serif;
        }

        /* LEFT PANEL */
        .left-panel {
          width: 420px;
          flex-shrink: 0;
          background: #0a0d13;
          border-right: 1px solid #1e2330;
          display: flex;
          flex-direction: column;
          padding: 48px 44px;
          position: relative;
          overflow: hidden;
        }
        .left-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #06b6d4);
        }
        .left-brand { margin-bottom: 56px; }
        .brand-mark {
          display: flex; align-items: center; gap: 12px;
        }
        .brand-square {
          width: 36px; height: 36px; border-radius: 8px;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .brand-text-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.3px;
        }
        .brand-text-sub {
          font-size: 11px; color: #475569;
          letter-spacing: 0.5px; margin-top: 1px;
        }

        .left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .left-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 30px; font-weight: 700;
          color: #f1f5f9; line-height: 1.25;
          letter-spacing: -0.5px; margin-bottom: 14px;
        }
        .left-desc { font-size: 15px; color: #64748b; line-height: 1.7; margin-bottom: 44px; }

        .feature-list { display: flex; flex-direction: column; gap: 14px; }
        .feature-item { display: flex; align-items: center; gap: 13px; }
        .feature-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #13192a;
          border: 1px solid #1e2a40;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .feature-text { font-size: 14px; color: #94a3b8; }

        .left-footer { padding-top: 32px; border-top: 1px solid #1e2330; }
        .status-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0d1a0d; border: 1px solid #166534;
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; color: #4ade80; font-weight: 500;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* RIGHT PANEL */
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: #0f1117;
        }

        .form-box {
          width: 100%; max-width: 380px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .form-box.in { opacity: 1; transform: translateY(0); }

        .form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.3px; margin-bottom: 6px;
        }
        .form-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; line-height: 1.5; }

        .field-block { margin-bottom: 18px; }
        .field-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #94a3b8; margin-bottom: 7px; letter-spacing: 0.3px;
        }
        .field-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .field-label-row .field-label { margin-bottom: 0; }
        input[type=text], input[type=email], input[type=password] {
          width: 100%;
          background: #161b27;
          border: 1px solid #252d3d;
          border-radius: 10px;
          padding: 12px 15px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        input::placeholder { color: #3d4d66; }
        input:focus { border-color: #2563eb; background: #111827; }

        .pw-bar-row { display: flex; gap: 4px; margin-top: 9px; }
        .pw-bar { flex: 1; height: 3px; border-radius: 2px; background: #1e2330; transition: background 0.3s; }
        .pw-bar-label { font-size: 11px; color: #475569; margin-top: 5px; }

        .btn-main {
          width: 100%; padding: 13px;
          border-radius: 10px; border: none;
          background: #2563eb;
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          margin-top: 8px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .btn-main:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 6px 20px rgba(37,99,235,0.4); transform: translateY(-1px); }
        .btn-main:active:not(:disabled) { transform: translateY(0); }
        .btn-main:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          width: 100%; padding: 12px;
          border-radius: 10px;
          border: 1px solid #252d3d;
          background: transparent;
          color: #94a3b8; font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: all 0.15s;
          margin-top: 10px;
        }
        .btn-secondary:hover { border-color: #334155; color: #cbd5e1; background: #161b27; }

        .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .div-line { flex: 1; height: 1px; background: #1e2330; }
        .div-text { font-size: 12px; color: #3d4d66; }

        .link { background: none; border: none; color: #3b82f6; font-size: 13px; font-family: 'Inter', sans-serif; cursor: pointer; padding: 0; font-weight: 500; }
        .link:hover { color: #60a5fa; text-decoration: underline; }

        .error-msg {
          background: #1c0a0a; border: 1px solid #7f1d1d;
          border-radius: 9px; padding: 11px 14px;
          color: #fca5a5; font-size: 13px; margin-bottom: 20px;
        }

        .switch-text { text-align: center; margin-top: 20px; font-size: 13px; color: #475569; }

        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; margin-right: 8px; vertical-align: -2px; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .success-icon { width: 60px; height: 60px; border-radius: 50%; background: #0d2015; border: 1px solid #166534; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 20px; animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes pop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

        .view-in { animation: viewIn 0.3s ease both; }
        @keyframes viewIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }

        @media(max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { padding: 32px 20px; }
        }
      `}</style>

      <div className="login-wrap">

        {/* Left */}
        <div className="left-panel">
          <div className="left-accent" />
          <div className="left-brand">
            <div className="brand-mark">
              <div className="brand-square">⏱</div>
              <div>
                <div className="brand-text-name">PontoTech</div>
                <div className="brand-text-sub">Registro Eletrônico</div>
              </div>
            </div>
          </div>

          <div className="left-content">
            <div className="left-headline">Controle de ponto simples e eficiente</div>
            <div className="left-desc">Registre entradas e saídas, acompanhe horas trabalhadas e gerencie sua equipe em um só lugar.</div>

            <div className="feature-list">
              {[
                ['🔐', 'Autenticação segura com JWT'],
                ['📋', 'Histórico completo de registros'],
                ['⏱', 'Cálculo automático de horas'],
                ['👥', 'Gestão de equipes'],
              ].map(([icon, text]) => (
                <div className="feature-item" key={text}>
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-text">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="left-footer">
            <div className="status-pill">
              <div className="status-dot" />
              Sistema Online
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="right-panel">
          <div className={`form-box ${mounted ? 'in' : ''}`}>

            {/* LOGIN */}
            {view === 'login' && (
              <div className="view-in">
                <div className="form-title">Entrar na conta</div>
                <div className="form-sub">Acesse para registrar seu ponto</div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="field-block">
                    <label className="field-label">Email</label>
                    <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div className="field-block">
                    <div className="field-label-row">
                      <label className="field-label">Senha</label>
                      <button type="button" className="link" onClick={() => switchView('forgot')}>Esqueci a senha</button>
                    </div>
                    <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
                  </div>
                  <button className="btn-main" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner" />Entrando...</> : 'Entrar'}
                  </button>
                </form>

                <div className="divider">
                  <div className="div-line" /><span className="div-text">ou</span><div className="div-line" />
                </div>

                <button className="btn-secondary" onClick={() => switchView('register')}>
                  Criar nova conta
                </button>
              </div>
            )}

            {/* REGISTER */}
            {view === 'register' && (
              <div className="view-in">
                <div className="form-title">Criar conta</div>
                <div className="form-sub">Preencha seus dados para começar</div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleRegister}>
                  <div className="field-block">
                    <label className="field-label">Nome completo</label>
                    <input type="text" placeholder="João Silva" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Email</label>
                    <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Senha</label>
                    <input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} required />
                    {form.password.length > 0 && (
                      <>
                        <div className="pw-bar-row">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="pw-bar" style={{ background: pwStrength >= i ? pwColors[pwStrength] : undefined }} />
                          ))}
                        </div>
                        <div className="pw-bar-label" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</div>
                      </>
                    )}
                  </div>
                  <div className="field-block">
                    <label className="field-label">Confirmar senha</label>
                    <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} required
                      style={form.confirm && form.confirm !== form.password ? { borderColor: '#7f1d1d' } : {}} />
                  </div>
                  <button className="btn-main" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner" />Criando conta...</> : 'Criar conta'}
                  </button>
                </form>

                <div className="switch-text">
                  Já tem conta?{' '}
                  <button className="link" onClick={() => switchView('login')}>Fazer login</button>
                </div>
              </div>
            )}

            {/* FORGOT */}
            {view === 'forgot' && (
              <div className="view-in">
                <div className="form-title">Recuperar senha</div>
                <div className="form-sub">Enviaremos um link de redefinição para seu email</div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleForgot}>
                  <div className="field-block">
                    <label className="field-label">Email cadastrado</label>
                    <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <button className="btn-main" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner" />Enviando...</> : 'Enviar link de recuperação'}
                  </button>
                </form>

                <div className="switch-text">
                  <button className="link" onClick={() => switchView('login')}>← Voltar ao login</button>
                </div>
              </div>
            )}

            {/* FORGOT SUCCESS */}
            {view === 'forgot-success' && (
              <div className="view-in" style={{ textAlign: 'center' }}>
                <div className="success-icon">✉️</div>
                <div className="form-title">Email enviado!</div>
                <div className="form-sub" style={{ marginBottom: 28 }}>
                  Verifique sua caixa de entrada em <strong style={{ color: '#e2e8f0' }}>{form.email}</strong> e siga as instruções.
                </div>
                <button className="btn-main" onClick={() => switchView('login')}>Voltar ao login</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
