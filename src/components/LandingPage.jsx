import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Award, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  CheckCircle2, 
  X, 
  ShoppingCart, 
  Sprout 
} from 'lucide-react';

export default function LandingPage({ onNavigateToLogin, purchases }) {
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'producer', 'buyer_catalog', 'quote', 'success'
  const [selectedLot, setSelectedLot] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [producerForm, setProducerForm] = useState({
    name: '',
    phone: '',
    berry: 'Fresa',
    variety: '',
    estimatedKg: '',
    location: ''
  });

  const [quoteForm, setQuoteForm] = useState({
    clientName: '',
    clientEmail: '',
    targetCountry: '',
    message: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Filter purchases for public catalogue: Approved and has remaining stock
  const availableLots = (purchases || []).filter(
    p => p.qcStatus === 'APPROVED' && p.remainingKg > 0
  );

  const handleProducerSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(
      `¡Gracias, ${producerForm.name}! Tu solicitud de registro para el envío de ${producerForm.estimatedKg} kg de ${producerForm.berry} en ${producerForm.location} ha sido recibida. Un inspector de Fresh Frut se comunicará contigo en menos de 24 horas para coordinar la inspección en huerto.`
    );
    setActiveModal('success');
    setProducerForm({ name: '', phone: '', berry: 'Fresa', variety: '', estimatedKg: '', location: '' });
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(
      `¡Solicitud enviada con éxito! Hemos registrado tu interés por el lote ${selectedLot.id} (${selectedLot.berry} - ${selectedLot.remainingKg.toLocaleString()} kg). Enviaremos una cotización formal y los certificados de calidad QC al correo ${quoteForm.clientEmail} de inmediato.`
    );
    setActiveModal('success');
    setQuoteForm({ clientName: '', clientEmail: '', targetCountry: '', message: '' });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Mensaje enviado con éxito. Gracias por contactar a Fresh Frut, ${contactForm.name}.`);
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleOpenQuote = (lot) => {
    setSelectedLot(lot);
    setActiveModal('quote');
  };

  return (
    <div style={layoutStyle}>
      {/* 1. Header & Navigation */}
      <header style={headerStyle} className="glass-panel">
        <div style={logoStyle}>
          Fresh<span style={{ color: 'var(--color-strawberry)' }}>Frut</span>
        </div>
        <nav style={navStyle}>
          <a href="#inicio" style={navLinkStyle}>Inicio</a>
          <a href="#productores" style={navLinkStyle}>Productores</a>
          <a href="#compradores" style={navLinkStyle}>Compradores</a>
          <a href="#calidad" style={navLinkStyle}>Calidad</a>
          <a href="#contacto" style={navLinkStyle}>Contacto</a>
        </nav>
        <button onClick={onNavigateToLogin} style={adminButtonStyle} className="btn-primary">
          Portal Interno
        </button>
      </header>

      {/* 2. Hero Section */}
      <section id="inicio" style={heroSectionStyle}>
        <div className="landing-hero-glow"></div>
        <div className="landing-hero-glow-left"></div>
        <div className="landing-grid animate-fade-in">
          <div style={heroTextStyle} className="animate-slide-up">
            <span style={pillLabelStyle}>
              <Award size={12} /> Líderes en Exportación de Berries
            </span>
            <h1 style={heroHeadlineStyle}>
              Conectamos los mejores huertos con los mercados más exigentes
            </h1>
            <p style={heroSubheadStyle}>
              Fresh Frut gestiona la cadena de suministro de fresas, arándanos, frambuesas y moras con tecnología en tiempo real y trazabilidad absoluta desde la cosecha hasta el destino internacional.
            </p>
            <div style={heroActionsStyle}>
              <a href="#productores" style={heroCtaPrimaryStyle} className="btn-primary">
                Soy Productor <Sprout size={16} />
              </a>
              <a href="#compradores" style={heroCtaSecondaryStyle} className="btn-secondary">
                Soy Comprador <ShoppingCart size={16} />
              </a>
            </div>
          </div>
          <div style={heroImageWrapperStyle} className="animate-float">
            <img 
              src="/fresh_berries_hero.png" 
              alt="Fresh Berries Fresh Frut" 
              style={heroImageStyle} 
            />
            <div style={imageOverlayGlow}></div>
          </div>
        </div>
      </section>

      {/* 3. Features Quick Overview */}
      <section style={featuresSectionStyle}>
        <div style={featureCardStyle} className="glass-panel landing-card">
          <ShieldCheck size={32} color="var(--color-success)" />
          <h3>Estándares Fitosanitarios</h3>
          <p>Inspección rigurosa de grados Brix, firmeza y descarte de moho en nuestro laboratorio interno.</p>
        </div>
        <div style={featureCardStyle} className="glass-panel landing-card">
          <TrendingUp size={32} color="var(--color-blueberry)" />
          <h3>Inteligencia de Mercado</h3>
          <p>Precios justos y transparentes basados en la cotización internacional y calidad de fruta.</p>
        </div>
        <div style={featureCardStyle} className="glass-panel landing-card">
          <MapPin size={32} color="var(--color-raspberry)" />
          <h3>Trazabilidad Total</h3>
          <p>Monitoreo completo del lote: huerto de origen, bodega, pre-enfriado, tránsito y entrega final.</p>
        </div>
      </section>

      {/* 4. Producers Section */}
      <section id="productores" style={sectionStyle}>
        <div className="landing-grid">
          <div style={sectionImageContainerStyle}>
            <div style={imagePlaceholderStyle} className="glass-panel">
              <Sprout size={48} color="var(--color-success)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Logística del Productor</h2>
              <ul style={listStyle}>
                <li>✓ Pesaje certificado en planta de acopio.</li>
                <li>✓ Resultados QC emitidos en menos de 2 horas.</li>
                <li>✓ Liquidación directa y transparente.</li>
                <li>✓ Financiamiento de cajas y asesoría de campo.</li>
              </ul>
            </div>
          </div>
          <div style={sectionTextStyle}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>PRODUCTORES & SOCIOS</span>
            <h2 style={sectionTitleStyle}>¿Cultivas fresas, arándanos, frambuesas o moras?</h2>
            <p style={sectionDescStyle}>
              En Fresh Frut valoramos tu trabajo. Te ofrecemos un canal de comercialización directo con exportación garantizada a Norteamérica, Europa y Asia. Monitoreamos la recepción y calidad con total transparencia financiera.
            </p>
            <button onClick={() => setActiveModal('producer')} style={sectionBtnStyle} className="btn-primary">
              Registrar Lote para Envío <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Buyers Section */}
      <section id="compradores" style={buyersSectionBgStyle}>
        <div className="landing-grid">
          <div style={sectionTextStyle}>
            <span style={{ color: 'var(--color-blueberry)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>COMPRADORES & CLIENTES</span>
            <h2 style={sectionTitleStyle}>Abastecimiento global seguro y confiable</h2>
            <p style={sectionDescStyle}>
              Adquiere lotes certificados y listos para exportación. Garantizamos el cumplimiento de las normas de inocuidad alimentaria y niveles óptimos de madurez. Conoce nuestra disponibilidad en bodega en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setActiveModal('buyer_catalog')} 
                style={{ ...sectionBtnStyle, background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)' }} 
                className="btn-primary"
              >
                Ver Disponibilidad en Bodega <ShoppingCart size={16} />
              </button>
            </div>
          </div>
          <div style={sectionImageContainerStyle}>
            <div style={{ ...imagePlaceholderStyle, border: '1px solid rgba(59, 130, 246, 0.2)' }} className="glass-panel">
              <Award size={48} color="var(--color-blueberry)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Garantía Fresh Frut</h2>
              <ul style={listStyle}>
                <li>✓ Fruta pre-enfriada por aire forzado.</li>
                <li>✓ Cadena de frío controlada a 0.5 °C.</li>
                <li>✓ Reportes QC descargables digitales.</li>
                <li>✓ Trazabilidad por código QR de tarima.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quality standards */}
      <section id="calidad" style={sectionStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: 'var(--color-strawberry)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>FILOSOFÍA DE CALIDAD</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '6px' }}>Parámetros Críticos QC</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
            Nuestra fruta es clasificada e inspeccionada en base a estándares estrictos antes de asignarse a pedidos de exportación.
          </p>
        </div>
        <div style={qcSpecsGridStyle}>
          <div style={qcSpecCardStyle} className="glass-panel">
            <h4 style={{ color: 'var(--color-strawberry)', fontWeight: 600 }}>Fresa (Strawberry)</h4>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>Brix Mínimo: <strong>8.0°Bx</strong></div>
            <div style={{ padding: '8px 0' }}>Firmeza Mínima: <strong>350 g/mm</strong></div>
          </div>
          <div style={qcSpecCardStyle} className="glass-panel">
            <h4 style={{ color: 'var(--color-blueberry)', fontWeight: 600 }}>Arándano (Blueberry)</h4>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>Brix Mínimo: <strong>11.0°Bx</strong></div>
            <div style={{ padding: '8px 0' }}>Firmeza Mínima: <strong>140 g/mm</strong></div>
          </div>
          <div style={qcSpecCardStyle} className="glass-panel">
            <h4 style={{ color: 'var(--color-raspberry)', fontWeight: 600 }}>Frambuesa (Raspberry)</h4>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>Brix Mínimo: <strong>8.5°Bx</strong></div>
            <div style={{ padding: '8px 0' }}>Firmeza Mínima: <strong>120 g/mm</strong></div>
          </div>
          <div style={qcSpecCardStyle} className="glass-panel">
            <h4 style={{ color: 'var(--color-blackberry)', fontWeight: 600 }}>Mora (Blackberry)</h4>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>Brix Mínimo: <strong>8.0°Bx</strong></div>
            <div style={{ padding: '8px 0' }}>Firmeza Mínima: <strong>130 g/mm</strong></div>
          </div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contacto" style={contactSectionStyle} className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', width: '100%' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Contáctanos</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              ¿Tienes dudas sobre los procesos de entrega, precios o contratos de importación? Envíanos un mensaje y un ejecutivo especializado te asistirá.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={contactItemStyle}>
                <Mail size={16} color="var(--color-strawberry)" />
                <span>contacto@freshfrut.com</span>
              </div>
              <div style={contactItemStyle}>
                <Phone size={16} color="var(--color-strawberry)" />
                <span>+52 (33) 4567-8901</span>
              </div>
              <div style={contactItemStyle}>
                <MapPin size={16} color="var(--color-strawberry)" />
                <span>Zapopan, Jalisco, México</span>
              </div>
            </div>
          </div>
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ingresa tu nombre" 
                required 
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="correo@ejemplo.com" 
                required 
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="Escribe tu mensaje aquí..." 
                style={{ resize: 'none', fontFamily: 'inherit' }} 
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>

      {/* Footer copyright */}
      <footer style={footerStyle}>
        <p>© 2026 Fresh Frut. Todos los derechos reservados.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Tecnología de Trazabilidad y Gestión de Agro-Exportación de Berries.
        </p>
      </footer>

      {/* --- MODAL: PRODUCER PRE-REGISTER --- */}
      {activeModal === 'producer' && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleProducerSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={20} color="var(--color-success)" /> Registro de Lote para Inspección
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Proporciona los datos preliminares de tu cultivo para agendar una visita de muestreo fitosanitario en huerto por nuestro personal técnico.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Productor / Huerto</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Rancho Los Berries, Juan Pérez" 
                  required
                  value={producerForm.name}
                  onChange={(e) => setProducerForm({...producerForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Ej: 3312345678" 
                  required
                  value={producerForm.phone}
                  onChange={(e) => setProducerForm({...producerForm, phone: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Berry</label>
                  <select 
                    className="form-select"
                    value={producerForm.berry}
                    onChange={(e) => setProducerForm({...producerForm, berry: e.target.value})}
                  >
                    <option value="Fresa">Fresa</option>
                    <option value="Arándano">Arándano</option>
                    <option value="Frambuesa">Frambuesa</option>
                    <option value="Mora">Mora</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Variedad (Si se conoce)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: Albion, Biloxi"
                    value={producerForm.variety}
                    onChange={(e) => setProducerForm({...producerForm, variety: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Kilos Estimados</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Ej: 5000" 
                    required
                    value={producerForm.estimatedKg}
                    onChange={(e) => setProducerForm({...producerForm, estimatedKg: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ubicación (Municipio)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: Jocotepec, Jal." 
                    required
                    value={producerForm.location}
                    onChange={(e) => setProducerForm({...producerForm, location: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)' }}>
                  Registrar Solicitud
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL: BUYER WAREHOUSE CATALOGUE --- */}
      {activeModal === 'buyer_catalog' && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={{ ...modalContentStyle, maxWidth: '780px' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="var(--color-blueberry)" /> Disponibilidad en Bodega en Tiempo Real
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Los siguientes lotes han completado con éxito la inspección fitosanitaria y están pre-enfriados en bodega, listos para carga inmediata y exportación.
            </p>

            <div className="table-container" style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Lote ID</th>
                    <th>Berry</th>
                    <th>Variedad</th>
                    <th>Kilos Disponibles</th>
                    <th>Ubicación</th>
                    <th>Fecha Recepción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {availableLots.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                        No hay lotes aprobados disponibles en bodega en este momento. Por favor contacta al equipo de ventas directamente.
                      </td>
                    </tr>
                  ) : (
                    availableLots.map(lot => (
                      <tr key={lot.id}>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{lot.id}</td>
                        <td style={{ fontWeight: 600 }}>{lot.berry}</td>
                        <td>{lot.variety || 'N/A'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                          {lot.remainingKg.toLocaleString()} kg
                        </td>
                        <td>{lot.storageLocation}</td>
                        <td>{lot.date}</td>
                        <td>
                          <button 
                            onClick={() => handleOpenQuote(lot)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)' }}
                          >
                            Cotizar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: QUOTE REQUEST --- */}
      {activeModal === 'quote' && selectedLot && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleQuoteSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--color-blueberry)" /> Solicitar Cotización de Lote
              </h3>
              <button type="button" onClick={() => setActiveModal('buyer_catalog')} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            {/* Lot mini info */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--panel-border)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              marginBottom: '16px'
            }}>
              <div>Lote Origen: <strong>{selectedLot.id}</strong></div>
              <div>Berry: <strong>{selectedLot.berry} ({selectedLot.variety || 'Variedad N/A'})</strong></div>
              <div>Volumen Disponible: <strong style={{ color: 'var(--color-success)' }}>{selectedLot.remainingKg.toLocaleString()} kg</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Cliente / Empresa</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: BerryImports LLC" 
                  required
                  value={quoteForm.clientName}
                  onChange={(e) => setQuoteForm({...quoteForm, clientName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico de Negocios</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="compras@empresa.com" 
                  required
                  value={quoteForm.clientEmail}
                  onChange={(e) => setQuoteForm({...quoteForm, clientEmail: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">País / Ciudad Destino</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Los Angeles, EUA o Rotterdam, Holanda" 
                  required
                  value={quoteForm.targetCountry}
                  onChange={(e) => setQuoteForm({...quoteForm, targetCountry: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Instrucciones o Mensaje Especial</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Indica si requieres un empaque especial (clamshell, tarima armada, etc.)"
                  style={{ resize: 'none' }}
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveModal('buyer_catalog')} className="btn-secondary">Atrás</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)' }}>
                  Enviar Solicitud
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL: SUCCESS MESSAGE --- */}
      {activeModal === 'success' && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="glass-panel modal-content" style={{ ...modalContentStyle, textAlign: 'center', padding: '36px 24px' }}>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ display: 'inline-block', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>¡Operación Completada!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              {successMessage}
            </p>
            <button onClick={() => setActiveModal(null)} className="btn-primary" style={{ padding: '8px 24px' }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling configurations
const layoutStyle = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'var(--font-sans)',
  overflowX: 'hidden',
  background: 'var(--bg-main)',
  backgroundImage: 'var(--bg-gradient)',
  backgroundAttachment: 'fixed',
  position: 'relative',
  paddingTop: '80px' // offset header height
};

const headerStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 40px',
  zIndex: 1000,
  borderRadius: '0',
  borderBottom: '1px solid var(--panel-border)',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  backdropFilter: 'blur(12px)'
};

const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'white',
  letterSpacing: '-0.02em',
  cursor: 'default'
};

const navStyle = {
  display: 'flex',
  gap: '30px'
};

const navLinkStyle = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'color var(--transition-fast)'
};

const adminButtonStyle = {
  padding: '8px 18px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, var(--color-strawberry) 0%, #be123c 100%)',
  border: 'none',
  color: 'white'
};

const heroSectionStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '60px 20px',
  position: 'relative'
};

const heroTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '20px'
};

const pillLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '20px',
  padding: '4px 12px',
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  fontWeight: 500
};

const heroHeadlineStyle = {
  fontFamily: 'var(--font-title)',
  fontSize: '3.25rem',
  fontWeight: 800,
  lineHeight: '1.15',
  color: 'white',
  letterSpacing: '-0.03em'
};

const heroSubheadStyle = {
  fontSize: '1.05rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  maxWidth: '540px'
};

const heroActionsStyle = {
  display: 'flex',
  gap: '16px',
  width: '100%',
  flexWrap: 'wrap'
};

const heroCtaPrimaryStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textDecoration: 'none',
  background: 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)',
  color: 'white',
  border: 'none'
};

const heroCtaSecondaryStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textDecoration: 'none',
  border: '1px solid var(--panel-border)',
  color: 'white'
};

const heroImageWrapperStyle = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const heroImageStyle = {
  width: '100%',
  maxWidth: '480px',
  height: 'auto',
  borderRadius: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 2
};

const imageOverlayGlow = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  background: 'radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
  zIndex: 1,
  pointerEvents: 'none'
};

const featuresSectionStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px 20px 60px 20px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px'
};

const featureCardStyle = {
  padding: '28px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const sectionStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '80px 20px'
};

const buyersSectionBgStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.01)',
  borderTop: '1px solid rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  padding: '80px 20px'
};

const sectionTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '16px'
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-title)',
  fontSize: '2.25rem',
  fontWeight: 800,
  color: 'white',
  lineHeight: '1.2'
};

const sectionDescStyle = {
  fontSize: '1rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6'
};

const sectionBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  background: 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer'
};

const sectionImageContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const imagePlaceholderStyle = {
  width: '100%',
  maxWidth: '450px',
  padding: '40px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
};

const listStyle = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  marginTop: '16px'
};

const qcSpecsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto'
};

const qcSpecCardStyle = {
  padding: '20px',
  borderRadius: '12px',
  fontSize: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const contactSectionStyle = {
  width: 'calc(100% - 40px)',
  maxWidth: '1000px',
  margin: '80px auto',
  padding: '40px'
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)'
};

const footerStyle = {
  marginTop: 'auto',
  padding: '40px 20px',
  textAlign: 'center',
  borderTop: '1px solid var(--panel-border)',
  background: 'rgba(0,0,0,0.2)'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(3, 3, 10, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '520px',
  padding: '28px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--panel-border)',
  paddingBottom: '12px',
  marginBottom: '14px'
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  paddingBottom: '4px'
};
