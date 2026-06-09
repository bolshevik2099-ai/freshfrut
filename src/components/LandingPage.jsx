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
    packagingType: 'Bolsa Retail (300g - 1kg)',
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
      `¡Gracias, ${producerForm.name}! Tu solicitud de entrega para procesamiento de ${producerForm.estimatedKg} kg de ${producerForm.berry} frescas en ${producerForm.location} ha sido recibida. Un asesor se comunicará contigo en menos de 24 horas para programar la recepción y control de calidad de fruta fresca en planta.`
    );
    setActiveModal('success');
    setProducerForm({ name: '', phone: '', berry: 'Fresa', variety: '', estimatedKg: '', location: '' });
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(
      `¡Solicitud enviada con éxito! Hemos registrado tu interés por el lote ${selectedLot.id} (${selectedLot.berry} - ${selectedLot.remainingKg.toLocaleString()} kg) con empaque "${quoteForm.packagingType}". Enviaremos la cotización formal B2B y las fichas técnicas microbiológicas y de calidad del congelado al correo ${quoteForm.clientEmail} de inmediato.`
    );
    setActiveModal('success');
    setQuoteForm({ clientName: '', clientEmail: '', targetCountry: '', packagingType: 'Bolsa Retail (300g - 1kg)', message: '' });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Mensaje enviado con éxito. Gracias por contactar a Tamfresh, ${contactForm.name}.`);
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleOpenQuote = (lot) => {
    setSelectedLot(lot);
    setActiveModal('quote');
  };

  return (
    <div style={layoutStyle} className="landing-layout">
      {/* 1. Header & Navigation */}
      <header style={headerStyle} className="glass-panel landing-header">
        <div style={{ ...logoStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/tamfresh_logo.png" 
            alt="Tamfresh Logo" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
            Tam<span style={{ color: 'var(--color-success)' }}>fresh</span>
          </span>
        </div>
        <nav style={navStyle}>
          <a href="#inicio" style={navLinkStyle}>Inicio</a>
          <a href="#origen" style={navLinkStyle}>Origen y Calidad</a>
          <a href="#compradores" style={navLinkStyle}>Productos</a>
          <a href="#contacto" style={navLinkStyle}>Contacto</a>
        </nav>
        <button onClick={onNavigateToLogin} style={adminButtonStyle} className="btn-primary">
          Iniciar Sesión
        </button>
      </header>

      {/* 2. Hero Section */}
      <section id="inicio" style={heroSectionStyle}>
        <div className="landing-hero-glow"></div>
        <div className="landing-hero-glow-left"></div>
        <div className="landing-grid animate-fade-in">
          <div style={heroTextStyle} className="animate-slide-up">
            <span style={pillLabelStyle}>
              <Award size={12} /> Suministro de Berries Congeladas y Empacadas
            </span>
            <h1 style={heroHeadlineStyle}>
              Berries congeladas y empacadas listas para tu marca
            </h1>
            <p style={heroSubheadStyle}>
              Suministramos fresas, arándanos, frambuesas y moras congeladas de origen y empacadas a la medida de tu negocio. Soluciones premium y stock constante todo el año para marcas de consumo, cadenas de supermercados y distribuidores.
            </p>
            <div style={heroActionsStyle}>
              <a href="#compradores" style={heroCtaPrimaryStyle} className="btn-primary">
                Ver Catálogo <ShoppingCart size={16} />
              </a>
              <a href="#contacto" style={heroCtaSecondaryStyle} className="btn-secondary">
                Solicitar Cotización <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div style={heroImageWrapperStyle} className="animate-float">
            <img 
              src="/fresh_berries_hero.png" 
              alt="Berries Congeladas Tamfresh" 
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
          <h3>Congelación y Conservación</h3>
          <p>Congelamos las berries en su punto óptimo de madurez para preservar su sabor, textura, nutrientes y frescura de forma natural.</p>
        </div>
        <div style={featureCardStyle} className="glass-panel landing-card">
          <TrendingUp size={32} color="var(--color-blueberry)" />
          <h3>Empaque Retail & B2B</h3>
          <p>Diferentes formatos de envasado listos para anaquel, private label o empaques bulk de cartón para distribución e industria.</p>
        </div>
        <div style={featureCardStyle} className="glass-panel landing-card">
          <MapPin size={32} color="var(--color-raspberry)" />
          <h3>Cadena de Frío Activa</h3>
          <p>Monitoreo térmico constante en cámaras a -18°C y contenedores refrigerados para conservar la fruta sin pérdidas.</p>
        </div>
      </section>

      {/* 4. Process Section */}
      <section id="origen" style={sectionStyle}>
        <div className="landing-grid">
          <div style={sectionImageContainerStyle}>
            <div style={imagePlaceholderStyle} className="glass-panel">
              <Sprout size={48} color="var(--color-success)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Nuestro Proceso</h2>
              <ul style={listStyle}>
                <li>✓ Alianza directa con agricultores locales.</li>
                <li>✓ Recepción diaria de fruta fresca seleccionada.</li>
                <li>✓ Riguroso proceso de lavado y selección óptica.</li>
                <li>✓ Congelación inmediata para retener frescura.</li>
              </ul>
            </div>
          </div>
          <div style={sectionTextStyle}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>DE LA TIERRA A TU NEGOCIO</span>
            <h2 style={sectionTitleStyle}>Nuestro Origen y Garantía de Calidad</h2>
            <p style={sectionDescStyle}>
              Seleccionamos las mejores cosechas frescas directamente de huertos locales asociados. Procesamos las berries de inmediato en nuestra planta agroindustrial, sometiéndolas a un riguroso control y limpieza antes de su congelado y empaquetado. Esto garantiza que recibas fruta con la máxima frescura y calidad intacta.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Buyers Section */}
      <section id="compradores" style={buyersSectionBgStyle}>
        <div className="landing-grid">
          <div style={sectionTextStyle}>
            <span style={{ color: 'var(--color-blueberry)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>CLIENTES & DISTRIBUIDORES</span>
            <h2 style={sectionTitleStyle}>Venta de Berries Congeladas y Empacadas</h2>
            <p style={sectionDescStyle}>
              Comercializamos y vendemos fresas, arándanos, frambuesas y moras congeladas de primera calidad. Abastecemos a marcas de alimentos, cadenas de supermercados y distribuidores de foodservice. Entregamos fruta empacada y lista en la presentación que necesites (retail, foodservice o granel industrial).
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setActiveModal('buyer_catalog')} 
                style={{ 
                  ...sectionBtnStyle, 
                  background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)',
                  color: 'white'
                }} 
                className="btn-primary"
              >
                Ver Catálogo de Venta <ShoppingCart size={16} />
              </button>
            </div>
          </div>
          <div style={sectionImageContainerStyle}>
            <div style={{ ...imagePlaceholderStyle, border: '1px solid rgba(59, 130, 246, 0.2)' }} className="glass-panel">
              <Award size={48} color="var(--color-blueberry)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Soluciones de Empaque B2B</h2>
              <ul style={listStyle}>
                <li>✓ Bolsa Retail: Stand-up Pouch o Almohada (300g, 500g, 1kg).</li>
                <li>✓ Caja Foodservice: Caja de cartón con liner (5kg y 10kg).</li>
                <li>✓ Granel Industrial: Cajas de 20kg+ y Octobines.</li>
                <li>✓ Inocuidad Garantizada: Certificaciones FDA y HACCP.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* 7. Contact Section */}
      <section id="contacto" style={contactSectionStyle} className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', width: '100%' }} className="responsive-chart-grid">
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Contáctanos</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              ¿Tienes dudas sobre los procesos de maquila, empaque personalizado, precios por volumen o contratos de distribución de congelados? Envíanos un mensaje y te asistiremos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={contactItemStyle}>
                <Mail size={16} color="var(--color-strawberry)" />
                <span>contacto@tamfresh.com</span>
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <img 
            src="/tamfresh_logo.png" 
            alt="Tamfresh Logo" 
            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tamfresh</span>
        </div>
        <p>© 2026 Tamfresh. Todos los derechos reservados.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Tecnología de Trazabilidad y Gestión Agroindustrial de Berries Congeladas y Empacadas.
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
              Proporciona los datos preliminares de tu cosecha fresca para programar la entrega, inspección de calidad e ingreso al proceso de congelación.
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row-responsive">
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row-responsive">
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
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', color: 'white' }}>
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
              Los siguientes lotes de berries congeladas han completado con éxito el procesamiento de empaque e inocuidad y están disponibles en bodega para carga inmediata.
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
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blueberry-dark) 100%)', color: 'white' }}
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
              <label className="form-label">Presentación de Empaque Requerido</label>
              <select 
                className="form-select"
                value={quoteForm.packagingType}
                onChange={(e) => setQuoteForm({...quoteForm, packagingType: e.target.value})}
              >
                <option value="Bolsa Retail (300g - 1kg)">Bolsa Retail (300g - 1kg)</option>
                <option value="Caja Foodservice (5kg - 10kg)">Caja Foodservice (5kg - 10kg)</option>
                <option value="Granel Industrial (20kg+ / Octobines)">Granel Industrial (20kg+ / Octobines)</option>
                <option value="Marca Privada (Private Label personalizado)">Marca Privada (Private Label personalizado)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Instrucciones o Mensaje Especial</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Indica especificaciones adicionales de empaque, etiquetado o logística de refrigeración"
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>¡Operación Completada!</h3>
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
  color: 'var(--text-primary)',
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
  background: 'linear-gradient(135deg, var(--color-strawberry) 0%, var(--color-raspberry) 100%)',
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
  border: '1px solid var(--panel-border)',
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
  color: 'var(--text-primary)',
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
  background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)',
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
  color: 'var(--text-primary)'
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
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid var(--panel-border)',
  zIndex: 2
};

const imageOverlayGlow = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
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
  background: 'rgba(0, 0, 0, 0.01)',
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
  color: 'var(--text-primary)',
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
  color: 'var(--text-primary)',
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
  background: 'rgba(0, 0, 0, 0.01)',
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
  maxWidth: '520px',
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

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--panel-border)',
  paddingBottom: '4px'
};
