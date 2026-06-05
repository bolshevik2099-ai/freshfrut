import React, { useState, useEffect } from 'react';
import { ClipboardCheck, ShieldCheck, ShieldAlert, CheckCircle2, RotateCcw, Info } from 'lucide-react';

export default function QualityControl({ purchases, updatePurchaseQcStatus }) {
  // Filter pending purchases to inspect
  const pendingPurchases = purchases.filter(p => p.qcStatus === 'PENDING');

  // Form states
  const [selectedLotId, setSelectedLotId] = useState('');
  const [berryType, setBerryType] = useState('Fresa');
  const [variety, setVariety] = useState('Albion');
  const [producer, setProducer] = useState('');
  const [brix, setBrix] = useState(8.5);
  const [firmness, setFirmness] = useState(420);
  const [softFruit, setSoftFruit] = useState(1.5);
  const [mold, setMold] = useState(0);
  const [targetMarket, setTargetMarket] = useState('USA');
  const [inspector, setInspector] = useState('Ing. Sofía Martínez');

  // Validation results
  const [qcStatus, setQcStatus] = useState('APPROVED'); // APPROVED, WARNING, REJECTED
  const [qcReasons, setQcReasons] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastLotId, setLastLotId] = useState('');

  // Auto-fill metadata when lot is selected
  useEffect(() => {
    if (selectedLotId) {
      const lot = purchases.find(p => p.id === selectedLotId);
      if (lot) {
        setBerryType(lot.berry);
        setVariety(lot.variety);
        setProducer(lot.producer);
        
        // Default technical standards according to fruit
        if (lot.berry === 'Arándano') {
          setBrix(12.5);
          setFirmness(170);
        } else if (lot.berry === 'Frambuesa') {
          setBrix(9.0);
          setFirmness(140);
        } else if (lot.berry === 'Mora') {
          setBrix(8.5);
          setFirmness(150);
        } else {
          setBrix(8.5);
          setFirmness(420);
        }
      }
    } else {
      setBerryType('Fresa');
      setVariety('Albion');
      setProducer('');
    }
  }, [selectedLotId, purchases]);

  // Live validator effect
  useEffect(() => {
    const reasons = [];
    let status = 'APPROVED';

    // 1. Brix check
    if (berryType === 'Fresa' && brix < 8.0) {
      status = 'WARNING';
      reasons.push('Grados Brix bajos para Fresa (Mínimo recomendado: 8.0°Bx)');
    } else if (berryType === 'Arándano' && brix < 11.0) {
      status = 'WARNING';
      reasons.push('Grados Brix bajos para Arándano (Mínimo recomendado: 11.0°Bx)');
    } else if (berryType === 'Frambuesa' && brix < 8.5) {
      status = 'WARNING';
      reasons.push('Grados Brix bajos para Frambuesa (Mínimo recomendado: 8.5°Bx)');
    } else if (berryType === 'Mora' && brix < 8.0) {
      status = 'WARNING';
      reasons.push('Grados Brix bajos para Mora (Mínimo recomendado: 8.0°Bx)');
    }

    // 2. Firmness check (softness limits)
    if (berryType === 'Fresa' && firmness < 350) {
      status = 'REJECTED';
      reasons.push('Firmeza crítica de Fresa (Mínimo de exportación: 350 g/mm)');
    } else if (berryType === 'Arándano' && firmness < 140) {
      status = 'REJECTED';
      reasons.push('Firmeza crítica de Arándano (Mínimo de exportación: 140 g/mm)');
    } else if (berryType === 'Frambuesa' && firmness < 120) {
      status = 'REJECTED';
      reasons.push('Firmeza crítica de Frambuesa (Mínimo de exportación: 120 g/mm)');
    } else if (berryType === 'Mora' && firmness < 130) {
      status = 'REJECTED';
      reasons.push('Firmeza crítica de Mora (Mínimo de exportación: 130 g/mm)');
    }

    // 3. Mold check (zero tolerance for export)
    if (mold > 0) {
      status = 'REJECTED';
      reasons.push('Presencia de moho/hongo (Tolerancia CERO para mercado internacional)');
    }

    // 4. Soft fruit percentage check
    if (softFruit > 5) {
      status = 'REJECTED';
      reasons.push('Exceso de fruta blanda/machucada (> 5% de tolerancia)');
    } else if (softFruit > 3) {
      if (status !== 'REJECTED') status = 'WARNING';
      reasons.push('Nivel elevado de fruta blanda (> 3% tolerancia advertida)');
    }

    // 5. Market-specific overrides
    if (targetMarket === 'Japón') {
      if (softFruit > 2 && status !== 'REJECTED') {
        status = 'WARNING';
        reasons.push('Japón exige tolerancia máxima de fruta blanda < 2%');
      }
      if (brix < 9.5 && berryType === 'Fresa' && status !== 'REJECTED') {
        status = 'WARNING';
        reasons.push('Japón prefiere dulzor superior a 9.5°Bx para Fresa');
      }
    }

    setQcStatus(status);
    setQcReasons(reasons);
  }, [berryType, brix, firmness, softFruit, mold, targetMarket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLotId) return;

    const qcData = {
      brix,
      firmness,
      softFruit,
      mold,
      targetMarket,
      inspector,
      qcScore: mold > 0 ? '50%' : softFruit > 4 ? '85%' : '98%'
    };

    updatePurchaseQcStatus(selectedLotId, qcStatus, qcData);
    setLastLotId(selectedLotId);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedLotId('');
    setBrix(8.5);
    setFirmness(420);
    setSoftFruit(1.5);
    setMold(0);
    setTargetMarket('USA');
    setIsSubmitted(false);
    setLastLotId('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Control de Calidad (QC)</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Simulador digital de inspección técnica. Evalúa y aprueba lotes cosechados para su comercialización internacional.
        </p>
      </div>

      {isSubmitted ? (
        /* Success Screen */
        <div className="glass-panel" style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          borderColor: qcStatus === 'APPROVED' ? 'var(--color-success)' : qcStatus === 'WARNING' ? 'var(--color-warning)' : 'var(--color-danger)'
        }}>
          <CheckCircle2 size={64} color={qcStatus === 'APPROVED' ? 'var(--color-success)' : qcStatus === 'WARNING' ? 'var(--color-warning)' : 'var(--color-danger)'} />
          <div>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>¡Calidad Registrada!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              El lote <strong>{lastLotId}</strong> ha sido evaluado como:
            </p>
            <div style={{ marginTop: '12px' }}>
              {qcStatus === 'APPROVED' && <span className="badge badge-success" style={{ fontSize: '1rem', padding: '8px 16px' }}>APROBADO PARA EXPORTACIÓN</span>}
              {qcStatus === 'WARNING' && <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '8px 16px' }}>ADVERTENCIA DE CALIDAD</span>}
              {qcStatus === 'REJECTED' && <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '8px 16px' }}>RECHAZADO / MERCADO LOCAL</span>}
            </div>
          </div>

          <button onClick={handleReset} className="btn-primary" style={{ marginTop: '10px' }}>
            <RotateCcw size={16} /> Evaluar Otro Lote
          </button>
        </div>
      ) : (
        /* QC Form & Visual Validator Layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: '24px'
        }} className="responsive-qc-grid">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck size={20} color="var(--color-strawberry)" />
              Peritaje Técnico de Lote
            </h3>

            {pendingPurchases.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--panel-border)',
                padding: '40px 20px',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Info size={36} style={{ color: 'var(--color-blueberry)', marginBottom: '12px', display: 'inline' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No hay lotes pendientes de inspección en planta.</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Todos los ingresos registrados en compras ya cuentan con una inspección de calidad final.
                </p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Seleccionar Lote Pendiente (Inventario)</label>
                  <select 
                    value={selectedLotId} 
                    onChange={(e) => setSelectedLotId(e.target.value)} 
                    className="form-select"
                    required
                  >
                    <option value="">-- Elige un lote para evaluar --</option>
                    {pendingPurchases.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.berry} ({p.variety}) | {p.producer} | {p.kg.toLocaleString()} kg
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLotId && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row-responsive">
                      <div className="form-group">
                        <label className="form-label">Tipo de Berry (Lectura)</label>
                        <input type="text" className="form-input" value={berryType} disabled style={{ opacity: 0.6 }} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mercado Objetivo</label>
                        <select value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} className="form-select">
                          <option value="USA">Estados Unidos (FDA)</option>
                          <option value="UE">Unión Europea (GlobalG.A.P.)</option>
                          <option value="Japón">Japón (MRL Estricto)</option>
                          <option value="Local">Nacional / Mercado Local</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row-responsive">
                      <div className="form-group">
                        <label className="form-label">Sólidos Solubles (°Brix)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={brix} 
                          onChange={(e) => setBrix(parseFloat(e.target.value) || 0)} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Firmeza del Fruto (g/mm)</label>
                        <input 
                          type="number" 
                          value={firmness} 
                          onChange={(e) => setFirmness(parseInt(e.target.value) || 0)} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row-responsive">
                      <div className="form-group">
                        <label className="form-label">% Fruta Blanda / Machucones</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={softFruit} 
                          onChange={(e) => setSoftFruit(parseFloat(e.target.value) || 0)} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">% Fruta con Moho / Hongo</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={mold} 
                          onChange={(e) => setMold(parseFloat(e.target.value) || 0)} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Inspector Asignado</label>
                      <input 
                        type="text" 
                        value={inspector} 
                        onChange={(e) => setInspector(e.target.value)} 
                        className="form-input" 
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: 'fit-content' }}>
                      <ClipboardCheck size={18} /> Registrar y Guardar Diagnóstico
                    </button>
                  </>
                )}
              </>
            )}
          </form>

          {/* Validation & Market Rule Panel */}
          {selectedLotId ? (
            <div className="glass-panel" style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              border: qcStatus === 'APPROVED' ? '1px solid rgba(16,185,129,0.3)' : qcStatus === 'WARNING' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(239,68,68,0.3)',
              boxShadow: qcStatus === 'APPROVED' ? '0 0 15px rgba(16,185,129,0.1)' : qcStatus === 'WARNING' ? '0 0 15px rgba(245,158,11,0.1)' : '0 0 15px rgba(239,68,68,0.1)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Validador en Tiempo Real</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Análisis de aptitud comercial para exportación.</p>
              </div>

              {/* Diagnostic Status Box */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                {qcStatus === 'APPROVED' && (
                  <>
                    <ShieldCheck size={48} color="var(--color-success)" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>APTO PARA EXPORTACIÓN</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>El lote cumple con todas las tolerancias técnicas requeridas por {targetMarket}.</p>
                  </>
                )}
                {qcStatus === 'WARNING' && (
                  <>
                    <ShieldAlert size={48} color="var(--color-warning)" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-warning)' }}>ADVERTENCIA DE CALIDAD</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>El lote es apto, pero presenta desviaciones que podrían limitar la vida útil del berry.</p>
                  </>
                )}
                {qcStatus === 'REJECTED' && (
                  <>
                    <ShieldAlert size={48} color="var(--color-danger)" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger)' }}>RECHAZADO PARA EXPORTACIÓN</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>El lote no cumple con las directivas básicas de sanidad o calidad de {targetMarket}. Debe destinarse a mercado nacional o reproceso.</p>
                  </>
                )}
              </div>

              {/* Warning details */}
              {qcReasons.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Detalle de Observaciones ({qcReasons.length})
                  </h4>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    {qcReasons.map((reason, idx) => (
                      <li key={idx} style={{ color: qcStatus === 'REJECTED' ? '#fca5a5' : '#fde047' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target market specifications */}
              <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tolerancias Activas ({targetMarket}):</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0' }}>Brix Mínimo:</td>
                      <strong style={{ color: 'var(--text-primary)', float: 'right' }}>
                        {berryType === 'Arándano' ? '11.0°Bx' : berryType === 'Frambuesa' ? '8.5°Bx' : '8.0°Bx'}
                      </strong>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0' }}>Hongo/Pudrición:</td>
                      <strong style={{ color: 'var(--text-primary)', float: 'right' }}>0.0% (Tolerancia Cero)</strong>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0' }}>Fruta Blanda Máxima:</td>
                      <strong style={{ color: 'var(--text-primary)', float: 'right' }}>{targetMarket === 'Japón' ? '2.0%' : '5.0%'}</strong>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <div>
                <ClipboardCheck size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', display: 'inline' }} />
                <p style={{ fontSize: '0.9rem' }}>Selecciona un lote del inventario para iniciar el análisis en tiempo real.</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @media (max-width: 900px) {
          .responsive-qc-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
