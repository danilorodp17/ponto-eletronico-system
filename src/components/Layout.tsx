import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props { children: ReactNode }

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/history', label: 'Histórico', icon: '≡' },
    { to: '/rules', label: 'Banco de Horas', icon: '⚖' },
  ]

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'MANAGER' ? 'Gerente' : 'Funcionário'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100vh; background: #0f1117; }
        body { font-family: 'Inter', sans-serif; color: #e2e8f0; }
        a { text-decoration: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252d3d; border-radius: 4px; }

        .layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: #0a0d13;
          border-right: 1px solid #1a2035;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
        }
        .sidebar-top-bar { height: 3px; background: linear-gradient(90deg, #2563eb, #06b6d4); }

        .sidebar-brand { padding: 24px 20px 20px; border-bottom: 1px solid #1a2035; }
        .brand-row { display: flex; align-items: center; gap: 10px; }
        .brand-sq { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .brand-n { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; }
        .brand-s { font-size: 10px; color: #475569; letter-spacing: 0.5px; margin-top: 1px; }

        .sidebar-nav { flex: 1; padding: 20px 12px; }
        .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #334155; padding: 0 8px; margin-bottom: 8px; }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px; border-radius: 8px; margin-bottom: 2px;
          color: #64748b; font-size: 14px; font-weight: 500;
          transition: all 0.15s; cursor: pointer;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'Inter', sans-serif; text-decoration: none;
        }
        .nav-link:hover { background: #111827; color: #cbd5e1; }
        .nav-link.active { background: #111827; color: #60a5fa; border-left: 2px solid #2563eb; padding-left: 8px; }
        .nav-icon { font-size: 15px; width: 18px; text-align: center; }

        .sidebar-footer { padding: 16px 12px; border-top: 1px solid #1a2035; }
        .user-box { padding: 12px; background: #111827; border-radius: 10px; border: 1px solid #1e2a40; }
        .user-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .user-av { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: #475569; }
        .logout-btn { width: 100%; padding: 8px; border-radius: 7px; border: 1px solid #1e2a40; background: transparent; color: #64748b; font-size: 12px; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s; }
        .logout-btn:hover { background: #1c0a0a; border-color: #7f1d1d; color: #fca5a5; }

        /* MAIN */
        .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        /* TOPBAR */
        .topbar {
          height: 60px; border-bottom: 1px solid #1a2035;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px;
          background: #0a0d13;
          position: sticky; top: 0; z-index: 40;
        }
        .topbar-left { display: flex; flex-direction: column; }
        .topbar-time { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.5px; }
        .topbar-date { font-size: 11px; color: #475569; margin-top: 1px; text-transform: capitalize; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .online-pill { display: flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 20px; background: #0d1a0d; border: 1px solid #166534; font-size: 12px; color: #4ade80; font-weight: 500; }
        .online-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* CONTENT */
        .content { flex: 1; padding: 28px; }

        @media(max-width: 768px) {
          .sidebar { display: none; }
          .main { margin-left: 0; }
          .content { padding: 20px 16px; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-top-bar" />
          <div className="sidebar-brand">
            <div className="brand-row">
              <div className="brand-sq">⏱</div>
              <div>
                <div className="brand-n">PontoTech</div>
                <div className="brand-s">Reg. Eletrônico</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-box">
              <div className="user-top">
                <div className="user-av">{initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role">{roleLabel}</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>↩ Sair da conta</button>
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-time">{time.toLocaleTimeString('pt-BR')}</div>
              <div className="topbar-date">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="topbar-right">
              <div className="online-pill">
                <div className="online-dot" />
                Online
              </div>
            </div>
          </div>

          <div className="content">{children}</div>
        </div>
      </div>
    </>
  )
}
