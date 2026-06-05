import React, { useState } from 'react';
import { Wallet, Plus, Calendar, FileText, DollarSign, Tag, Edit2, Trash2, X, Eye } from 'lucide-react';

export default function ExpensesList({ expenses, addExpense, editExpense, deleteExpense }) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Empaque');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'edit', 'details'
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('Empaque');
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState('');

  // Categories and colors
  const expenseCategories = ['Empaque', 'Logística', 'Nómina', 'Insumos', 'Otros'];
  const categoryColors = {
    'Empaque': 'var(--color-strawberry)',
    'Logística': 'var(--color-blackberry)',
    'Nómina': 'var(--color-blueberry)',
    'Insumos': 'var(--warning)',
    'Otros': 'var(--text-muted)'
  };

  // Helper to determine start and end date of the selected preset based on "today" = 2026-06-03
  const getFilterRange = () => {
    const today = new Date('2026-06-03'); // Anchor today's date to system time for simulation
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

  // Filtering function for date
  const isWithinDateRange = (itemDate) => {
    if (!itemDate) return true;
    if (filterStart && itemDate < filterStart) return false;
    if (filterEnd && itemDate > filterEnd) return false;
    return true;
  };

  const dateFilteredExpenses = expenses.filter(e => isWithinDateRange(e.date));

  // KPIs calculations using filtered expenses
  const totalExpenses = dateFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate top category
  const expenseTotals = {};
  expenseCategories.forEach(cat => { expenseTotals[cat] = 0; });
  dateFilteredExpenses.forEach(e => {
    if (expenseTotals[e.type] !== undefined) {
      expenseTotals[e.type] += e.amount;
    } else {
      expenseTotals['Otros'] += e.amount;
    }
  });
  
  let topCategory = 'N/A';
  let maxAmount = 0;
  Object.keys(expenseTotals).forEach(cat => {
    if (expenseTotals[cat] > maxAmount) {
      maxAmount = expenseTotals[cat];
      topCategory = cat;
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const id = `GAS-${Math.floor(100 + Math.random() * 900)}`;
    const newExpense = {
      id,
      description,
      type,
      amount: parseFloat(amount),
      date
    };

    addExpense(newExpense);
    setIsSuccess(true);

    // Reset form
    setDescription('');
    setType('Empaque');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);

    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setActiveModal('details');
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditDescription(item.description);
    setEditType(item.type);
    setEditAmount(item.amount);
    setEditDate(item.date);
    setActiveModal('edit');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    editExpense(selectedItem.id, {
      description: editDescription,
      type: editType,
      amount: parseFloat(editAmount) || 0,
      date: editDate
    });

    setActiveModal(null);
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Gastos de Operación</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Registra y clasifica egresos operativos (materiales, fletes, nóminas y suministros) para medir la utilidad neta de la planta.
        </p>
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
            background: 'rgba(5, 150, 105, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Período de Análisis de Gastos</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {filterStart && filterEnd ? `Mostrando gastos del ${filterStart} al ${filterEnd}` : 'Mostrando todos los gastos registrados'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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

      {/* KPIs Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI: Total Gastos */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(5, 150, 105, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Gastos de Operación Totales</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--color-strawberry-hover)' }}>
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
            </h3>
          </div>
        </div>

        {/* KPI: Categoría Mayoritaria */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-blueberry)'
          }}>
            <Tag size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Categoría Mayor Gastos</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              {topCategory} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>(${maxAmount.toLocaleString()} MXN)</span>
            </h3>
          </div>
        </div>

        {/* KPI: Transacciones Registradas */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-success)'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Egresos Registrados</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--color-success)' }}>
              {dateFilteredExpenses.length} Transacciones
            </h3>
          </div>
        </div>
      </div>

      {/* Main Form & Table Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        gap: '24px'
      }} className="responsive-expenses-grid">
        
        {/* Form panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} color="var(--color-strawberry)" />
            Registrar Egreso / Gasto
          </h3>

          {isSuccess && (
            <div className="badge badge-success" style={{ padding: '10px', borderRadius: '8px', display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
              ✓ Gasto registrado con éxito en el balance operativo.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Descripción del Gasto</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Ej: Fletes a puerto, Compra fertilizantes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clasificación / Tipo</label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '36px' }}
                  required
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Monto (MXN)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0.01, parseFloat(e.target.value) || ''))}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha del Gasto</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
              <Plus size={18} /> Registrar Egreso
            </button>
          </form>
        </div>

        {/* Directory Table panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
            Directorio de Gastos Operativos
          </h3>

          <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Monto (MXN)</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dateFilteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No se han registrado egresos en este periodo.
                    </td>
                  </tr>
                ) : (
                  dateFilteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{e.id}</td>
                      <td style={{ fontWeight: 600 }}>{e.description}</td>
                      <td>
                        <span className="badge" style={{
                          fontSize: '0.65rem',
                          background: `${categoryColors[e.type]}15`,
                          color: categoryColors[e.type],
                          borderColor: `${categoryColors[e.type]}30`
                        }}>
                          {e.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-strawberry-hover)' }}>
                        -${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{e.date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openDetails(e)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(e)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteExpense(e.id)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-danger)' }} title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {activeModal === 'details' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Detalles de Egreso: {selectedItem.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}><span>Descripción:</span> <strong>{selectedItem.description}</strong></div>
              <div style={detailRowStyle}><span>Clasificación:</span> 
                <strong>
                  <span className="badge" style={{
                    fontSize: '0.7rem',
                    background: `${categoryColors[selectedItem.type]}15`,
                    color: categoryColors[selectedItem.type],
                    borderColor: `${categoryColors[selectedItem.type]}30`
                  }}>
                    {selectedItem.type}
                  </span>
                </strong>
              </div>
              <div style={detailRowStyle}><span>Monto Egresado:</span> <strong style={{ color: 'var(--color-strawberry-hover)' }}>-${selectedItem.amount.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Fecha Registro:</span> <strong>{selectedItem.date}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Egreso: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Descripción del Gasto</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Clasificación / Tipo</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)} className="form-select" required>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto (MXN)</label>
                <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)} className="form-input" required min={0.01} />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha del Gasto</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="form-input" required />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Modal styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(3, 3, 10, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '480px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--panel-border)',
  paddingBottom: '12px',
  marginBottom: '10px'
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  paddingBottom: '6px'
};
