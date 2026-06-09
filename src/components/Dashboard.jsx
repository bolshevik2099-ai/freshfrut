import React, { useState } from 'react';
import { TrendingUp, Truck, Package, Thermometer, ShieldAlert, ArrowUpRight, ShoppingCart, Wallet, Calendar } from 'lucide-react';

export default function Dashboard({ purchases, sales, expenses = [], debts = [], userRole = 'admin', lastOperatorActivity = null }) {
  const [selectedBerryFilter, setSelectedBerryFilter] = useState('Todos');
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Helper to determine start and end date of the selected preset based on "today" = 2026-06-03
  const getFilterRange = () => {
    const today = new Date(); // Synchronized with browser's local timezone
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (datePreset === 'ALL') {
      return { start: '', end: '' };
    }
    if (datePreset === 'TODAY') {
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === '7_DAYS') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      const pY = past.getFullYear();
      const pM = String(past.getMonth() + 1).padStart(2, '0');
      const pD = String(past.getDate()).padStart(2, '0');
      return { start: `${pY}-${pM}-${pD}`, end: todayStr };
    }
    if (datePreset === '30_DAYS') {
      const past = new Date(today);
      past.setDate(today.getDate() - 30);
      const pY = past.getFullYear();
      const pM = String(past.getMonth() + 1).padStart(2, '0');
      const pD = String(past.getDate()).padStart(2, '0');
      return { start: `${pY}-${pM}-${pD}`, end: todayStr };
    }
    if (datePreset === 'THIS_MONTH') {
      const firstDay = `${yyyy}-${mm}-01`;
      return { start: firstDay, end: todayStr };
    }
    if (datePreset === 'LAST_MONTH') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      const lmY = lastMonth.getFullYear();
      const lmM = String(lastMonth.getMonth() + 1).padStart(2, '0');
      const firstDay = `${lmY}-${lmM}-01`;
      const lastDayDate = new Date(lmY, lastMonth.getMonth() + 1, 0);
      const lastDay = `${lmY}-${lmM}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
      return { start: firstDay, end: lastDay };
    }
    if (datePreset === 'CUSTOM') {
      return { start: customStart, end: customEnd };
    }
    return { start: '', end: '' };
  };

  const { start: filterStart, end: filterEnd } = getFilterRange();

  // Filtering function for date (lexicographical comparison)
  const isWithinDateRange = (itemDate) => {
    if (!itemDate) return true;
    if (filterStart && itemDate < filterStart) return false;
    if (filterEnd && itemDate > filterEnd) return false;
    return true;
  };

  // Filter global states by date AND berry selection
  const filteredPurchases = purchases.filter(
    p => isWithinDateRange(p.date) && (selectedBerryFilter === 'Todos' || p.berry === selectedBerryFilter)
  );
  const filteredSales = sales.filter(
    s => isWithinDateRange(s.date) && (selectedBerryFilter === 'Todos' || s.berry === selectedBerryFilter)
  );
  const filteredExpenses = expenses.filter(e => isWithinDateRange(e.date));

  // Compute live stats from filtered data (MXN)
  const totalKgsReceived = filteredPurchases.reduce((sum, p) => sum + p.kg, 0);
  const totalCost = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  
  const totalKgsSold = filteredSales.reduce((sum, s) => sum + s.kg, 0);
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);

  // Operational Expenses calculations
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  
  // Calculated KPIs
  const avgCostPerKg = totalKgsReceived > 0 ? totalCost / totalKgsReceived : 0;
  const avgPricePerKg = totalKgsSold > 0 ? totalRevenue / totalKgsSold : 0;
  const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Credit and Debts calculations
  // Credit and Debts calculations (filtered by date and berry fruit)
  const filteredDebts = (debts || []).filter(d => {
    if (!isWithinDateRange(d.date)) return false;
    if (selectedBerryFilter === 'Todos') return true;
    if (d.type === 'PAYABLE') {
      const p = purchases.find(purch => purch.id === d.sourceId);
      return p && p.berry === selectedBerryFilter;
    }
    if (d.type === 'RECEIVABLE') {
      const s = sales.find(sale => sale.id === d.sourceId);
      return s && s.berry === selectedBerryFilter;
    }
    return false;
  });
  const totalReceivable = filteredDebts
    .filter(d => d.type === 'RECEIVABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPayable = filteredDebts
    .filter(d => d.type === 'PAYABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const creditsBalance = totalReceivable - totalPayable;
  
  const pendingInspectionCount = filteredPurchases.filter(p => p.qcStatus === 'PENDING').length;
  const inStockCount = filteredPurchases.filter(p => p.qcStatus !== 'PENDING' && p.qcStatus !== 'REJECTED' && p.remainingKg > 0).length;
  const transitCount = filteredSales.filter(s => s.status.includes('Ruta') || s.status.includes('Puerto')).length;

  const filteredShipments = selectedBerryFilter === 'Todos'
    ? filteredSales
    : filteredSales.filter(s => s.berry === selectedBerryFilter);

  // Berry colors
  const berryColors = {
    'Fresa': '#e11d48',
    'Arándano': '#3b82f6',
    'Frambuesa': '#db2777',
    'Mora': '#a21caf'
  };

  // Expense colors & totals for Donut chart
  const expenseCategories = ['Empaque', 'Logística', 'Nómina', 'Insumos', 'Otros'];
  const expenseColors = {
    'Empaque': '#be185d',
    'Logística': '#4c1d95',
    'Nómina': '#2563eb',
    'Insumos': '#d97706',
    'Otros': '#4b5563'
  };

  const expenseTotals = {};
  expenseCategories.forEach(cat => { expenseTotals[cat] = 0; });
  filteredExpenses.forEach(e => {
    if (expenseTotals[e.type] !== undefined) {
      expenseTotals[e.type] += e.amount;
    } else {
      expenseTotals['Otros'] += e.amount;
    }
  });

  const grandTotalExpenses = Object.values(expenseTotals).reduce((a, b) => a + b, 0);

  let accumulatedPercent = 0;
  const segments = Object.keys(expenseTotals).map(cat => {
    const amt = expenseTotals[cat];
    const pct = grandTotalExpenses === 0 ? 0 : amt / grandTotalExpenses;
    const strokeLength = pct * 314.159;
    const strokeOffset = 314.159 - (accumulatedPercent * 314.159);
    accumulatedPercent += pct;
    return {
      category: cat,
      amount: amt,
      percentage: Math.round(pct * 100),
      strokeLength,
      strokeOffset,
      color: expenseColors[cat] || '#ccc'
    };
  });

  // Build the conic-gradient string for a pixel-perfect donut representation
  let currentPercent = 0;
  const gradientParts = [];
  const activeSegments = segments.filter(s => s.amount > 0);

  if (activeSegments.length === 0) {
    gradientParts.push('rgba(255, 255, 255, 0.05) 0% 100%');
  } else {
    activeSegments.forEach(seg => {
      const nextPercent = currentPercent + (seg.amount / grandTotalExpenses) * 100;
      gradientParts.push(`${seg.color} ${currentPercent}% ${nextPercent}%`);
      currentPercent = nextPercent;
    });
  }
  const conicGradientString = `conic-gradient(${gradientParts.join(', ')})`;

  // Calculate stock in bodega for each berry
  const bodegaStockByBerry = { Fresa: 0, Arándano: 0, Frambuesa: 0, Mora: 0 };
  filteredPurchases.forEach(p => {
    if (p.storageLocation === 'BODEGA') {
      bodegaStockByBerry[p.berry] = (bodegaStockByBerry[p.berry] || 0) + p.remainingKg;
    }
  });

  const maxStock = Math.max(...Object.values(bodegaStockByBerry), 1000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-gradient-strawberry">Panel de Control General</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            Consolidado administrativo, compras de fruta en báscula y seguimiento de ventas internacionales.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-success" style={{ padding: '8px 14px' }}>
            <span className="pulse-dot"></span> Planta Zamora: Conectada
          </span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(96, 108, 56, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Período de Análisis</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {filterStart && filterEnd ? `Mostrando datos del ${filterStart} al ${filterEnd}` : 'Mostrando todo el historial de datos'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedBerryFilter}
            onChange={(e) => setSelectedBerryFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px', fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <option value="Todos">Fruto: Todos</option>
            <option value="Fresa">Fresa</option>
            <option value="Arándano">Arándano</option>
            <option value="Frambuesa">Frambuesa</option>
            <option value="Mora">Mora</option>
          </select>

          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="form-select"
            style={{ width: '180px', fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <option value="ALL">Todo el Historial</option>
            <option value="TODAY">Hoy</option>
            <option value="7_DAYS">Últimos 7 Días</option>
            <option value="30_DAYS">Últimos 30 Días</option>
            <option value="THIS_MONTH">Este Mes</option>
            <option value="LAST_MONTH">Mes Anterior</option>
            <option value="CUSTOM">Rango Personalizado</option>
          </select>

          {datePreset === 'CUSTOM' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: '145px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>a</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: '145px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI 1: Compras */}
        <div className="glass-panel card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Fruta Ingresada (Compras)
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(96, 108, 56, 0.1)', color: 'var(--color-strawberry)' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
            {totalKgsReceived.toLocaleString()} kg
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>Inversión: <strong style={{ color: 'var(--text-primary)' }}>${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN</strong></span>
            <span>Costo Promedio: <strong style={{ color: 'var(--text-primary)' }}>${avgCostPerKg.toFixed(2)} MXN/kg</strong></span>
          </p>
        </div>

        {/* KPI 2: Ventas */}
        <div className="glass-panel card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Fruta Despachada (Ventas)
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blueberry)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
            {totalKgsSold.toLocaleString()} kg
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>Facturado: <strong style={{ color: 'var(--text-primary)' }}>${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN</strong></span>
            <span>Precio Promedio: <strong style={{ color: 'var(--text-primary)' }}>${avgPricePerKg.toFixed(2)} MXN/kg</strong></span>
          </p>
        </div>

        {/* KPI 3: Margen / Ganancia */}
        <div className="glass-panel card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Utilidad Bruta Real
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-success)' }}>$</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-title)', color: 'var(--color-success)' }}>
            +${totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Retorno de venta comercial
          </p>
        </div>

        {/* KPI 4: Total Gastos Operativos */}
        <div className="glass-panel card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Gastos Operativos
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(96, 108, 56, 0.1)', color: 'var(--color-strawberry)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-title)', color: 'var(--color-strawberry-hover)' }}>
            -${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Empaque, fletes, nómina e insumos
          </p>
          {selectedBerryFilter !== 'Todos' && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
              * Gastos totales de planta (no segmentados)
            </p>
          )}
        </div>

        {/* KPI 5: Utilidad Neta */}
        <div className="glass-panel card-hover" style={{ padding: '24px', boxShadow: netProfit >= 0 ? '0 8px 30px rgba(16, 185, 129, 0.08)' : '0 8px 30px rgba(96, 108, 56, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Utilidad Neta Ajustada
            </span>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              background: netProfit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(96, 108, 56, 0.15)',
              color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-strawberry)'
            }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '4px',
            fontFamily: 'var(--font-title)',
            color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-strawberry-hover)'
          }}>
            {netProfit < 0 ? '-' : '+'}${Math.abs(netProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', margin: 0 }}>
            <span>Ganancia neta tras gastos</span>
            <span>Margen Neto: <strong style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-strawberry-hover)' }}>{netMarginPercent.toFixed(1)}%</strong></span>
          </p>
          {selectedBerryFilter !== 'Todos' && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
              * Utilidad con gastos totales cargados
            </p>
          )}
        </div>

        {/* KPI 6: Inventario & Tránsito */}
        <div className="glass-panel card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Inventario & Tránsito
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <Package size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
            {inStockCount} Lotes
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {pendingInspectionCount} pendientes | {transitCount} en ruta
          </p>
        </div>
      </div>

      {/* Sección de Créditos y Finanzas B2B */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0 }}>
          <span style={{ width: '4px', height: '18px', background: 'var(--color-blueberry)', borderRadius: '2px', display: 'inline-block' }}></span>
          Balance de Créditos B2B y Cuentas por Cobrar/Pagar
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {/* Cuentas por Cobrar */}
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid var(--panel-border)', borderRadius: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Por Cobrar (Clientes B2B)
              </span>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blueberry)' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px', fontFamily: 'var(--font-title)', color: 'var(--color-blueberry)' }}>
              ${totalReceivable.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Créditos pendientes de cobro por ventas
            </p>
          </div>

          {/* Cuentas por Pagar */}
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid var(--panel-border)', borderRadius: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Por Pagar (Productores)
              </span>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                <Wallet size={16} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px', fontFamily: 'var(--font-title)', color: 'var(--color-danger)' }}>
              ${totalPayable.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Saldos pendientes de pago por fruta fresca
            </p>
          </div>

          {/* Balance Financiero Neto */}
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid var(--panel-border)', borderRadius: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Balance de Cartera Neto
              </span>
              <div style={{
                padding: '6px',
                borderRadius: '6px',
                background: creditsBalance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                color: creditsBalance >= 0 ? 'var(--color-success)' : 'var(--color-warning)'
              }}>
                <ArrowUpRight size={16} />
              </div>
            </div>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: '2px',
              fontFamily: 'var(--font-title)',
              color: creditsBalance >= 0 ? 'var(--color-success)' : 'var(--color-warning)'
            }}>
              {creditsBalance < 0 ? '-' : '+'}${Math.abs(creditsBalance).toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Saldo proyectado neto de cobranza
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
      }} className="responsive-chart-grid">
        {/* SVG Bar Chart for Warehouse Stock */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Stock Actual en Bodega</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kilos en cámaras de refrigeración disponibles para venta</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Bodega: {Object.values(bodegaStockByBerry).reduce((a, b) => a + b, 0).toLocaleString()} kg
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', height: '240px', width: '100%' }}>
            <svg viewBox="0 0 600 220" style={{ width: '100%', height: '100%' }}>
              {/* Gridlines */}
              <line x1="60" y1="20" x2="560" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="65" x2="560" y2="65" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="110" x2="560" y2="110" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="155" x2="560" y2="155" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="175" x2="560" y2="175" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              
              {/* Y-Axis Labels */}
              <text x="10" y="24" fill="var(--text-muted)" fontSize="9">{(maxStock).toLocaleString()} kg</text>
              <text x="10" y="102" fill="var(--text-muted)" fontSize="9">{(maxStock / 2).toLocaleString()} kg</text>
              <text x="10" y="179" fill="var(--text-muted)" fontSize="9">0 kg</text>
              
              {/* Bars */}
              {['Fresa', 'Arándano', 'Frambuesa', 'Mora'].map((berry, index) => {
                const kgs = bodegaStockByBerry[berry] || 0;
                const barHeight = (kgs / maxStock) * 150; // max height is 150px
                const xPos = 110 + index * 120; // 110, 230, 350, 470
                const yPos = 175 - barHeight;

                return (
                  <g key={berry}>
                    {/* Background track */}
                    <rect
                      x={xPos}
                      y="25"
                      width="40"
                      height="150"
                      rx="6"
                      fill="rgba(255,255,255,0.02)"
                    />
                    {/* Actual value bar */}
                    {kgs > 0 && (
                      <rect
                        x={xPos}
                        y={yPos}
                        width="40"
                        height={barHeight}
                        rx="6"
                        fill={berryColors[berry] || '#ccc'}
                        style={{ 
                          filter: `drop-shadow(0px 4px 10px ${berryColors[berry]}33)`,
                          transition: 'height 0.5s ease, y 0.5s ease'
                        }}
                      />
                    )}
                    {/* Kgs Label */}
                    <text
                      x={xPos + 20}
                      y={kgs > 0 ? yPos - 8 : 170}
                      fill={kgs > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {kgs.toLocaleString()}
                    </text>
                    {/* X-Axis Label */}
                    <text
                      x={xPos + 20}
                      y="198"
                      fill="var(--text-secondary)"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {berry}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Variety shares */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Estatus del Stock por Fruto</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kilos en cámara esperando despacho</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Fresa', 'Arándano', 'Frambuesa', 'Mora'].map(b => {
              const bKgs = filteredPurchases.filter(p => p.berry === b && p.remainingKg > 0).reduce((sum, p) => sum + p.remainingKg, 0);
              const totalUnsoldKgs = filteredPurchases.reduce((sum, p) => sum + p.remainingKg, 0) || 1;
              const percent = Math.round((bKgs / totalUnsoldKgs) * 100);
              
              return (
                <div key={b}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{b}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{bKgs.toLocaleString()} kg ({percent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: berryColors[b] || 'var(--color-success)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Row: Shipments tracking & Expense pie chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginTop: '8px'
      }} className="responsive-chart-grid">
        
        {/* Recent sales with status and tracking */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Estatus y Seguimiento de Despachos</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seguimiento en vivo de las órdenes de exportación facturadas.</p>
            </div>

            {/* Filter */}
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--panel-border)'
            }}>
              {['Todos', 'Fresa', 'Arándano', 'Frambuesa', 'Mora'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedBerryFilter(filter)}
                  style={{
                    border: 'none',
                    background: selectedBerryFilter === filter ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    color: selectedBerryFilter === filter ? 'white' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: selectedBerryFilter === filter ? 600 : 500,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {filteredShipments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                No se han registrado despachos para este filtro comercial.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Venta ID</th>
                    <th>Cliente</th>
                    <th>Berry</th>
                    <th>Cantidad (Kg)</th>
                    <th>Ingreso Total</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.id}</td>
                      <td>{s.client}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: berryColors[s.berry] || '#ccc' }}></span>
                          {s.berry}
                        </span>
                      </td>
                      <td>{s.kg.toLocaleString()} kg</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                        ${s.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                      </td>
                      <td>
                        {s.status === 'Empaque' && <span className="badge badge-blue">Empaque</span>}
                        {s.status === 'Cámara de Frío' && <span className="badge badge-blue">Cámara de Frío</span>}
                        {s.status === 'En Puerto' && <span className="badge badge-warning">En Puerto</span>}
                        {s.status === 'En Ruta Marítima' && <span className="badge badge-blue"><span className="pulse-dot" style={{ backgroundColor: 'var(--color-blueberry)' }}></span>Marítimo</span>}
                        {s.status === 'En Ruta Terrestre' && <span className="badge badge-blue"><span className="pulse-dot" style={{ backgroundColor: 'var(--color-blueberry)' }}></span>Terrestre</span>}
                        {s.status === 'Entregado' && <span className="badge badge-success">Entregado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expenses Pie/Donut Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Distribución de Gastos</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Egresos clasificados por tipo de operación</p>
            {selectedBerryFilter !== 'Todos' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                * Mostrando egresos totales de la planta (no segmentados por fruta)
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '180px', alignItems: 'center' }}>
            <div style={{
              width: '145px',
              height: '145px',
              borderRadius: '50%',
              background: conicGradientString,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              {/* Inner Hole for Donut Effect */}
              <div style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 3px 8px rgba(30, 58, 138, 0.08)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>GASTOS</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-strawberry-hover)', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
                  ${grandTotalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Legend and progress bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {segments.map(seg => (
              <div key={seg.category} style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color }}></span>
                    {seg.category}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    ${seg.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({seg.percentage}%)
                  </span>
                </div>
                 <div style={{ width: '100%', height: '4px', background: 'rgba(30, 58, 138, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${seg.percentage}%`, height: '100%', background: seg.color, borderRadius: '2px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <style>{`
        @media (max-width: 900px) {
          .responsive-chart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
