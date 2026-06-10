import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Plus, Send, RefreshCw, Calendar, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle, UserCheck, AlertTriangle } from 'lucide-react';

export default function PackagingManager({ suppliers = [], clients = [], onRefreshMaterials }) {
  const [activeSubTab, setActiveSubTab] = useState('inventory'); // 'inventory', 'suppliers_balance', 'history'
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', clientId: '' });
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null); // { id: '', name: '', clientId: '' }

  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('RECEIVE_FROM_BUYER'); // 'RECEIVE_FROM_BUYER' or 'LEND_TO_PRODUCER'
  const [newTx, setNewTx] = useState({
    materialId: '',
    quantity: '',
    producerId: '',
    clientId: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch materials
      const { data: mats, error: matErr } = await supabase
        .from('packaging_materials')
        .select('*')
        .order('name', { ascending: true });
      if (matErr) throw matErr;
      setMaterials(mats || []);

      // Fetch transactions
      const { data: txs, error: txErr } = await supabase
        .from('packaging_transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      if (txErr) throw txErr;
      setTransactions(txs || []);
    } catch (err) {
      console.error("Error fetching packaging data:", err);
      setError('Error al cargar datos del inventario de cajas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name.trim()) return;

    try {
      const matId = `PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: matId,
        name: newMaterial.name.trim(),
        client_id: newMaterial.clientId || null,
        stock_qty: 0,
        lent_qty: 0,
        total_qty: 0
      };

      const { error: insertErr } = await supabase.from('packaging_materials').insert([payload]);
      if (insertErr) throw insertErr;

      setShowAddMaterialModal(false);
      setNewMaterial({ name: '', clientId: '' });
      fetchData();
      if (onRefreshMaterials) onRefreshMaterials();
    } catch (err) {
      console.error("Error adding packaging material:", err);
      alert("Error al agregar el material de empaque.");
    }
  };

  const handleOpenEditMaterial = (mat) => {
    setEditingMaterial({
      id: mat.id,
      name: mat.name,
      clientId: mat.client_id || ''
    });
    setShowEditMaterialModal(true);
  };

  const handleEditMaterial = async (e) => {
    e.preventDefault();
    if (!editingMaterial || !editingMaterial.name.trim()) return;

    try {
      const { error: updErr } = await supabase
        .from('packaging_materials')
        .update({
          name: editingMaterial.name.trim(),
          client_id: editingMaterial.clientId || null
        })
        .eq('id', editingMaterial.id);
      if (updErr) throw updErr;

      setShowEditMaterialModal(false);
      setEditingMaterial(null);
      fetchData();
      if (onRefreshMaterials) onRefreshMaterials();
    } catch (err) {
      console.error("Error updating packaging material:", err);
      alert("Error al actualizar el material de empaque.");
    }
  };

  const handleDeleteMaterial = async (mat) => {
    if (!confirm(`¿Estás seguro de eliminar el empaque "${mat.name}"? Esto también eliminará todos sus movimientos históricos y desvinculará los registros en compras y ventas.`)) return;

    try {
      const { error: delErr } = await supabase
        .from('packaging_materials')
        .delete()
        .eq('id', mat.id);
      if (delErr) throw delErr;
      fetchData();
      if (onRefreshMaterials) onRefreshMaterials();
    } catch (err) {
      console.error("Error deleting material:", err);
      alert("Error al eliminar el material de empaque.");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const qty = parseInt(newTx.quantity);
    if (!newTx.materialId || isNaN(qty) || qty <= 0) {
      alert("Por favor completa los campos obligatorios y con valores válidos.");
      return;
    }

    // Validation for lending: check if we have enough stock in warehouse
    const material = materials.find(m => m.id === newTx.materialId);
    if (txType === 'LEND_TO_PRODUCER') {
      if (!newTx.producerId) {
        alert("Debes seleccionar un productor para realizar el préstamo.");
        return;
      }
      if (material.stock_qty < qty) {
        alert(`Stock insuficiente en bodega. Solo hay ${material.stock_qty} cajas disponibles.`);
        return;
      }
    } else {
      // RECEIVE_FROM_BUYER
      if (!newTx.clientId) {
        alert("Debes seleccionar el cliente/comprador de origen.");
        return;
      }
    }

    try {
      const txId = `TX-PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: txId,
        material_id: newTx.materialId,
        type: txType,
        quantity: qty,
        producer_id: txType === 'LEND_TO_PRODUCER' ? newTx.producerId : null,
        client_id: txType === 'RECEIVE_FROM_BUYER' ? newTx.clientId : null,
        date: newTx.date,
        notes: newTx.notes.trim() || null
      };

      // 1. Insert transaction
      const { error: txErr } = await supabase.from('packaging_transactions').insert([payload]);
      if (txErr) throw txErr;

      // 2. Update stock/lent counters on material
      let newStock = material.stock_qty;
      let newLent = material.lent_qty;

      if (txType === 'RECEIVE_FROM_BUYER') {
        newStock += qty;
      } else if (txType === 'LEND_TO_PRODUCER') {
        newStock -= qty;
        newLent += qty;
      }

      const { error: matErr } = await supabase
        .from('packaging_materials')
        .update({
          stock_qty: newStock,
          lent_qty: newLent,
          total_qty: newStock + newLent
        })
        .eq('id', newTx.materialId);
      if (matErr) throw matErr;

      setShowTxModal(false);
      setNewTx({
        materialId: '',
        quantity: '',
        producerId: '',
        clientId: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
      if (onRefreshMaterials) onRefreshMaterials();
    } catch (err) {
      console.error("Error creating packaging transaction:", err);
      alert("Error al procesar el movimiento de cajas.");
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento? Se revertirán los saldos de inventario de cajas.")) return;

    try {
      // Fetch current material details to revert correctly
      const { data: mats } = await supabase
        .from('packaging_materials')
        .select('*')
        .eq('id', tx.material_id);
      
      if (!mats || mats.length === 0) {
        // Just delete transaction if material doesn't exist anymore
        await supabase.from('packaging_transactions').delete().eq('id', tx.id);
        fetchData();
        return;
      }

      const material = mats[0];
      let newStock = material.stock_qty;
      let newLent = material.lent_qty;

      // Reverse action depending on transaction type
      if (tx.type === 'RECEIVE_FROM_BUYER') {
        newStock -= tx.quantity;
      } else if (tx.type === 'LEND_TO_PRODUCER') {
        newStock += tx.quantity;
        newLent -= tx.quantity;
      } else if (tx.type === 'RETURNED_IN_PURCHASE') {
        // A purchase returned boxes: it decreased lent_qty and increased stock_qty.
        // Reverting it: increase lent_qty, decrease stock_qty
        newStock -= tx.quantity;
        newLent += tx.quantity;
      } else if (tx.type === 'SHIPPED_IN_SALE') {
        // A sale shipped boxes: it decreased stock_qty.
        // Reverting it: increase stock_qty
        newStock += tx.quantity;
      }

      // 1. Delete transaction
      const { error: delErr } = await supabase.from('packaging_transactions').delete().eq('id', tx.id);
      if (delErr) throw delErr;

      // 2. Update material counters
      const { error: updErr } = await supabase
        .from('packaging_materials')
        .update({
          stock_qty: Math.max(0, newStock),
          lent_qty: Math.max(0, newLent),
          total_qty: Math.max(0, newStock) + Math.max(0, newLent)
        })
        .eq('id', tx.material_id);
      if (updErr) throw updErr;

      fetchData();
      if (onRefreshMaterials) onRefreshMaterials();
    } catch (err) {
      console.error("Error deleting packaging transaction:", err);
      alert("Error al revertir y eliminar el movimiento.");
    }
  };

  // Helper to calculate supplier box balance
  const getSuppliersBalances = () => {
    const balances = {};
    
    // Initialize for all suppliers
    suppliers.forEach(s => {
      balances[s.id] = {
        supplierName: s.name,
        materials: {} // materialId: { lent: 0, returned: 0, balance: 0 }
      };
    });

    // Populate balances based on transactions
    transactions.forEach(tx => {
      if (tx.producer_id && balances[tx.producer_id]) {
        const matId = tx.material_id;
        const matName = materials.find(m => m.id === matId)?.name || 'Caja Desconocida';

        if (!balances[tx.producer_id].materials[matId]) {
          balances[tx.producer_id].materials[matId] = {
            name: matName,
            lent: 0,
            returned: 0,
            balance: 0
          };
        }

        if (tx.type === 'LEND_TO_PRODUCER') {
          balances[tx.producer_id].materials[matId].lent += tx.quantity;
          balances[tx.producer_id].materials[matId].balance += tx.quantity;
        } else if (tx.type === 'RETURNED_IN_PURCHASE') {
          balances[tx.producer_id].materials[matId].returned += tx.quantity;
          balances[tx.producer_id].materials[matId].balance -= tx.quantity;
        }
      }
    });

    // Filter out suppliers with no movements at all
    return Object.entries(balances)
      .map(([id, val]) => ({ id, ...val }))
      .filter(b => Object.keys(b.materials).length > 0);
  };

  const getTxBadgeClass = (type) => {
    switch(type) {
      case 'RECEIVE_FROM_BUYER': return 'badge badge-green';
      case 'LEND_TO_PRODUCER': return 'badge badge-orange';
      case 'RETURNED_IN_PURCHASE': return 'badge badge-blue';
      case 'SHIPPED_IN_SALE': return 'badge badge-purple';
      default: return 'badge';
    }
  };

  const getTxTypeLabel = (type) => {
    switch(type) {
      case 'RECEIVE_FROM_BUYER': return 'Recibido de Comprador';
      case 'LEND_TO_PRODUCER': return 'Prestado a Productor';
      case 'RETURNED_IN_PURCHASE': return 'Regresado en Compra';
      case 'SHIPPED_IN_SALE': return 'Despachado en Venta';
      case 'ADJUSTMENT': return 'Ajuste de Inventario';
      default: return type;
    }
  };

  const suppliersBalances = getSuppliersBalances();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box size={28} color="var(--color-success)" />
            Control de Cajas y Material Consignado
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Monitorea el inventario de empaques consignados por clientes y préstamos activos a productores.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} className="btn-secondary" style={{ padding: '10px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowAddMaterialModal(true)} className="btn-secondary">
            <Plus size={16} /> Crear Tipo de Caja
          </button>
          <button 
            onClick={() => { setTxType('RECEIVE_FROM_BUYER'); setShowTxModal(true); }} 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', color: 'white' }}
          >
            <ArrowDownCircle size={16} /> Recibir de Comprador
          </button>
          <button 
            onClick={() => { setTxType('LEND_TO_PRODUCER'); setShowTxModal(true); }} 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, var(--color-blackberry) 0%, var(--color-blackberry) 100%)', color: 'white' }}
          >
            <Send size={16} /> Prestar a Productor
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', gap: '20px', marginBottom: '8px' }}>
        {[
          { id: 'inventory', label: 'Inventario de Cajas' },
          { id: 'suppliers_balance', label: 'Saldos de Productores' },
          { id: 'history', label: 'Historial de Movimientos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === tab.id ? '2px solid var(--color-success)' : '2px solid transparent',
              padding: '10px 4px',
              fontSize: '0.9rem',
              fontWeight: activeSubTab === tab.id ? 600 : 500,
              color: activeSubTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <span className="pulse-dot"></span> <span style={{ marginLeft: '10px', fontSize: '0.85rem' }}>Cargando inventarios...</span>
          </div>
        ) : (
          <>
            {/* SUBTAB: INVENTORY */}
            {activeSubTab === 'inventory' && (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre del Material</th>
                      <th>Comprador Asociado</th>
                      <th style={{ textAlign: 'right' }}>En Bodega (Stock)</th>
                      <th style={{ textAlign: 'right' }}>Prestado a Productores</th>
                      <th style={{ textAlign: 'right' }}>Total Consignado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                          No hay cajas de empaque registradas en el catálogo. Usa el botón "Crear Tipo de Caja".
                        </td>
                      </tr>
                    ) : (
                      materials.map(mat => {
                        const clientName = clients.find(c => c.id === mat.client_id)?.name || 'General / Propio';
                        return (
                          <tr key={mat.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{mat.id}</td>
                            <td style={{ fontWeight: 600 }}>{mat.name}</td>
                            <td>{clientName}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>
                              {mat.stock_qty.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-warning)' }}>
                              {mat.lent_qty.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-blueberry)' }}>
                              {mat.total_qty.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleOpenEditMaterial(mat)} 
                                  className="btn-secondary" 
                                  style={{ padding: '6px', color: 'var(--color-blueberry)' }}
                                  title="Editar material"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMaterial(mat)} 
                                  className="btn-secondary" 
                                  style={{ padding: '6px', color: 'var(--color-danger)' }}
                                  title="Eliminar material"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBTAB: SUPPLIERS BALANCE */}
            {activeSubTab === 'suppliers_balance' && (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Productor / Proveedor</th>
                      <th>Tipo de Caja Consignada</th>
                      <th style={{ textAlign: 'right' }}>Prestadas</th>
                      <th style={{ textAlign: 'right' }}>Regresadas (Cosecha)</th>
                      <th style={{ textAlign: 'right' }}>Saldo Pendiente (Deuda)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliersBalances.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                          No hay préstamos de cajas activos con ningún productor.
                        </td>
                      </tr>
                    ) : (
                      suppliersBalances.map(supBal => (
                        Object.entries(supBal.materials).map(([matId, mat], idx) => (
                          <tr key={`${supBal.id}-${matId}`}>
                            {idx === 0 && (
                              <td rowSpan={Object.keys(supBal.materials).length} style={{ fontWeight: 600, verticalAlign: 'middle' }}>
                                {supBal.supplierName}
                              </td>
                            )}
                            <td>{mat.name}</td>
                            <td style={{ textAlign: 'right' }}>{mat.lent.toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>{mat.returned.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: mat.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {mat.balance.toLocaleString()} {mat.balance > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>(Debe)</span>}
                            </td>
                          </tr>
                        ))
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBTAB: HISTORY */}
            {activeSubTab === 'history' && (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Movimiento</th>
                      <th>Tipo de Caja</th>
                      <th style={{ textAlign: 'right' }}>Cantidad</th>
                      <th>Productor / Cliente</th>
                      <th>Ref Transacción</th>
                      <th>Observaciones</th>
                      <th style={{ textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                          No se han registrado movimientos de cajas.
                        </td>
                      </tr>
                    ) : (
                      transactions.map(tx => {
                        const matName = materials.find(m => m.id === tx.material_id)?.name || 'Caja Desconocida';
                        const entityName = tx.type.includes('PRODUCER') 
                          ? (suppliers.find(s => s.id === tx.producer_id)?.name || 'Productor N/A')
                          : (clients.find(c => c.id === tx.client_id)?.name || 'Cliente N/A');
                        
                        return (
                          <tr key={tx.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>{tx.date}</td>
                            <td>
                              <span className={getTxBadgeClass(tx.type)}>
                                {getTxTypeLabel(tx.type)}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{matName}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{tx.quantity.toLocaleString()}</td>
                            <td>{entityName}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.reference_id || '-'}</td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.notes || '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                onClick={() => handleDeleteTransaction(tx)} 
                                className="btn-secondary" 
                                style={{ padding: '6px', color: 'var(--color-danger)' }}
                                title="Eliminar y revertir saldos"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL: CREAR TIPO DE CAJA --- */}
      {showAddMaterialModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={20} color="var(--color-success)" />
                Crear Nuevo Tipo de Caja
              </h3>
              <button onClick={() => setShowAddMaterialModal(false)} className="btn-secondary" style={{ padding: '6px' }}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            
            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Empaque / Caja</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Caja Plástica Arándano Driscoll's 2kg"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cliente/Comprador Propietario (Opcional)</label>
                <select
                  className="form-select"
                  value={newMaterial.clientId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, clientId: e.target.value })}
                >
                  <option value="">-- General / Propio (Sin dueño específico) --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Vincula la caja a un comprador si esta es proveída por él exclusivamente para sus lotes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                  Crear Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDITAR TIPO DE CAJA --- */}
      {showEditMaterialModal && editingMaterial && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={20} color="var(--color-success)" />
                Editar Tipo de Caja
              </h3>
              <button onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }} className="btn-secondary" style={{ padding: '6px' }}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            
            <form onSubmit={handleEditMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Empaque / Caja</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Caja Plástica Arándano Driscoll's 2kg"
                  value={editingMaterial.name}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cliente/Comprador Propietario (Opcional)</label>
                <select
                  className="form-select"
                  value={editingMaterial.clientId}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, clientId: e.target.value })}
                >
                  <option value="">-- General / Propio (Sin dueño específico) --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Vincula la caja a un comprador si esta es proveída por él exclusivamente para sus lotes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTRAR MOVIMIENTO (ENTRADA/SALIDA) --- */}
      {showTxModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {txType === 'RECEIVE_FROM_BUYER' ? <ArrowDownCircle size={20} color="var(--color-success)" /> : <Send size={20} color="var(--color-blackberry)" />}
                {txType === 'RECEIVE_FROM_BUYER' ? 'Recibir Cajas de Comprador' : 'Prestar Cajas a Productor'}
              </h3>
              <button onClick={() => setShowTxModal(false)} className="btn-secondary" style={{ padding: '6px' }}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Seleccionar Tipo de Caja</label>
                <select
                  className="form-select"
                  value={newTx.materialId}
                  onChange={(e) => setNewTx({ ...newTx, materialId: e.target.value })}
                  required
                >
                  <option value="">-- Elige un material de empaque --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {txType === 'LEND_TO_PRODUCER' ? `(Disp: ${m.stock_qty})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {txType === 'RECEIVE_FROM_BUYER' ? (
                <div className="form-group">
                  <label className="form-label">Cliente / Comprador de Origen</label>
                  <select
                    className="form-select"
                    value={newTx.clientId}
                    onChange={(e) => setNewTx({ ...newTx, clientId: e.target.value })}
                    required
                  >
                    <option value="">-- Selecciona el cliente que nos envía las cajas --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Productor / Proveedor Destino</label>
                  <select
                    className="form-select"
                    value={newTx.producerId}
                    onChange={(e) => setNewTx({ ...newTx, producerId: e.target.value })}
                    required
                  >
                    <option value="">-- Selecciona el productor a quien prestamos las cajas --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cantidad de Cajas</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej: 500"
                    value={newTx.quantity}
                    onChange={(e) => setNewTx({ ...newTx, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha del Movimiento</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones / Notas</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Detalles adicionales, número de remisión, etc."
                  style={{ resize: 'none' }}
                  value={newTx.notes}
                  onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTxModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" style={{ background: txType === 'RECEIVE_FROM_BUYER' ? 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' : 'linear-gradient(135deg, var(--color-blackberry) 0%, #4f46e5 100%)' }}>
                  {txType === 'RECEIVE_FROM_BUYER' ? 'Registrar Entrada' : 'Registrar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal styles matching standard styles in components
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '480px',
  padding: '28px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  border: '1px solid var(--panel-border)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--panel-border)',
  paddingBottom: '12px',
  marginBottom: '14px'
};
