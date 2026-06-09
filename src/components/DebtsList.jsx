import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, User, Calendar, CreditCard, CheckCircle, X, Filter, Eye, Edit2, Trash2 } from 'lucide-react';

export default function DebtsList({ debts, registerDebtPayment, editDebt, deleteDebt, suppliers, clients }) {
  const [activeDebtType, setActiveDebtType] = useState('RECEIVABLE'); // 'RECEIVABLE' (A Favor) or 'PAYABLE' (En Contra)
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Modal control states
  const [activeModal, setActiveModal] = useState(null); // 'payment', 'details', 'edit'
  const [selectedDebt, setSelectedDebt] = useState(null);

  // Payment registration states
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Edit form states
  const [editEntityName, setEditEntityName] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editRemainingAmount, setEditRemainingAmount] = useState(0);
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editDate, setEditDate] = useState('');

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

  // Filtering function for date
  const isWithinDateRange = (itemDate) => {
    if (!itemDate) return true;
    if (filterStart && itemDate < filterStart) return false;
    if (filterEnd && itemDate > filterEnd) return false;
    return true;
  };

  const dateFilteredDebts = debts.filter(d => isWithinDateRange(d.date));

  // Calculate KPIs using date filtered debts
  const totalReceivable = dateFilteredDebts
    .filter(d => d.type === 'RECEIVABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalPayable = dateFilteredDebts
    .filter(d => d.type === 'PAYABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const netBalance = totalReceivable - totalPayable;

  // Filter debts
  const filteredDebts = dateFilteredDebts.filter(d => {
    if (d.type !== activeDebtType) return false;
    if (selectedEntity !== 'ALL' && d.entityName !== selectedEntity) return false;
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'PENDING' && d.status === 'PAID') return false;
      if (selectedStatus === 'PAID' && d.status !== 'PAID') return false;
    }
    return true;
  });

  // Get available entities for select filter depending on active debt type
  const availableEntities = activeDebtType === 'RECEIVABLE'
    ? Array.from(new Set(dateFilteredDebts.filter(d => d.type === 'RECEIVABLE').map(d => d.entityName)))
    : Array.from(new Set(dateFilteredDebts.filter(d => d.type === 'PAYABLE').map(d => d.entityName)));

  const handleOpenPayment = (debt) => {
    setSelectedDebt(debt);
    setPaymentAmount(debt.remainingAmount); // default to full outstanding amount
    setActiveModal('payment');
  };

  const handleOpenDetails = (debt) => {
    setSelectedDebt(debt);
    setActiveModal('details');
  };

  const handleOpenEdit = (debt) => {
    setSelectedDebt(debt);
    setEditEntityName(debt.entityName);
    setEditAmount(debt.amount);
    setEditRemainingAmount(debt.remainingAmount);
    setEditStatus(debt.status);
    setEditDate(debt.date);
    setActiveModal('edit');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedDebt || paymentAmount <= 0) return;

    if (paymentAmount > selectedDebt.remainingAmount) {
      alert(`El abono no puede ser mayor al saldo pendiente de $${selectedDebt.remainingAmount.toLocaleString()} MXN`);
      return;
    }

    registerDebtPayment(selectedDebt.id, parseFloat(paymentAmount));
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setActiveModal(null);
      setSelectedDebt(null);
    }, 2000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedDebt) return;

    const amt = parseFloat(editAmount) || 0;
    const rem = parseFloat(editRemainingAmount) || 0;

    if (rem > amt) {
      alert("El saldo pendiente no puede superar el monto total de la deuda.");
      return;
    }

    editDebt(selectedDebt.id, {
      entityName: editEntityName,
      amount: amt,
      remainingAmount: rem,
      status: editStatus,
      date: editDate
    });

    setActiveModal(null);
    setSelectedDebt(null);
  };

  const handleSettleDebt = (debt) => {
    if (confirm(`¿Estás seguro de liquidar el saldo pendiente total de $${debt.remainingAmount.toLocaleString()} MXN para la cuenta ${debt.id}?`)) {
      registerDebtPayment(debt.id, debt.remainingAmount);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Administración de Deudas & Créditos</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Monitorea y gestiona las cuentas por cobrar a clientes y las cuentas por pagar a productores/proveedores asociados a transacciones de crédito.
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
            background: 'rgba(96, 108, 56, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Período de Análisis de Deudas</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {filterStart && filterEnd ? `Mostrando deudas del ${filterStart} al ${filterEnd}` : 'Mostrando todas las deudas registradas'}
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

      {/* KPI Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI: Cuentas por Cobrar */}
        <div className="glass-panel card-glow-blueberry" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-success)'
          }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>A Favor (Cobros Pendientes)</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--color-success)' }}>
              ${totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>MXN</span>
            </h2>
          </div>
        </div>

        {/* KPI: Cuentas por Pagar */}
        <div className="glass-panel card-glow-strawberry" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(96, 108, 56, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <ArrowDownRight size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>En Contra (Pagos Pendientes)</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--color-strawberry-hover)' }}>
              ${totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>MXN</span>
            </h2>
          </div>
        </div>

        {/* KPI: Balance Neto */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: netBalance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(96, 108, 56, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-strawberry)'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Balance de Cartera Neto</span>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '4px 0 0 0',
              color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-strawberry-hover)'
            }}>
              {netBalance < 0 ? '-' : ''}${Math.abs(netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>MXN</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Filters */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Sub-tab selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--panel-border)',
          paddingBottom: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setActiveDebtType('RECEIVABLE'); setSelectedEntity('ALL'); }}
              className={activeDebtType === 'RECEIVABLE' ? 'btn-primary' : 'btn-secondary'}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                background: activeDebtType === 'RECEIVABLE' ? 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)' : 'transparent',
                border: activeDebtType === 'RECEIVABLE' ? 'none' : '1px solid var(--panel-border)',
                color: activeDebtType === 'RECEIVABLE' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <ArrowUpRight size={16} /> Cuentas por Cobrar (A Favor)
            </button>
            <button
              onClick={() => { setActiveDebtType('PAYABLE'); setSelectedEntity('ALL'); }}
              className={activeDebtType === 'PAYABLE' ? 'btn-primary' : 'btn-secondary'}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                background: activeDebtType === 'PAYABLE' ? 'linear-gradient(135deg, var(--color-strawberry) 0%, var(--color-strawberry-dark) 100%)' : 'transparent',
                border: activeDebtType === 'PAYABLE' ? 'none' : '1px solid var(--panel-border)',
                color: activeDebtType === 'PAYABLE' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <ArrowDownRight size={16} /> Cuentas por Pagar (En Contra)
            </button>
          </div>

          {/* Filtering row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="form-select"
              style={{ width: '200px', fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <option value="ALL">-- Filtrar por Entidad --</option>
              {availableEntities.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ width: '150px', fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PENDING">Pendientes/Parciales</option>
              <option value="PAID">Pagados</option>
            </select>
          </div>
        </div>

        {/* Debts Table */}
        <div className="table-container" style={{ minHeight: '260px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Deuda</th>
                <th>{activeDebtType === 'RECEIVABLE' ? 'Cliente / Recibidor' : 'Proveedor / Agricultor'}</th>
                <th>ID Transacción</th>
                <th>Fecha Emisión</th>
                <th>Monto Total</th>
                <th>Saldo Pendiente</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 10px' }}>
                    No se encontraron registros de crédito pendientes que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredDebts.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{d.id}</td>
                    <td style={{ fontWeight: 600 }}>{d.entityName}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{d.sourceId}</td>
                    <td>{d.date}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, color: d.remainingAmount > 0 ? 'var(--warning)' : 'var(--color-success)' }}>
                      ${d.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {d.status === 'PENDING' && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Pendiente</span>
                      )}
                      {d.status === 'PARTIAL' && (
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Pago Parcial</span>
                      )}
                      {d.status === 'PAID' && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Pagado</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenDetails(d)}
                          className="btn-secondary"
                          style={{ padding: '6px', borderRadius: '6px' }}
                          title="Ver Detalles"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="btn-secondary"
                          style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteDebt(d.id)}
                          className="btn-secondary"
                          style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-strawberry)' }}
                          title="Eliminar Cuenta"
                        >
                          <Trash2 size={14} />
                        </button>
                        {d.remainingAmount > 0 ? (
                          <>
                            <button
                              onClick={() => handleOpenPayment(d)}
                              className="btn-secondary"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: activeDebtType === 'RECEIVABLE' ? 'var(--color-success)' : 'var(--color-strawberry-hover)',
                                borderColor: 'var(--panel-border)'
                              }}
                              title="Registrar Abono"
                            >
                              <CreditCard size={12} /> Abono
                            </button>
                            <button
                              onClick={() => handleSettleDebt(d)}
                              className="btn-primary"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: activeDebtType === 'RECEIVABLE' 
                                  ? 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)' 
                                  : 'linear-gradient(135deg, var(--color-strawberry) 0%, var(--color-strawberry-dark) 100%)',
                                border: 'none',
                                color: 'var(--text-primary)'
                              }}
                              title="Liquidar Cuenta"
                            >
                              <CheckCircle size={12} /> Liquidar
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--color-success)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 500 }}>
                            <CheckCircle size={12} /> Liquidada
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {activeModal === 'details' && selectedDebt && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Detalles de Cuenta: {selectedDebt.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}>
                <span>Tipo de Registro:</span> 
                <strong>{selectedDebt.type === 'RECEIVABLE' ? 'Cuenta por Cobrar (A Favor)' : 'Cuenta por Pagar (En Contra)'}</strong>
              </div>
              <div style={detailRowStyle}>
                <span>{selectedDebt.type === 'RECEIVABLE' ? 'Cliente / Recibidor:' : 'Proveedor / Agricultor:'}</span> 
                <strong>{selectedDebt.entityName}</strong>
              </div>
              <div style={detailRowStyle}>
                <span>Transacción Origen:</span> 
                <strong style={{ fontFamily: 'var(--mono)' }}>{selectedDebt.sourceId}</strong>
              </div>
              <div style={detailRowStyle}>
                <span>Fecha Emisión:</span> 
                <strong>{selectedDebt.date}</strong>
              </div>
              <div style={detailRowStyle}>
                <span>Monto Facturado Total:</span> 
                <strong style={{ color: 'var(--text-primary)' }}>${selectedDebt.amount.toLocaleString()} MXN</strong>
              </div>
              <div style={detailRowStyle}>
                <span>Monto Abonado:</span> 
                <strong style={{ color: 'var(--color-success)' }}>
                  ${(selectedDebt.amount - selectedDebt.remainingAmount).toLocaleString()} MXN
                </strong>
              </div>
              <div style={detailRowStyle}>
                <span>Saldo Pendiente Restante:</span> 
                <strong style={{ color: selectedDebt.remainingAmount > 0 ? 'var(--warning)' : 'var(--color-success)' }}>
                  ${selectedDebt.remainingAmount.toLocaleString()} MXN
                </strong>
              </div>
              <div style={detailRowStyle}>
                <span>Estatus de Cuenta:</span> 
                <strong>
                  {selectedDebt.status === 'PENDING' && <span className="badge badge-warning">Pendiente</span>}
                  {selectedDebt.status === 'PARTIAL' && <span className="badge badge-blue">Pago Parcial</span>}
                  {selectedDebt.status === 'PAID' && <span className="badge badge-success">Totalmente Liquidada</span>}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && selectedDebt && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Cuenta: {selectedDebt.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">{selectedDebt.type === 'RECEIVABLE' ? 'Cliente / Recibidor' : 'Proveedor / Agricultor'}</label>
                <select
                  value={editEntityName}
                  onChange={(e) => setEditEntityName(e.target.value)}
                  className="form-select"
                  required
                >
                  {selectedDebt.type === 'RECEIVABLE' ? (
                    clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                  ) : (
                    suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  )}
                  {/* Let them keep a custom entity name if it was written in free text */}
                  {!clients.some(c => c.name === editEntityName) && !suppliers.some(s => s.name === editEntityName) && (
                    <option value={editEntityName}>{editEntityName} (Entidad Temporal)</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row-responsive">
                <div className="form-group">
                  <label className="form-label">Monto Total (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Saldo Pendiente (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRemainingAmount}
                    onChange={(e) => setEditRemainingAmount(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row-responsive">
                <div className="form-group">
                  <label className="form-label">Estatus de Cuenta</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="PARTIAL">Pago Parcial</option>
                    <option value="PAID">Pagado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha Emisión</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- PAYMENT REGISTER MODAL --- */}
      {activeModal === 'payment' && selectedDebt && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handlePaymentSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Registrar Abono / Pago</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-secondary"
                style={{ padding: '6px' }}
                disabled={isSuccess}
              >
                <X size={16} />
              </button>
            </div>

            {isSuccess ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px 0',
                color: 'var(--color-success)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <CheckCircle size={48} />
                <h4 style={{ margin: 0, fontWeight: 600 }}>✓ Abono registrado con éxito</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  El saldo pendiente de la cuenta {selectedDebt.id} ha sido actualizado.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                
                {/* Info Box */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--panel-border)',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={detailRowStyle}><span>Deuda ID:</span> <strong>{selectedDebt.id}</strong></div>
                  <div style={detailRowStyle}><span>Entidad:</span> <strong>{selectedDebt.entityName}</strong></div>
                  <div style={detailRowStyle}><span>Origen:</span> <strong>{selectedDebt.sourceId}</strong></div>
                  <div style={detailRowStyle}><span>Total Deuda:</span> <strong>${selectedDebt.amount.toLocaleString()} MXN</strong></div>
                  <div style={detailRowStyle}>
                    <span>Saldo Pendiente:</span> 
                    <strong style={{ color: 'var(--warning)' }}>${selectedDebt.remainingAmount.toLocaleString()} MXN</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Monto del Abono / Pago (MXN)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ingresa el monto a pagar"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '36px' }}
                      max={selectedDebt.remainingAmount}
                      min={0.01}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Puedes abonar de forma parcial o liquidar el saldo total de la cuenta.
                  </span>
                </div>

                {/* Simulated payment breakdown */}
                {paymentAmount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0 0 0',
                    borderTop: '1px dashed var(--panel-border)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nuevo Saldo Restante:</span>
                    <strong style={{
                      color: (selectedDebt.remainingAmount - paymentAmount) === 0 ? 'var(--color-success)' : 'var(--warning)',
                      fontSize: '1.05rem'
                    }}>
                      ${(selectedDebt.remainingAmount - paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      background: activeDebtType === 'RECEIVABLE'
                        ? 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)'
                        : 'linear-gradient(135deg, var(--color-strawberry) 0%, var(--color-strawberry-dark) 100%)'
                    }}
                  >
                    Registrar Pago
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// Modal and styling definitions
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
