import React from 'react';
import { LayoutDashboard, QrCode, ClipboardCheck, Globe, Database, ShoppingBag, Truck, PackageOpen, Users, DollarSign, Wallet } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: PackageOpen },
    { id: 'purchases', label: 'Compras (Recepción)', icon: ShoppingBag },
    { id: 'quality', label: 'Control de Calidad', icon: ClipboardCheck },
    { id: 'sales', label: 'Ventas (Despachos)', icon: Truck },
    { id: 'traceability', label: 'Trazabilidad', icon: QrCode },
    { id: 'suppliers', label: 'Proveedores', icon: Users },
    { id: 'clients', label: 'Clientes', icon: Globe },
    { id: 'debts', label: 'Deudas (Cuentas)', icon: DollarSign },
    { id: 'expenses', label: 'Gastos de Operación', icon: Wallet },
  ];

  return (
    <aside className="sidebar glass-panel" style={{
      width: '260px',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
      borderRight: '1px solid var(--panel-border)',
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
      padding: '24px 16px',
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        padding: '0 8px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--color-strawberry) 0%, var(--color-blackberry) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-strawberry)'
        }}>
          <Globe size={18} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Fresh<span style={{ color: 'var(--color-strawberry)' }}>Frut</span>
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>SISTEMA DE GESTIÓN</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                background: isActive ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-strawberry-hover)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                borderLeft: isActive ? '3px solid var(--color-strawberry)' : '3px solid transparent',
              }}
              className={isActive ? '' : 'sidebar-item-hover'}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / DB Connection State */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Base de datos conectada
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.7rem'
        }}>
          <Database size={12} />
          <span>v2.4.1-stable</span>
        </div>
      </div>
      
      <style>{`
        .sidebar-item-hover:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          color: var(--text-primary) !important;
          padding-left: 20px !important;
        }
      `}</style>
    </aside>
  );
}
