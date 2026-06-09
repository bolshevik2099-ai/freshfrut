import React from 'react';
import { LayoutDashboard, QrCode, ClipboardCheck, Globe, Database, ShoppingBag, Truck, PackageOpen, Users, DollarSign, Wallet, LogOut, MessageSquare, Sliders, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, userRole = 'admin', onClose, isMobileOpen = false }) {
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
    ...(userRole === 'admin' ? [{ id: 'chat_config', label: 'Configurar Chat', icon: Sliders }] : [])
  ];

  return (
    <aside className={`sidebar glass-panel ${isMobileOpen ? 'mobile-open' : ''}`} style={{
      width: '260px',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0,
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(30px) saturate(150%)',
      borderRight: '1px solid var(--panel-border)',
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
      padding: '12px 16px',
      boxShadow: '0 0 20px rgba(56, 189, 248, 0.04)',
      transition: 'transform var(--transition-normal)'
    }}>
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}
        className="mobile-close-btn"
      >
        <X size={20} />
      </button>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        padding: '0 4px'
      }}>
        <img 
          src="/tamfresh_logo.png" 
          alt="Tamfresh Logo" 
          style={{ width: '80px', height: '80px', objectFit: 'contain' }}
        />
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Tam<span style={{ color: 'var(--color-success)' }}>fresh</span>
          </h2>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>SISTEMA DE GESTIÓN</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '8px 12px',
                background: isActive ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-blueberry-dark)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                borderLeft: isActive ? '3px solid var(--color-blueberry)' : '3px solid transparent',
              }}
              className={isActive ? '' : 'sidebar-item-hover'}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / DB Connection State */}
      <div style={{
        marginTop: 'auto',
        padding: '10px 4px',
        borderTop: '1px solid var(--panel-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={onLogout}
          className="sidebar-item-hover"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all var(--transition-fast)',
            marginBottom: '4px'
          }}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Base de datos conectada
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.65rem'
        }}>
          <Database size={12} />
          <span>v2.4.1-stable</span>
        </div>
      </div>
      
      <style>{`
        .sidebar-item-hover:hover {
          background: rgba(30, 58, 138, 0.08) !important;
          color: var(--color-blueberry) !important;
          padding-left: 20px !important;
          box-shadow: inset 0 0 8px rgba(30, 58, 138, 0.04);
        }
      `}</style>
    </aside>
  );
}
