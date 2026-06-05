import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, Snowflake, Ship, Info, MapPin } from 'lucide-react';

export default function Traceability({ purchases, sales }) {
  const [searchQuery, setSearchQuery] = useState(purchases[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLot, setSelectedLot] = useState(purchases[0] || null);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    const lot = purchases.find(p => p.id === query);
    if (lot) {
      setSelectedLot(lot);
      setErrorMsg('');
    } else {
      setErrorMsg('Código de lote no encontrado. Intenta seleccionando de la lista.');
    }
  };

  const loadLot = (lot) => {
    setSearchQuery(lot.id);
    setSelectedLot(lot);
    setErrorMsg('');
  };

  // Find all sales linked to this lot
  const linkedSales = selectedLot ? sales.filter(s => s.purchaseId === selectedLot.id) : [];
  const totalKgSold = linkedSales.reduce((sum, s) => sum + s.kg, 0);
  const totalRevenue = linkedSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const costOfSold = totalKgSold * (selectedLot?.pricePerKg || 0);
  const totalProfit = totalRevenue - costOfSold;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Trazabilidad Total de Lote</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Visualiza el historial completo del berry desde su origen de compra, pesaje, inspección fitosanitaria hasta su despacho y entrega comercial.
        </p>
      </div>

      {/* Control bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Buscar Lote ID (Ej: LOT-FRE-1002)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '38px', height: '44px' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '44px' }}>
            Rastrear Lote
          </button>
        </form>

        {/* Quick select dropdown */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Seleccionar Lote:</span>
          <select 
            value={selectedLot?.id || ''} 
            onChange={(e) => {
              const lot = purchases.find(p => p.id === e.target.value);
              if (lot) loadLot(lot);
            }} 
            className="form-select"
            style={{ width: '220px' }}
          >
            <option value="" disabled>-- Elige un lote --</option>
            {purchases.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.berry} - {p.producer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)', color: '#fda4af', borderRadius: '12px' }}>
          {errorMsg}
        </div>
      )}

      {selectedLot ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
        }} className="responsive-trace-grid">
          
          {/* Lote card specs */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px' }}>
              <span className="badge badge-blue" style={{ marginBottom: '8px' }}>Estatus del Inventario</span>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>{selectedLot.id}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Cultivo: <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.berry} ({selectedLot.variety})</strong>
              </p>
            </div>

            {/* Spec items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Productor</span>
                <span style={{ fontWeight: 600 }}>{selectedLot.producer}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Kilos Recibidos (Inicial)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedLot.kg.toLocaleString()} kg</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Kilos Disponibles (Bodega)</span>
                <span style={{ fontWeight: 700, color: selectedLot.remainingKg > 0 ? 'white' : 'var(--text-muted)' }}>
                  {selectedLot.remainingKg.toLocaleString()} kg
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Costo de Adquisición (Total)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                  ${selectedLot.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>(${selectedLot.pricePerKg}/kg)</span>
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado de Venta</span>
                {selectedLot.remainingKg === 0 ? (
                  <span className="badge badge-success" style={{ marginTop: '4px' }}>Totalmente Vendido</span>
                ) : totalKgSold > 0 ? (
                  <span className="badge badge-blue" style={{ marginTop: '4px' }}>Parcialmente Vendido</span>
                ) : selectedLot.qcStatus === 'REJECTED' ? (
                  <span className="badge badge-danger" style={{ marginTop: '4px' }}>Rechazado (Bloqueado)</span>
                ) : (
                  <span className="badge badge-warning" style={{ marginTop: '4px' }}>Disponible Completo</span>
                )}
              </div>

              {linkedSales.length > 0 && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '6px' }}>Resultado Comercial</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kilos Vendidos:</span>
                      <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{totalKgSold.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Venta Acumulada:</span>
                      <strong style={{ float: 'right', color: 'var(--text-primary)' }}>${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN</strong>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', paddingTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ganancia:</span>
                      <strong style={{ float: 'right', color: 'var(--color-success)' }}>+${totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXN</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Traceability Timeline */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Ruta de Procesamiento & Logística</h3>

            {/* Vertical timeline items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', position: 'relative', paddingLeft: '24px' }}>
              
              {/* Timeline connecting line */}
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--color-success) 50%, var(--color-blueberry) 100%)'
              }}></div>

              {/* Step 1: Purchase / Reception */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                  border: '3px solid var(--bg-main)',
                  boxShadow: 'var(--shadow-glow-success)'
                }}></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedLot.storageLocation === 'PROVEEDOR' ? (
                      <>
                        <MapPin size={16} color="var(--color-blackberry)" />
                        1. Compra y Alojamiento por el Proveedor
                      </>
                    ) : (
                      <>
                        <Compass size={16} color="var(--color-success)" />
                        1. Compra y Recepción en Planta
                      </>
                    )}
                  </h4>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginTop: '6px', border: '1px solid var(--panel-border)', fontSize: '0.85rem' }}>
                    {selectedLot.storageLocation === 'PROVEEDOR' ? (
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Adquirido el <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.date}</strong>. Cantidad inicial: <strong style={{ color: 'white' }}>{selectedLot.kg.toLocaleString()} kg</strong>. 
                        Alojado temporalmente en las bodegas del productor <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.producer}</strong> (Fruta de nuestra propiedad).
                      </p>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Ingresado y pesado físicamente el <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.date}</strong>. Cantidad recibida en planta: <strong style={{ color: 'white' }}>{selectedLot.kg.toLocaleString()} kg</strong> de la huerta de <strong>{selectedLot.producer}</strong>.
                      </p>
                    )}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                      Costo unitario pactado: ${selectedLot.pricePerKg} MXN/kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Quality Control */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: selectedLot.qcStatus === 'PENDING' ? 'var(--color-warning)' : selectedLot.qcStatus === 'REJECTED' ? 'var(--color-danger)' : 'var(--color-success)',
                  border: '3px solid var(--bg-main)',
                  boxShadow: selectedLot.qcStatus === 'PENDING' ? 'none' : selectedLot.qcStatus === 'REJECTED' ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'var(--shadow-glow-success)'
                }}></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color={selectedLot.qcStatus === 'PENDING' ? 'var(--color-warning)' : selectedLot.qcStatus === 'REJECTED' ? 'var(--color-danger)' : 'var(--color-success)'} />
                    2. Control de Calidad e Inocuidad
                  </h4>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginTop: '6px', border: '1px solid var(--panel-border)', fontSize: '0.85rem' }}>
                    {selectedLot.qcStatus === 'PENDING' ? (
                      <p style={{ color: 'var(--color-warning)', fontWeight: 500 }}>
                        Lote pendiente de peritaje fitosanitario. Debe ser evaluado en Control de Calidad.
                      </p>
                    ) : (
                      <>
                        <p style={{ marginBottom: '6px' }}>
                          Estatus: {' '}
                          {selectedLot.qcStatus === 'APPROVED' && <span className="badge badge-success">Aprobado</span>}
                          {selectedLot.qcStatus === 'WARNING' && <span className="badge badge-warning">Aprobado con Advertencia</span>}
                          {selectedLot.qcStatus === 'REJECTED' && <span className="badge badge-danger">Rechazado</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          <span>Brix: <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.qcData?.brix}°Bx</strong></span>
                          <span>Firmeza: <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.qcData?.firmness} g/mm</strong></span>
                          <span>Hongo: <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.qcData?.mold}%</strong></span>
                          <span>Blanda: <strong style={{ color: 'var(--text-primary)' }}>{selectedLot.qcData?.softFruit}%</strong></span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Mercado: {selectedLot.qcData?.targetMarket} | Inspector: {selectedLot.qcData?.inspector}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Packing & Pre-cooling */}
              {selectedLot.qcStatus !== 'PENDING' && selectedLot.qcStatus !== 'REJECTED' && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    border: '3px solid var(--bg-main)',
                    boxShadow: 'var(--shadow-glow-success)'
                  }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Snowflake size={16} color="var(--color-success)" />
                      3. Empaque & Cámara de Frío
                    </h4>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginTop: '6px', border: '1px solid var(--panel-border)', fontSize: '0.85rem' }}>
                      <p>
                        Fruta clasificada y empaquetada en formato estándar.
                      </p>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Almacenamiento: {selectedLot.storageLocation === 'PROVEEDOR' ? (
                          <strong style={{ color: 'var(--color-blackberry)' }}>Bodega externa del Proveedor (Resguardo)</strong>
                        ) : (
                          <strong style={{ color: 'var(--color-success)' }}>Nuestra Cámara Frigorífica 2 (Estabilizado a 1.2°C)</strong>
                        )}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Dispatch / Sales */}
              {selectedLot.qcStatus !== 'PENDING' && selectedLot.qcStatus !== 'REJECTED' && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: linkedSales.length > 0 ? 'var(--color-blueberry)' : 'var(--text-muted)',
                    border: '3px solid var(--bg-main)',
                    boxShadow: linkedSales.length > 0 ? 'var(--shadow-glow-blue)' : 'none'
                  }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ship size={16} color={linkedSales.length > 0 ? 'var(--color-blueberry)' : 'var(--text-secondary)'} />
                      4. Despacho & Venta Internacional (Ventas Parciales)
                    </h4>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginTop: '6px', border: '1px solid var(--panel-border)', fontSize: '0.85rem' }}>
                      {linkedSales.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {linkedSales.map((sale, idx) => (
                            <div 
                              key={sale.id} 
                              style={{ 
                                borderBottom: idx < linkedSales.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none', 
                                paddingBottom: idx < linkedSales.length - 1 ? '10px' : '0' 
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{sale.client}</strong>
                                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>{sale.id}</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Cantidad vendida: <strong>{sale.kg.toLocaleString()} kg</strong> | Precio: <strong>${sale.priceSoldPerKg} MXN/kg</strong>
                              </p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                Contenedor: {sale.containerId} | Naviera: {sale.shippingLine}
                              </p>
                              <p style={{ color: 'var(--color-blueberry)', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                                <span className="pulse-dot" style={{ backgroundColor: 'var(--color-blueberry)', width: '6px', height: '6px' }}></span>
                                Estado de esta salida: {sale.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>
                          Lote disponible en stock completo. Esperando asignación de orden en el módulo de Ventas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Info size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', display: 'inline' }} />
          <p>No se encontraron lotes de fruta registrados. Agrega ingresos en el módulo de **Compras**.</p>
        </div>
      )}
      
      <style>{`
        @media (max-width: 900px) {
          .responsive-trace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
