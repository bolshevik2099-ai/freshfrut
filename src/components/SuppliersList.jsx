import React, { useState } from 'react';
import { UserPlus, User, Phone, Mail, MapPin, Edit2, Trash2, X, Plus } from 'lucide-react';

export default function SuppliersList({ suppliers, addSupplier, editSupplier, deleteSupplier }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Edit Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const id = `PROV-${Math.floor(100 + Math.random() * 900)}`;
    const newSupplier = {
      id,
      name,
      phone: phone || 'N/A',
      email: email || 'N/A',
      location: location || 'N/A'
    };

    addSupplier(newSupplier);
    setIsSuccess(true);
    
    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditPhone(item.phone);
    setEditEmail(item.email);
    setEditLocation(item.location);
    setActiveModal('edit');
  };

  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    editSupplier(selectedItem.id, {
      name: editName,
      phone: editPhone || 'N/A',
      email: editEmail || 'N/A',
      location: editLocation || 'N/A'
    });

    setActiveModal(null);
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Administración de Proveedores</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Registra y gestiona los datos de contacto de agricultores, huertos y productores de berries del sistema.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        gap: '24px'
      }} className="responsive-suppliers-grid">
        
        {/* Registration Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--color-strawberry)" />
            Registrar Nuevo Proveedor
          </h3>

          {isSuccess && (
            <div className="badge badge-success" style={{ padding: '10px', borderRadius: '8px', display: 'block', textAlign: 'center', fontSize: '0.85rem' }}>
              ✓ Proveedor registrado con éxito en el directorio.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nombre del Agricultor / Razón Social</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Nombre completo o Empresa Agrícola"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Ej: 351-555-0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  placeholder="Ej: contacto@rancho.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ubicación / Localidad (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Ej: Zamora, Michoacán"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
              <Plus size={18} /> Registrar Proveedor
            </button>
          </form>
        </div>

        {/* Directory Table */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
            Directorio de Proveedores Activos
          </h3>

          <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.location}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openEdit(s)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-blueberry)' }} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteSupplier(s.id)} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-danger)' }} title="Eliminar">
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
      </div>

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && selectedItem && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <form onSubmit={handleEditSubmit} className="glass-panel modal-content" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.25rem' }}>Editar Proveedor: {selectedItem.id}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Agricultor</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Ubicación / Localidad</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="form-input" />
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

// Reuse modal styles
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
