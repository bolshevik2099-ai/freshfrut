import React, { useState, useEffect } from 'react';
import { Truck, Scale, DollarSign, User, ShieldCheck, Tag, Anchor, Eye, Edit2, Trash2, X, Plus, Calendar } from 'lucide-react';

export default function SalesForm({ purchases, sales, addSale, updatePurchaseSaleStatus, deleteSale, editSale, clients }) {
  // Available lots are those approved or warned by QC, and have remaining kilograms
  const availableLots = purchases.filter(p => 
    (p.qcStatus === 'APPROVED' || p.qcStatus === 'WARNING') && 
    p.remainingKg > 0
  );

  const [selectedLotId, setSelectedLotId] = useState(availableLots[0]?.id || '');
  const [client, setClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [isCredit, setIsCredit] = useState('NO');
  const [priceSoldPerKg, setPriceSoldPerKg] = useState(70.00);
  const [kgToSell, setKgToSell] = useState(0);
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [containerId, setContainerId] = useState('');
  const [status, setStatus] = useState('Empaque');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'details', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Date Filter States
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Helper to determine start and end date based on simulated date "2026-06-03"
  const getFilterRange = () => {
    const today = new Date('2026-06-03');
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

  const isWithinDateRange = (itemDate) => {
    if (!itemDate) return true;
    if (filterStart && itemDate < filterStart) return false;
    if (filterEnd && itemDate > filterEnd) return false;
    return true;
  };

  const dateFilteredSales = sales.filter(s => isWithinDateRange(s.date));

  // Edit fields
  const [editClient, setEditClient] = useState('');
  const [editKg, setEditKg] = useState(0);
  const [editPriceSoldPerKg, setEditPriceSoldPerKg] = useState(0);
  const [editStatus, setEditStatus] = useState('Empaque');
  const [editContainerId, setEditContainerId] = useState('');
  const [editShippingLine, setEditShippingLine] = useState('');

  const selectedLot = purchases.find(p => p.id === selectedLotId);

  // Auto-fill price suggestion and max kg when lot changes
  useEffect(() => {
    if (selectedLot) {
      setKgToSell(selectedLot.remainingKg);
      setPriceSoldPerKg(parseFloat((selectedLot.pricePerKg * 1.5).toFixed(2)));
    } else {
      setKgToSell(0);
    }
  }, [selectedLotId, purchases]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalClient = client === 'OTRO' ? customClient : client;
    if (!selectedLotId || !finalClient || kgToSell <= 0) return;

    if (kgToSell > selectedLot.remainingKg) {
      setErrorMsg(`No puedes vender más de los kilos disponibles (${selectedLot.remainingKg.toLocaleString()} kg).`);
      return;
    }

    const saleId = `EXP-${selectedLot.berry.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalRevenue = kgToSell * priceSoldPerKg;
    const costOfSoldPortion = kgToSell * selectedLot.pricePerKg;
    const profit = totalRevenue - costOfSoldPortion;

    const newSale = {
      id: saleId,
      purchaseId: selectedLotId,
      berry: selectedLot.berry,
      variety: selectedLot.variety,
      kg: kgToSell,
      client: finalClient,
      priceSoldPerKg,
      totalRevenue,
      profit,
      shippingLine,
      containerId: containerId || 'N/A',
      status,
      date: new Date().toISOString().split('T')[0]
    };

    addSale(newSale, isCredit === 'SI');
    updatePurchaseSaleStatus(selectedLotId, kgToSell);
    setIsSuccess(true);
    setErrorMsg('');
    
    setClient('');
    setCustomClient('');
    setIsCredit('NO');
    setContainerId('');
    setStatus('Empaque');

    const updatedLot = purchases.find(p => p.id === selectedLotId);
    const updatedRemaining = updatedLot ? (updatedLot.remainingKg - kgToSell) : 0;
    
    if (updatedRemaining <= 0) {
      const remainingLots = availableLots.filter(l => l.id !== selectedLotId);
      setSelectedLotId(remainingLots[0]?.id || '');
    } else {
      setKgToSell(updatedRemaining);
    }

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setActiveModal('details');
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditClient(item.client);
    setEditKg(item.kg);
    setEditPriceSoldPerKg(item.priceSoldPerKg);
    setEditStatus(item.status);
    setEditContainerId(item.containerId);
    setEditShippingLine(item.shippingLine);
    setActiveModal('edit');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updatedSale = {
      client: editClient,
      kg: editKg,
      priceSoldPerKg: editPriceSoldPerKg,
      status: editStatus,
      containerId: editContainerId,
      shippingLine: editShippingLine
    };

    editSale(selectedItem.id, updatedSale);
    setActiveModal(null);
    setSelectedItem(null);
  };

  const getSourceLot = (purchaseId) => {
    return purchases.find(p => p.id === purchaseId) || {};
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient-strawberry">Venta & Despacho de Exportación</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            Monitorea el historial de ventas internacionales y gestiona el estatus de tránsito de contenedores.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)', border: 'none', color: 'white' }}
        >
          <Plus size={18} /> Registrar Despacho / Venta
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1px solid var(--panel-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>Período de Ventas</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {filterStart && filterEnd ? `Mostrando exportaciones del ${filterStart} al ${filterEnd}` : 'Mostrando todo el historial de ventas'}
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

      {isSuccess && (
        <div className="badge badge-success" style={{ padding: '12px', borderRadius: '8px', display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
          ✓ Venta registrada y descontada del inventario físico.
        </div>
      )}

      {errorMsg && !showRegisterModal && (
        <div className="badge badge-danger" style={{ padding: '12px', borderRadius: '8px', display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* List of active sales (Full width history) */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
          Historial de Ventas & Exportaciones
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Venta ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Berry (Variedad)</th>
                <th>Kilos Vendidos</th>
                <th>Costo Compra</th>
                <th>Ingreso Total</th>
                <th>Ganancia Neta</th>
                <th>Contenedor / Naviera</th>
                <th>Estatus Logístico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dateFilteredSales.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.id}</td>
                  <td>{s.date || '2026-06-02'}</td>
                  <td>{s.client}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.berry}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.variety}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.kg.toLocaleString()} kg</td>
                  <td>
                    ${(s.kg * (getSourceLot(s.purchaseId).pricePerKg || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-blueberry)' }}>
                    ${s.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    +${s.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.85rem' }}>{s.containerId}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.shippingLine}</span>
                  </td>
                  <td>
                    <span className="badge badge-blue">{s.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openDetails(s)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(s)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteSale(s.id)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-danger)' }} title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REGISTRATION MODAL --- */}
      {showRegisterModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form
            onSubmit={(e) => {
              const finalClient = client === 'OTRO' ? customClient : client;
              if (selectedLotId && finalClient && kgToSell > 0 && kgToSell <= (selectedLot?.remainingKg || 0)) {
                handleSubmit(e);
                setShowRegisterModal(false);
              } else {
                handleSubmit(e); // Let validation error trigger
              }
            }}
            className="glass-panel modal-content"
            style={{ ...modalContentStyle, maxWidth: '600px' }}
          >
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="var(--color-blueberry)" />
                Registrar Despacho / Venta
              </h3>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {errorMsg && (
                <div className="badge badge-danger" style={{ padding: '10px', borderRadius: '8px', display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}

              {availableLots.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--panel-border)',
                  padding: '30px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <ShieldCheck size={36} style={{ color: 'var(--warning)', marginBottom: '12px', display: 'inline' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No hay lotes aprobados con kilos disponibles para vender.</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Primero debes registrar compras y aprobarlas en **Control de Calidad**.
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Seleccionar Lote Aprobado (Inventario)</label>
                    <select
                      value={selectedLotId}
                      onChange={(e) => setSelectedLotId(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="" disabled>Selecciona un lote...</option>
                      {availableLots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.id} - {l.berry} ({l.variety}) | Disp: {l.remainingKg.toLocaleString()} kg | QC: {l.qcStatus}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Seleccionar Cliente</label>
                      <select
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="form-select"
                        required
                      >
                        <option value="" disabled>-- Elige un cliente --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.name}>{c.name} ({c.country})</option>
                        ))}
                        <option value="OTRO">+ Registrar otro (Campo libre temporal)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Venta a Crédito?</label>
                      <select
                        value={isCredit}
                        onChange={(e) => setIsCredit(e.target.value)}
                        className="form-select"
                      >
                        <option value="NO">No (De Contado)</option>
                        <option value="SI">Sí (A Crédito)</option>
                      </select>
                    </div>
                  </div>

                  {client === 'OTRO' && (
                    <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <label className="form-label">Nombre del Cliente (Campo Libre)</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          placeholder="Escribe el nombre del cliente o recibidor"
                          value={customClient}
                          onChange={(e) => setCustomClient(e.target.value)}
                          className="form-input"
                          style={{ width: '100%', paddingLeft: '36px' }}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Kilos a Vender</label>
                      <div style={{ position: 'relative' }}>
                        <Scale size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                        <input
                          type="number"
                          value={kgToSell}
                          onChange={(e) => setKgToSell(Math.max(1, parseInt(e.target.value) || 0))}
                          className="form-input"
                          style={{ width: '100%', paddingLeft: '36px' }}
                          max={selectedLot?.remainingKg || 999999}
                          min={1}
                          required
                        />
                      </div>
                      {selectedLot && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Máximo disponible: {selectedLot.remainingKg.toLocaleString()} kg
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Precio Venta por Kg (MXN)</label>
                      <div style={{ position: 'relative' }}>
                        <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                        <input
                          type="number"
                          step="0.01"
                          value={priceSoldPerKg}
                          onChange={(e) => setPriceSoldPerKg(Math.max(0.1, parseFloat(e.target.value) || 0))}
                          className="form-input"
                          style={{ width: '100%', paddingLeft: '36px' }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Estatus de Fruta vendido</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-select"
                      >
                        <option value="Empaque">Empaque (Packing)</option>
                        <option value="Cámara de Frío">Cámara de Frío</option>
                        <option value="En Puerto">En Puerto</option>
                        <option value="En Ruta Marítima">En Ruta Marítima</option>
                        <option value="En Ruta Terrestre">En Ruta Terrestre</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Naviera / Transportista</label>
                      <div style={{ position: 'relative' }}>
                        <Anchor size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          placeholder="Ej: Hapag-Lloyd, MSC..."
                          value={shippingLine}
                          onChange={(e) => setShippingLine(e.target.value)}
                          className="form-input"
                          style={{ width: '100%', paddingLeft: '36px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cód. Contenedor (Reefer)</label>
                    <div style={{ position: 'relative' }}>
                      <Tag size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Ej: HLXU-448291-0"
                        value={containerId}
                        onChange={(e) => setContainerId(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', paddingLeft: '36px' }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Revenue Display */}
                  {selectedLotId && (
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--panel-border)',
                      padding: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '8px'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ingreso Estimado de Venta:</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--color-blueberry)' }}>
                        ${(kgToSell * priceSoldPerKg).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                      </strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                    <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)' }}>
                      Registrar Venta
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {activeModal === 'details' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Ficha de Venta: {selectedItem.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}><span>Lote Origen:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{selectedItem.purchaseId}</strong></div>
              <div style={detailRowStyle}><span>Cliente:</span> <strong>{selectedItem.client}</strong></div>
              <div style={detailRowStyle}><span>Cultivo:</span> <strong>{selectedItem.berry} ({selectedItem.variety})</strong></div>
              <div style={detailRowStyle}><span>Kilos Vendidos:</span> <strong>{selectedItem.kg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Precio Venta:</span> <strong>${selectedItem.priceSoldPerKg.toFixed(2)} MXN / kg</strong></div>
              <div style={detailRowStyle}><span>Facturado Total:</span> <strong style={{ color: 'var(--color-blueberry)' }}>${selectedItem.totalRevenue.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Costo de Compra (Proporcional):</span> <strong>${(selectedItem.kg * (getSourceLot(selectedItem.purchaseId).pricePerKg || 0)).toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Utilidad Generada:</span> <strong style={{ color: 'var(--color-success)' }}>+${selectedItem.profit.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Naviera / Transportista:</span> <strong>{selectedItem.shippingLine}</strong></div>
              <div style={detailRowStyle}><span>Contenedor Reefer:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{selectedItem.containerId}</strong></div>
              <div style={detailRowStyle}><span>Fecha Despacho:</span> <strong>{selectedItem.date}</strong></div>
              <div style={detailRowStyle}><span>Estatus Logístico:</span> 
                <strong>
                  <span className="badge badge-blue">{selectedItem.status}</span>
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Venta: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Cliente / Recibidor</label>
                <input type="text" value={editClient} onChange={(e) => setEditClient(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad Vendida (Kg)</label>
                <input 
                  type="number" 
                  value={editKg} 
                  onChange={(e) => setEditKg(parseInt(e.target.value) || 0)} 
                  className="form-input" 
                  required 
                  max={selectedItem.kg + (getSourceLot(selectedItem.purchaseId).remainingKg || 0)}
                  min={1} 
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Máximo disponible (sumando stock del lote): {selectedItem.kg + (getSourceLot(selectedItem.purchaseId).remainingKg || 0)} kg
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Precio Venta por Kg (MXN)</label>
                <input type="number" step="0.01" value={editPriceSoldPerKg} onChange={(e) => setEditPriceSoldPerKg(parseFloat(e.target.value) || 0)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Estatus Logístico</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-select">
                  <option value="Empaque">Empaque (Packing)</option>
                  <option value="Cámara de Frío">Cámara de Frío</option>
                  <option value="En Puerto">En Puerto</option>
                  <option value="En Ruta Marítima">En Ruta Marítima</option>
                  <option value="En Ruta Terrestre">En Ruta Terrestre</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contenedor</label>
                  <input type="text" value={editContainerId} onChange={(e) => setEditContainerId(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Naviera</label>
                  <input type="text" value={editShippingLine} onChange={(e) => setEditShippingLine(e.target.value)} className="form-input" />
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
    </div>
  );
}

// Reusable styling objects
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
