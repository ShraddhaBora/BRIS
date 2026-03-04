import {
  LayoutDashboard, ShieldAlert, Activity, BrainCircuit,
  FlaskConical, Settings, UserSearch, BookOpen
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyzer', label: 'User Analyzer', icon: UserSearch },
  { id: 'risk-monitor', label: 'Risk Monitor', icon: ShieldAlert },
  { id: 'behavioral-drift', label: 'Behavioral Drift', icon: Activity },
  { id: 'model-insights', label: 'Model Insights', icon: BrainCircuit },
  { id: 'stress-simulator', label: 'Stress Simulator', icon: FlaskConical },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function BrisLogo() {
  return (
    <div style={{ width: 24, height: 24, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ShieldAlert size={14} color="white" />
    </div>
  );
}

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BrisLogo />
        </div>
        <div onClick={() => onNav('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-name">BRIS</div>
          <div className="brand-sub">Behavioral Analytics v2</div>
        </div>
      </div>

      <nav className="nav-area">
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-link${active === item.id ? ' active' : ''}`}
              onClick={() => onNav(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNav(item.id)}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="sys-status">
          <div className="pulse-dot" />
          <span className="sys-text">ALL SYSTEMS OK</span>
        </div>
      </div>
    </aside>
  );
}
