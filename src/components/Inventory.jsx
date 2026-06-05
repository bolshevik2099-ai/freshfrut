import React, { useState, useEffect } from 'react';
import { Archive, Ship, CheckCircle, PackageOpen, Info, MapPin, Truck, Eye, Edit2, Trash2, X } from 'lucide-react';

export default function Inventory({ purchases, sales, deletePurchase, editPurchase, deleteSale, editSale }) {
  const [activeSubTab, setActiveSubTab] = useState('proveedor');
  const [selectedFruit, setSelectedFruit] = useState('ALL');

  // Dynamic extraction of unique fruit types present in purchases or sales
  const fruitTypes = React.useMemo(() => {
    const fruits = new Set();
    purchases.forEach(p => { if (p.berry) fruits.add(p.berry); });
    sales.forEach(s => { if (s.berry) fruits.add(s.berry); });
    return Array.from(fruits).sort();
  }, [purchases, sales]);

  // Filter purchases and sales by selected berry type
  const filteredPurchases = selectedFruit === 'ALL'
    ? purchases
    : purchases.filter(p => p.berry === selectedFruit);

  const filteredSales = selectedFruit === 'ALL'
    ? sales
    : sales.filter(s => s.berry === selectedFruit);

  // Classification logic using filtered lists
  const proveedorLots = filteredPurchases.filter(p => p.remainingKg > 0 && p.storageLocation === 'PROVEEDOR');
  const bodegaLots = filteredPurchases.filter(p => p.remainingKg > 0 && p.storageLocation === 'BODEGA');
  const enCaminoSales = filteredSales.filter(s => s.status !== 'Entregado');
  const entregadoSales = filteredSales.filter(s => s.status === 'Entregado');

  // Calculate weights
  const totalProveedorKgs = proveedorLots.reduce((sum, p) => sum + p.remainingKg, 0);
  const totalBodegaKgs = bodegaLots.reduce((sum, p) => sum + p.remainingKg, 0);
  const totalEnCaminoKgs = enCaminoSales.reduce((sum, s) => sum + s.kg, 0);
  const totalEntregadoKgs = entregadoSales.reduce((sum, s) => sum + s.kg, 0);

  // Calculate valuations
  const totalProveedorPurchaseVal = proveedorLots.reduce((sum, p) => sum + (p.remainingKg * p.pricePerKg), 0);
  const totalBodegaPurchaseVal = bodegaLots.reduce((sum, p) => sum + (p.remainingKg * p.pricePerKg), 0);

  const totalEnCaminoPurchaseVal = enCaminoSales.reduce((sum, s) => {
    const lot = purchases.find(p => p.id === s.purchaseId) || {};
    return sum + (s.kg * (lot.pricePerKg || 0));
  }, 0);
  const totalEnCaminoSalesVal = enCaminoSales.reduce((sum, s) => sum + s.totalRevenue, 0);

  const totalEntregadoPurchaseVal = entregadoSales.reduce((sum, s) => {
    const lot = purchases.find(p => p.id === s.purchaseId) || {};
    return sum + (s.kg * (lot.pricePerKg || 0));
  }, 0);
  const totalEntregadoSalesVal = entregadoSales.reduce((sum, s) => sum + s.totalRevenue, 0);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'purchaseDetails', 'purchaseEdit', 'saleDetails', 'saleEdit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Purchase edit fields
  const [editProducer, setEditProducer] = useState('');
  const [editKg, setEditKg] = useState(0);
  const [editPricePerKg, setEditPricePerKg] = useState(0);
  const [editStorageLocation, setEditStorageLocation] = useState('BODEGA');
  const [editBerry, setEditBerry] = useState('Fresa');
  const [editVariety, setEditVariety] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editQcStatus, setEditQcStatus] = useState('PENDING');
  const [editInspector, setEditInspector] = useState('');
  const [editBrix, setEditBrix] = useState(0);
  const [editFirmness, setEditFirmness] = useState(0);
  const [editSoftFruit, setEditSoftFruit] = useState(0);
  const [editMold, setEditMold] = useState(0);
  const [editTargetMarket, setEditTargetMarket] = useState('');

  // Sale edit fields
  const [editClient, setEditClient] = useState('');
  const [editSaleKg, setEditSaleKg] = useState(0);
  const [editPriceSoldPerKg, setEditPriceSoldPerKg] = useState(0);
  const [editStatus, setEditStatus] = useState('Empaque');
  const [editContainerId, setEditContainerId] = useState('');
  const [editShippingLine, setEditShippingLine] = useState('');

  // Auto-fill edit fields on selection
  const openPurchaseEdit = (item) => {
    setSelectedItem(item);
    setEditProducer(item.producer || '');
    setEditKg(item.kg || 0);
    setEditPricePerKg(item.pricePerKg || 0);
    setEditStorageLocation(item.storageLocation || 'BODEGA');
    setEditBerry(item.berry || 'Fresa');
    setEditVariety(item.variety || '');
    setEditDate(item.date || '');
    setEditQcStatus(item.qcStatus || 'PENDING');
    setEditInspector(item.qcData?.inspector || '');
    setEditBrix(item.qcData?.brix || 0);
    setEditFirmness(item.qcData?.firmness || 0);
    setEditSoftFruit(item.qcData?.softFruit || 0);
    setEditMold(item.qcData?.mold || 0);
    setEditTargetMarket(item.qcData?.targetMarket || '');
    setActiveModal('purchaseEdit');
  };

  const openSaleEdit = (item) => {
    setSelectedItem(item);
    setEditClient(item.client);
    setEditSaleKg(item.kg);
    setEditPriceSoldPerKg(item.priceSoldPerKg);
    setEditStatus(item.status);
    setEditContainerId(item.containerId);
    setEditShippingLine(item.shippingLine);
    setActiveModal('saleEdit');
  };

  const handlePurchaseEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qcData = editQcStatus === 'PENDING' ? null : {
      brix: parseFloat(editBrix) || 0,
      firmness: parseFloat(editFirmness) || 0,
      softFruit: parseFloat(editSoftFruit) || 0,
      mold: parseFloat(editMold) || 0,
      targetMarket: editTargetMarket || 'Local',
      inspector: editInspector || 'Inspector General',
      qcScore: editQcStatus === 'APPROVED' ? '95%' : editQcStatus === 'WARNING' ? '80%' : '50%'
    };

    editPurchase(selectedItem.id, {
      producer: editProducer,
      berry: editBerry,
      variety: editVariety,
      kg: parseInt(editKg) || 0,
      pricePerKg: parseFloat(editPricePerKg) || 0,
      storageLocation: editStorageLocation,
      date: editDate,
      qcStatus: editQcStatus,
      qcData
    });
    setActiveModal(null);
    setSelectedItem(null);
  };

  const handleSaleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    editSale(selectedItem.id, {
      client: editClient,
      kg: editSaleKg,
      priceSoldPerKg: editPriceSoldPerKg,
      status: editStatus,
      containerId: editContainerId,
      shippingLine: editShippingLine
    });
    setActiveModal(null);
    setSelectedItem(null);
  };

  const getSourceLot = (purchaseId) => {
    return purchases.find(p => p.id === purchaseId) || {};
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Inventario de Fruta</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Monitorea la ubicación física, estados fitosanitarios y cantidades de fruta registradas en las distintas etapas de la cadena.
        </p>
      </div>

      {/* Fruit Filter Bar */}
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
            background: 'rgba(236, 72, 153, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-strawberry-hover)'
          }}>
            <PackageOpen size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'white' }}>Filtro de Cultivo</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {selectedFruit === 'ALL' ? 'Mostrando todos los cultivos en inventario' : `Mostrando inventario filtrado por: ${selectedFruit}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtrar por Fruta:</span>
          <select
            value={selectedFruit}
            onChange={(e) => setSelectedFruit(e.target.value)}
            className="form-select"
            style={{ width: '180px', fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <option value="ALL">Todas las Frutas</option>
            {fruitTypes.map(fruit => (
              <option key={fruit} value={fruit}>{fruit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI grid (4 columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Alojado por el Proveedor */}
        <div 
          onClick={() => setActiveSubTab('proveedor')}
          className="glass-panel card-hover" 
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: activeSubTab === 'proveedor' ? '1px solid var(--color-blackberry)' : '1px solid var(--panel-border)',
            boxShadow: activeSubTab === 'proveedor' ? '0 0 15px rgba(162, 28, 175, 0.2)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ALÓJ. PROVEEDOR</span>
            <MapPin size={18} color="var(--color-blackberry)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            {totalProveedorKgs.toLocaleString()} kg
          </h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{proveedorLots.length} lotes de nuestra propiedad</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Compra: <strong>${totalProveedorPurchaseVal.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* En Bodega */}
        <div 
          onClick={() => setActiveSubTab('bodega')}
          className="glass-panel card-hover" 
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: activeSubTab === 'bodega' ? '1px solid var(--color-strawberry)' : '1px solid var(--panel-border)',
            boxShadow: activeSubTab === 'bodega' ? 'var(--shadow-glow-strawberry)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EN BODEGA (STOCK)</span>
            <Archive size={18} color="var(--color-strawberry)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            {totalBodegaKgs.toLocaleString()} kg
          </h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{bodegaLots.length} lotes en nuestras cámaras</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Compra: <strong>${totalBodegaPurchaseVal.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* En Camino */}
        <div 
          onClick={() => setActiveSubTab('camino')}
          className="glass-panel card-hover" 
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: activeSubTab === 'camino' ? '1px solid var(--color-blueberry)' : '1px solid var(--panel-border)',
            boxShadow: activeSubTab === 'camino' ? 'var(--shadow-glow-blue)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EN CAMINO (TRÁNSITO)</span>
            <Ship size={18} color="var(--color-blueberry)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            {totalEnCaminoKgs.toLocaleString()} kg
          </h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{enCaminoSales.length} embarques activos</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Costo Compra: <strong>${totalEnCaminoPurchaseVal.toLocaleString()}</strong> | Venta: <strong>${totalEnCaminoSalesVal.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Entregado */}
        <div 
          onClick={() => setActiveSubTab('entregado')}
          className="glass-panel card-hover" 
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: activeSubTab === 'entregado' ? '1px solid var(--color-success)' : '1px solid var(--panel-border)',
            boxShadow: activeSubTab === 'entregado' ? 'var(--shadow-glow-success)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ENTREGADO</span>
            <CheckCircle size={18} color="var(--color-success)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            {totalEntregadoKgs.toLocaleString()} kg
          </h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{entregadoSales.length} entregas finalizadas</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Costo Compra: <strong>${totalEntregadoPurchaseVal.toLocaleString()}</strong> | Venta: <strong>${totalEntregadoSalesVal.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main details table panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Tab headings */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '20px', gap: '4px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveSubTab('proveedor')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'transparent',
              color: activeSubTab === 'proveedor' ? 'var(--color-blackberry)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'proveedor' ? '2px solid var(--color-blackberry)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            Alojado por Proveedor ({proveedorLots.length})
          </button>

          <button 
            onClick={() => setActiveSubTab('bodega')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'transparent',
              color: activeSubTab === 'bodega' ? 'var(--color-strawberry-hover)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'bodega' ? '2px solid var(--color-strawberry)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            En Bodega ({bodegaLots.length})
          </button>
          
          <button 
            onClick={() => setActiveSubTab('camino')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'transparent',
              color: activeSubTab === 'camino' ? 'var(--color-blueberry)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'camino' ? '2px solid var(--color-blueberry)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            En Camino ({enCaminoSales.length})
          </button>
          
          <button 
            onClick={() => setActiveSubTab('entregado')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'transparent',
              color: activeSubTab === 'entregado' ? 'var(--color-success)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'entregado' ? '2px solid var(--color-success)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            Entregado ({entregadoSales.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="table-container">
          {activeSubTab === 'proveedor' && (
            <>
              {proveedorLots.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                  <PackageOpen size={32} style={{ display: 'inline', marginBottom: '8px', color: 'var(--text-muted)' }} />
                  <p>No hay fruta alojada por proveedores en stock actualmente.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Lote ID</th>
                      <th>Huerto / Proveedor</th>
                      <th>Berry</th>
                      <th>Kilos (Disp. / Recibidos)</th>
                      <th>Valor Compra</th>
                      <th>Estado QC</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedorLots.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{p.id}</td>
                        <td>{p.producer}</td>
                        <td>{p.berry} ({p.variety})</td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'white' }}>{p.remainingKg.toLocaleString()} kg</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>de {p.kg.toLocaleString()} kg</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>${(p.remainingKg * p.pricePerKg).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>${p.pricePerKg.toFixed(2)}/kg</span>
                        </td>
                        <td>
                          {p.qcStatus === 'PENDING' && <span className="badge badge-warning">Por Evaluar</span>}
                          {p.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                          {p.qcStatus === 'WARNING' && <span className="badge badge-warning">Advertencia</span>}
                          {p.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setSelectedItem(p); setActiveModal('purchaseDetails'); }} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => openPurchaseEdit(p)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
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
              )}
            </>
          )}

          {activeSubTab === 'bodega' && (
            <>
              {bodegaLots.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                  <PackageOpen size={32} style={{ display: 'inline', marginBottom: '8px', color: 'var(--text-muted)' }} />
                  <p>No hay fruta disponible en bodega actualmente.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Lote ID</th>
                      <th>Productor</th>
                      <th>Berry</th>
                      <th>Kilos (Disp. / Recibidos)</th>
                      <th>Valor Compra</th>
                      <th>Estado QC</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodegaLots.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{p.id}</td>
                        <td>{p.producer}</td>
                        <td>{p.berry} ({p.variety})</td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'white' }}>{p.remainingKg.toLocaleString()} kg</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>de {p.kg.toLocaleString()} kg</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>${(p.remainingKg * p.pricePerKg).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>${p.pricePerKg.toFixed(2)}/kg</span>
                        </td>
                        <td>
                          {p.qcStatus === 'PENDING' && <span className="badge badge-warning">Por Evaluar</span>}
                          {p.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                          {p.qcStatus === 'WARNING' && <span className="badge badge-warning">Advertencia</span>}
                          {p.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setSelectedItem(p); setActiveModal('purchaseDetails'); }} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => openPurchaseEdit(p)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
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
              )}
            </>
          )}

          {activeSubTab === 'camino' && (
            <>
              {enCaminoSales.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                  <Truck size={32} style={{ display: 'inline', marginBottom: '8px', color: 'var(--text-muted)' }} />
                  <p>No hay embarques en camino/tránsito actualmente.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Venta ID</th>
                      <th>Lote Origen / Cliente</th>
                      <th>Berry</th>
                      <th>Kilos Vendidos</th>
                      <th>Costo Compra</th>
                      <th>Valor Venta</th>
                      <th>Estado Tránsito</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enCaminoSales.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.id}</td>
                        <td>
                          <span style={{ fontWeight: 600, display: 'block' }}>{s.client}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>Lote: {s.purchaseId}</span>
                        </td>
                        <td>{s.berry} ({s.variety})</td>
                        <td style={{ fontWeight: 600 }}>{s.kg.toLocaleString()} kg</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            ${(s.kg * (getSourceLot(s.purchaseId).pricePerKg || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ${(getSourceLot(s.purchaseId).pricePerKg || 0).toFixed(2)}/kg
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-blueberry)' }}>
                            ${s.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ${s.priceSoldPerKg.toFixed(2)}/kg
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="pulse-dot" style={{ backgroundColor: 'var(--color-blueberry)', width: '6px', height: '6px' }}></span>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button onClick={() => { setSelectedItem(s); setActiveModal('saleDetails'); }} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => openSaleEdit(s)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Marcar el embarque ${s.id} como ENTREGADO?`)) {
                                  editSale(s.id, { ...s, status: 'Entregado' });
                                }
                              }}
                              className="btn-primary"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)',
                                border: 'none',
                                color: 'white'
                              }}
                              title="Marcar como Entregado"
                            >
                              <CheckCircle size={12} /> Entregado
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
              )}
            </>
          )}

          {activeSubTab === 'entregado' && (
            <>
              {entregadoSales.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                  <CheckCircle size={32} style={{ display: 'inline', marginBottom: '8px', color: 'var(--text-muted)' }} />
                  <p>Aún no hay entregas finalizadas.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Venta ID</th>
                      <th>Lote Origen / Cliente</th>
                      <th>Berry</th>
                      <th>Kilos Entregados</th>
                      <th>Costo Compra</th>
                      <th>Valor Venta</th>
                      <th>Ganancia Neta</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregadoSales.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.id}</td>
                        <td>
                          <span style={{ fontWeight: 600, display: 'block' }}>{s.client}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>Lote: {s.purchaseId}</span>
                        </td>
                        <td>{s.berry} ({s.variety})</td>
                        <td style={{ fontWeight: 600 }}>{s.kg.toLocaleString()} kg</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            ${(s.kg * (getSourceLot(s.purchaseId).pricePerKg || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ${(getSourceLot(s.purchaseId).pricePerKg || 0).toFixed(2)}/kg
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-blueberry)' }}>
                            ${s.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ${s.priceSoldPerKg.toFixed(2)}/kg
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          +${s.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setSelectedItem(s); setActiveModal('saleDetails'); }} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Detalles">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => openSaleEdit(s)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
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
              )}
            </>
          )}
        </div>
      </div>

      {/* --- PURCHASE DETAILS MODAL --- */}
      {activeModal === 'purchaseDetails' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Detalle de Lote: {selectedItem.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}><span>Cultivo:</span> <strong>{selectedItem.berry} ({selectedItem.variety})</strong></div>
              <div style={detailRowStyle}><span>Productor:</span> <strong>{selectedItem.producer}</strong></div>
              <div style={detailRowStyle}><span>Kilos Recibidos:</span> <strong>{selectedItem.kg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Kilos Disponibles:</span> <strong>{selectedItem.remainingKg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Costo por Kg:</span> <strong>${selectedItem.pricePerKg.toFixed(2)} MXN</strong></div>
              <div style={detailRowStyle}><span>Costo Total:</span> <strong style={{ color: 'var(--color-success)' }}>${selectedItem.totalCost.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Ubicación Física:</span> <strong>{selectedItem.storageLocation === 'PROVEEDOR' ? 'Alojado por Proveedor' : 'Bodega (Planta)'}</strong></div>
              <div style={detailRowStyle}><span>Fecha Recepción:</span> <strong>{selectedItem.date}</strong></div>
              <div style={detailRowStyle}><span>Estatus Calidad:</span> 
                <strong>
                  {selectedItem.qcStatus === 'PENDING' && <span className="badge badge-warning">Pendiente</span>}
                  {selectedItem.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                  {selectedItem.qcStatus === 'WARNING' && <span className="badge badge-warning">Advertencia</span>}
                  {selectedItem.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SALE DETAILS MODAL --- */}
      {activeModal === 'saleDetails' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Detalle de Embarque: {selectedItem.id}</h3>
              <button onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginTop: '10px' }}>
              <div style={detailRowStyle}><span>Lote de Origen:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{selectedItem.purchaseId}</strong></div>
              <div style={detailRowStyle}><span>Cliente:</span> <strong>{selectedItem.client}</strong></div>
              <div style={detailRowStyle}><span>Cultivo:</span> <strong>{selectedItem.berry} ({selectedItem.variety})</strong></div>
              <div style={detailRowStyle}><span>Kilos Vendidos:</span> <strong>{selectedItem.kg.toLocaleString()} kg</strong></div>
              <div style={detailRowStyle}><span>Precio de Venta:</span> <strong>${selectedItem.priceSoldPerKg.toFixed(2)} MXN/kg</strong></div>
              <div style={detailRowStyle}><span>Ingreso Total:</span> <strong style={{ color: 'var(--color-blueberry)' }}>${selectedItem.totalRevenue.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Ganancia Neta:</span> <strong style={{ color: 'var(--color-success)' }}>+${selectedItem.profit.toLocaleString()} MXN</strong></div>
              <div style={detailRowStyle}><span>Transporte / Naviera:</span> <strong>{selectedItem.shippingLine}</strong></div>
              <div style={detailRowStyle}><span>Contenedor Reefer:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{selectedItem.containerId}</strong></div>
              <div style={detailRowStyle}><span>Fecha Registro:</span> <strong>{selectedItem.date}</strong></div>
              <div style={detailRowStyle}><span>Estatus Logístico:</span> <strong><span className="badge badge-blue">{selectedItem.status}</span></strong></div>
            </div>
          </div>
        </div>
      )}

      {/* --- PURCHASE EDIT MODAL --- */}
      {activeModal === 'purchaseEdit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form
            onSubmit={handlePurchaseEditSubmit}
            className="glass-panel modal-content"
            style={{ ...modalContentStyle, maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Lote: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Productor / Huerto</label>
                  <input type="text" value={editProducer} onChange={(e) => setEditProducer(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Recepción</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cultivo</label>
                  <select value={editBerry} onChange={(e) => setEditBerry(e.target.value)} className="form-select" required>
                    <option value="Fresa">Fresa</option>
                    <option value="Arándano">Arándano</option>
                    <option value="Frambuesa">Frambuesa</option>
                    <option value="Mora">Mora</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Variedad</label>
                  <input type="text" value={editVariety} onChange={(e) => setEditVariety(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cantidad Inicial (Kg)</label>
                  <input 
                    type="number" 
                    value={editKg} 
                    onChange={(e) => setEditKg(parseInt(e.target.value) || 0)} 
                    className="form-input" 
                    required 
                    min={selectedItem.kg - selectedItem.remainingKg} 
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mín: {selectedItem.kg - selectedItem.remainingKg} kg (vendido)</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio por Kg (MXN)</label>
                  <input type="number" step="0.01" value={editPricePerKg} onChange={(e) => setEditPricePerKg(parseFloat(e.target.value) || 0)} className="form-input" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Ubicación Física</label>
                  <select value={editStorageLocation} onChange={(e) => setEditStorageLocation(e.target.value)} className="form-select">
                    <option value="BODEGA">Nuestra Bodega (Planta)</option>
                    <option value="PROVEEDOR">Alojado por el Proveedor (Rancho)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estatus Calidad (QC)</label>
                  <select value={editQcStatus} onChange={(e) => setEditQcStatus(e.target.value)} className="form-select" required>
                    <option value="PENDING">Por Evaluar</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="WARNING">Advertencia</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </div>
              </div>

              {/* QC Details Section */}
              {editQcStatus !== 'PENDING' && (
                <div style={{
                  borderTop: '1px dashed var(--panel-border)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-strawberry-hover)', margin: 0, fontWeight: 600 }}>Parámetros de Reporte QC</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Inspector</label>
                      <input type="text" value={editInspector} onChange={(e) => setEditInspector(e.target.value)} className="form-input" placeholder="Nombre del inspector" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mercado Objetivo</label>
                      <input type="text" value={editTargetMarket} onChange={(e) => setEditTargetMarket(e.target.value)} className="form-input" placeholder="Ej: USA, Japón, Local" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Grados Brix</label>
                      <input type="number" step="0.1" value={editBrix} onChange={(e) => setEditBrix(parseFloat(e.target.value) || 0)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Firmeza (g/mm)</label>
                      <input type="number" step="1" value={editFirmness} onChange={(e) => setEditFirmness(parseFloat(e.target.value) || 0)} className="form-input" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">% Fruta Blanda</label>
                      <input type="number" step="0.1" value={editSoftFruit} onChange={(e) => setEditSoftFruit(parseFloat(e.target.value) || 0)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">% Moho</label>
                      <input type="number" step="0.1" value={editMold} onChange={(e) => setEditMold(parseFloat(e.target.value) || 0)} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- SALE EDIT MODAL --- */}
      {activeModal === 'saleEdit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleSaleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Venta: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <input type="text" value={editClient} onChange={(e) => setEditClient(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad Vendida (Kg)</label>
                <input 
                  type="number" 
                  value={editSaleKg} 
                  onChange={(e) => setEditSaleKg(parseInt(e.target.value) || 0)} 
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
