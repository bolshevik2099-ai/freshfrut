import React, { useState } from 'react';
import { ShoppingCart, Plus, Calendar, User, Scale, DollarSign, MapPin, Eye, Edit2, Trash2, X } from 'lucide-react';

export default function PurchaseForm({ purchases, addPurchase, deletePurchase, editPurchase, suppliers }) {
  const [berry, setBerry] = useState('Fresa');
  const [variety, setVariety] = useState('Albion');
  const [producer, setProducer] = useState('');
  const [customProducer, setCustomProducer] = useState(''); // Optional manual fill field
  const [kg, setKg] = useState(2500);
  const [pricePerKg, setPricePerKg] = useState(45.00);
  const [storageLocation, setStorageLocation] = useState('BODEGA');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastRegisteredId, setLastRegisteredId] = useState('');
  const [isCredit, setIsCredit] = useState('NO');

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Date Filter States
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

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

  const dateFilteredPurchases = purchases.filter(p => isWithinDateRange(p.date));

  // Edit fields
  const [editProducer, setEditProducer] = useState('');
  const [editKg, setEditKg] = useState(0);
  const [editPricePerKg, setEditPricePerKg] = useState(0);
  const [editStorageLocation, setEditStorageLocation] = useState('BODEGA');

  const varietiesByBerry = {
    'Fresa': ['Albion', 'Camino Real', 'Festival'],
    'Arándano': ['Biloxi', 'Legacy', 'Bluecrop'],
    'Frambuesa': ['Heritage', 'Amira', 'Glen Ample'],
    'Mora': ['Tupi', 'Black Butte', 'Loch Ness']
  };

  const handleBerryChange = (e) => {
    const selected = e.target.value;
    setBerry(selected);
    setVariety(varietiesByBerry[selected][0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine producer name
    const finalProducer = producer === 'OTRO' ? customProducer : producer;
    if (!finalProducer) return;

    const id = `LOT-${berry.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = kg * pricePerKg;

    const newPurchase = {
      id,
      berry,
      variety,
      producer: finalProducer,
      kg,
      pricePerKg,
      totalCost,
      storageLocation,
      date,
      qcStatus: 'PENDING',
      saleStatus: 'UNSOLD',
      qcData: null
    };

    addPurchase(newPurchase, isCredit === 'SI');
    setLastRegisteredId(id);
    setIsSuccess(true);
    
    setProducer('');
    setCustomProducer('');
    setKg(2500);
    setPricePerKg(45.00);
    setStorageLocation('BODEGA');
    setIsCredit('NO');

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
    setEditProducer(item.producer);
    setEditKg(item.kg);
    setEditPricePerKg(item.pricePerKg);
    setEditStorageLocation(item.storageLocation);
    setActiveModal('edit');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updatedLot = {
      producer: editProducer,
      kg: editKg,
      pricePerKg: editPricePerKg,
      storageLocation: editStorageLocation
    };

    editPurchase(selectedItem.id, updatedLot);
    setActiveModal(null);
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient-strawberry">Recepción & Compra de Fruta</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            Monitorea el historial de compras y registra el ingreso de lotes de fruta fresca a la planta de empaque.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px' }}
        >
          <Plus size={18} /> Registrar Recepción / Compra
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
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Período de Recepciones</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {filterStart && filterEnd ? `Mostrando recepciones del ${filterStart} al ${filterEnd}` : 'Mostrando todo el historial de recepciones'}
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
          ✓ Lote <strong>{lastRegisteredId}</strong> registrado exitosamente en el inventario.
        </div>
      )}

      {/* List of recent purchases (Full width history) */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
          Historial de Recepciones en Planta
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Lote ID</th>
                <th>Fecha</th>
                <th>Productor / Huerto</th>
                <th>Berry (Variedad)</th>
                <th>Kilos Recibidos</th>
                <th>Precio por Kg</th>
                <th>Costo Total</th>
                <th>Ubicación</th>
                <th>Estatus QC</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dateFilteredPurchases.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{p.id}</td>
                  <td>{p.date}</td>
                  <td>{p.producer}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.berry}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.variety}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.kg.toLocaleString()} kg</td>
                  <td>${p.pricePerKg.toFixed(2)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    ${p.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {p.storageLocation === 'PROVEEDOR' ? (
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem', background: 'rgba(162, 28, 175, 0.15)', color: 'var(--color-blackberry)', borderColor: 'rgba(162, 28, 175, 0.3)' }}>Proveedor</span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Bodega</span>
                    )}
                  </td>
                  <td>
                    {p.qcStatus === 'PENDING' && <span className="badge badge-warning">Por Evaluar</span>}
                    {p.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                    {p.qcStatus === 'WARNING' && <span className="badge badge-warning">Advertencia</span>}
                    {p.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openDetails(p)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(p)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deletePurchase(p.id)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-danger)' }} title="Eliminar">
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
              handleSubmit(e);
              setShowRegisterModal(false);
            }}
            className="glass-panel modal-content"
            style={{ ...modalContentStyle, maxWidth: '600px' }}
          >
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="var(--color-strawberry)" />
                Registrar Recepción / Compra
              </h3>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Berry</label>
                  <select value={berry} onChange={handleBerryChange} className="form-select">
                    <option value="Fresa">Fresa (Strawberry)</option>
                    <option value="Arándano">Arándano (Blueberry)</option>
                    <option value="Frambuesa">Frambuesa (Raspberry)</option>
                    <option value="Mora">Mora (Blackberry)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Variedad de Berry</label>
                  <select value={variety} onChange={(e) => setVariety(e.target.value)} className="form-select">
                    {varietiesByBerry[berry].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Proveedor / Productor</label>
                  <select
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="" disabled>-- Selecciona un Proveedor --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="OTRO">+ Registrar otro (Campo libre temporal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ubicación de Entrada</label>
                  <select value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} className="form-select">
                    <option value="BODEGA">Nuestra Bodega (Planta de Frío)</option>
                    <option value="PROVEEDOR">Alojado por el Proveedor (Rancho)</option>
                  </select>
                </div>
              </div>

              {producer === 'OTRO' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label className="form-label">Nombre del Productor (Campo Libre)</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      placeholder="Escribe el nombre del productor"
                      value={customProducer}
                      onChange={(e) => setCustomProducer(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '36px' }}
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cantidad Recibida (Kg)</label>
                  <div style={{ position: 'relative' }}>
                    <Scale size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="number"
                      value={kg}
                      onChange={(e) => setKg(Math.max(1, parseInt(e.target.value) || 0))}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '36px' }}
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio Compra por Kg (MXN)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="number"
                      step="0.01"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '36px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Pago</label>
                  <select
                    value={isCredit}
                    onChange={(e) => setIsCredit(e.target.value)}
                    className="form-select"
                  >
                    <option value="NO">No (De Contado)</option>
                    <option value="SI">Sí (A Crédito)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Recepción</label>
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
              </div>

              {/* Total Calculation Display */}
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Costo Total de Compra:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-success)' }}>
                  ${(kg * pricePerKg).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Compra</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {activeModal === 'details' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Ficha de Lote: {selectedItem.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}><span>Cultivo:</span> <strong>{selectedItem.berry} ({selectedItem.variety})</strong></div>
              <div style={detailRowStyle}><span>Productor:</span> <strong>{selectedItem.producer}</strong></div>
              <div style={detailRowStyle}><span>Kilos Iniciales:</span> <strong>{selectedItem.kg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Kilos Disponibles:</span> <strong>{selectedItem.remainingKg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Costo Unitario:</span> <strong>${selectedItem.pricePerKg.toFixed(2)} MXN / kg</strong></div>
              <div style={detailRowStyle}><span>Costo Total:</span> <strong style={{ color: 'var(--color-success)' }}>${selectedItem.totalCost.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Ubicación Inicial:</span> <strong>{selectedItem.storageLocation === 'PROVEEDOR' ? 'Alojado por el Proveedor' : 'Bodega (Planta)'}</strong></div>
              <div style={detailRowStyle}><span>Fecha Ingreso:</span> <strong>{selectedItem.date}</strong></div>
              <div style={detailRowStyle}><span>Control de Calidad (QC):</span> 
                <strong>
                  {selectedItem.qcStatus === 'PENDING' && <span className="badge badge-warning">Pendiente</span>}
                  {selectedItem.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                  {selectedItem.qcStatus === 'WARNING' && <span className="badge badge-warning">Advertencia</span>}
                  {selectedItem.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                </strong>
              </div>
              {selectedItem.qcData && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><span>Grados Brix:</span> <strong>{selectedItem.qcData.brix}°Bx</strong></div>
                  <div><span>Firmeza:</span> <strong>{selectedItem.qcData.firmness} g/mm</strong></div>
                  <div><span>Machucones/Blanda:</span> <strong>{selectedItem.qcData.softFruit}%</strong></div>
                  <div><span>Hongo:</span> <strong>{selectedItem.qcData.mold}%</strong></div>
                  <div><span>Mercado Recomendado:</span> <strong>{selectedItem.qcData.targetMarket}</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Lote: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Productor / Huerto</label>
                <input type="text" value={editProducer} onChange={(e) => setEditProducer(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad Inicial (Kg)</label>
                <input type="number" value={editKg} onChange={(e) => setEditKg(parseInt(e.target.value) || 0)} className="form-input" required min={selectedItem.kg - selectedItem.remainingKg} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mínimo requerido para cubrir ventas actuales: {selectedItem.kg - selectedItem.remainingKg} kg</span>
              </div>

              <div className="form-group">
                <label className="form-label">Precio por Kg (MXN)</label>
                <input type="number" step="0.01" value={editPricePerKg} onChange={(e) => setEditPricePerKg(parseFloat(e.target.value) || 0)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Ubicación Física</label>
                <select value={editStorageLocation} onChange={(e) => setEditStorageLocation(e.target.value)} className="form-select">
                  <option value="BODEGA">Nuestra Bodega (Planta)</option>
                  <option value="PROVEEDOR">Alojado por el Proveedor (Rancho)</option>
                </select>
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
