import React, { useState, useEffect } from 'react';
import { Key, Cpu, FileText, Check, X, RefreshCw, Eye, EyeOff, History, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ChatConfig() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek-chat');
  const [customModel, setCustomModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Status indicators
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'loading', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');

  // Audit Logs State
  const [chatLogs, setChatLogs] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [expandedReasoningLogs, setExpandedReasoningLogs] = useState({});

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setChatLogs(data || []);
    } catch (err) {
      console.error('Error fetching chat logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleReasoningLog = (id) => {
    setExpandedReasoningLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const loadConfig = async () => {
      let savedKey = '';
      let savedModel = 'deepseek-chat';
      let savedPrompt = 'Eres un asistente de inteligencia artificial experto en la gestión de exportación de berries para Tamfresh. Ayudas al administrador a analizar inventarios, redactar correos a clientes y proveedores, y resolver dudas de logística o deudas. Responde siempre en español de forma profesional y clara.';

      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          if (data.hasApiKey) {
            savedKey = '••••••••••••••••';
          }
          savedModel = data.model || 'deepseek-chat';
          savedPrompt = data.systemPrompt || savedPrompt;
        } else {
          console.error('Failed to load chat config from API');
        }
      } catch (err) {
        console.error('Error fetching chat config from API:', err);
      }

      setApiKey(savedKey);
      if (savedModel === 'deepseek-chat' || savedModel === 'deepseek-reasoner') {
        setModel(savedModel);
      } else {
        setModel('custom');
        setCustomModel(savedModel);
      }
      setSystemPrompt(savedPrompt);
    };

    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const finalModel = model === 'custom' ? customModel : model;
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: finalModel.trim(),
          systemPrompt: systemPrompt,
          apiKey: apiKey.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (apiKey.trim() && apiKey.trim() !== '••••••••••••••••') {
        setApiKey('••••••••••••••••');
      }
    } catch (err) {
      console.error('Error saving chat config:', err);
      alert('Error al guardar la configuración: ' + err.message);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('');
    const finalModel = model === 'custom' ? customModel : model;

    try {
      const payload = {
        messages: [{ role: 'user', content: 'Di la palabra OK en mayusculas' }],
        dbContext: '',
        userEmail: 'admin@tamfresh.com'
      };

      if (apiKey.trim() && apiKey.trim() !== '••••••••••••••••') {
        payload.tempApiKey = apiKey.trim();
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setTestStatus('success');
        setTestMessage(`¡Conexión establecida correctamente! Respuesta de DeepSeek: "${data.reply.trim()}"`);
      } else {
        const errData = await response.json().catch(() => ({}));
        const errText = errData.error || `Error HTTP ${response.status}`;
        setTestStatus('error');
        setTestMessage(`Error de conexión: ${errText}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Error de red: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="text-gradient-strawberry">Configuración del Asistente IA</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
          Configura las credenciales de la API de DeepSeek, selecciona el modelo y define las directivas de comportamiento del chatbot de Tamfresh.
        </p>
      </div>

      <div className="responsive-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Settings Form */}
        <form onSubmit={handleSave} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', color: 'var(--text-primary)' }}>Parámetros de la API</h3>
          
          {/* API Key */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> API Key de DeepSeek
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '40px' }}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Esta llave es necesaria para comunicarse con los modelos de DeepSeek.
            </span>
          </div>

          {/* Model Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} /> Modelo de IA
            </label>
            <select
              className="form-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            >
              <option value="deepseek-chat">deepseek-chat (DeepSeek-V3 - Rápido e Inteligente)</option>
              <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek-R1 - Razonamiento profundo)</option>
              <option value="custom">Otro Modelo (Personalizado)</option>
            </select>

            {model === 'custom' && (
              <input
                type="text"
                className="form-input"
                placeholder="Ingresa el identificador del modelo (ej: deepseek-coder)"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                style={{ marginTop: '8px' }}
                required
              />
            )}
          </div>

          {/* System Prompt */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> System Prompt (Instrucciones del Sistema)
            </label>
            <textarea
              className="form-input"
              rows="6"
              style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: '1.5', fontSize: '0.9rem' }}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
            ></textarea>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Define el rol del asistente de IA. El prompt por defecto capacita a la IA como asesora experta en Tamfresh y le inyecta los datos de Supabase en tiempo real.
            </span>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
              Guardar Configuración
            </button>

            {saveSuccess && (
              <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={16} /> ¡Configuración guardada correctamente!
              </span>
            )}
          </div>
        </form>

        {/* Test Connection Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', color: 'var(--text-primary)' }}>Diagnóstico</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Puedes probar si la clave de API y el modelo configurado son correctos realizando un saludo rápido de diagnóstico a los servidores de DeepSeek.
          </p>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'loading'}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              width: '100%',
              fontWeight: 600,
              borderColor: 'var(--panel-border)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)'
            }}
          >
            {testStatus === 'loading' ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> Probando Conexión...
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Probar Conexión
              </>
            )}
          </button>

          {/* Test Status Output */}
          {testStatus && (
            <div
              style={{
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                animation: 'fadeIn 0.2s ease',
                backgroundColor: 
                  testStatus === 'success' 
                    ? 'rgba(52, 211, 153, 0.1)' 
                    : testStatus === 'error' 
                      ? 'rgba(251, 146, 60, 0.1)' 
                      : 'rgba(255, 255, 255, 0.02)',
                border: 
                  testStatus === 'success' 
                    ? '1px solid rgba(52, 211, 153, 0.25)' 
                    : testStatus === 'error' 
                      ? '1px solid rgba(251, 146, 60, 0.25)' 
                      : '1px solid var(--panel-border)',
                color: 
                  testStatus === 'success' 
                    ? 'var(--color-success)' 
                    : testStatus === 'error' 
                      ? 'var(--color-danger)' 
                      : 'var(--text-secondary)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                {testStatus === 'success' ? (
                  <Check size={18} style={{ flexShrink: 0 }} />
                ) : testStatus === 'error' ? (
                  <X size={18} style={{ flexShrink: 0 }} />
                ) : null}
                <span>{testMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Consultas de IA (Auditoría) */}
      <div className="glass-panel animate-slide-up" style={{ padding: '28px', marginTop: '24px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', backdropFilter: 'blur(30px) saturate(150%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blackberry) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <History size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Historial de Consultas de IA (Auditoría)</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Monitorea las preguntas del operador y otros usuarios en tiempo real</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filtrar por Usuario:</label>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '6px 12px', minWidth: '180px' }}
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">Todos los usuarios</option>
                <option value="admin@tamfresh.com">Solo Administrador</option>
                <option value="operador@tamfresh.com">Solo Operador</option>
                {/* Dynamically display other unique emails if they exist */}
                {Array.from(new Set(chatLogs.map(log => log.user_email)))
                  .filter(email => email !== 'admin@tamfresh.com' && email !== 'operador@tamfresh.com')
                  .map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))
                }
              </select>
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.8rem', height: '34px', cursor: 'pointer' }}
            >
              <RefreshCw size={14} className={isLoadingLogs ? 'animate-spin' : ''} style={{ animation: isLoadingLogs ? 'spin 1.5s linear infinite' : 'none' }} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Content list */}
        {isLoadingLogs && chatLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(37,99,235,0.2)', borderRadius: '50%', borderTopColor: 'var(--color-blueberry)', animation: 'spin 1s ease-in-out infinite', marginRight: '8px', verticalAlign: 'middle' }}></span>
            Cargando historial de auditoría...
          </div>
        ) : (
          (() => {
            const filteredLogs = chatLogs.filter(log => {
              if (userFilter === 'all') return true;
              return log.user_email === userFilter;
            });

            if (filteredLogs.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
                  No se encontraron consultas registradas para el filtro seleccionado.
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                {filteredLogs.map((log) => {
                  const isOperator = log.user_email === 'operador@tamfresh.com';
                  const formattedDate = new Date(log.created_at).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--panel-border)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      className="card-hover"
                    >
                      {/* Log Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px dashed var(--panel-border)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '6px', 
                            background: isOperator ? 'rgba(249, 115, 22, 0.1)' : 'rgba(37, 99, 235, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: isOperator ? 'var(--color-warning)' : 'var(--color-blueberry)' 
                          }}>
                            <User size={12} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {log.user_email} 
                            {isOperator && <span style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--color-warning)', fontWeight: 600 }}>Operador</span>}
                            {log.user_email === 'admin@tamfresh.com' && <span style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-blueberry)', fontWeight: 600 }}>Admin</span>}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>F. Consulta: {formattedDate}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)' }}>
                            Modelo: {log.model}
                          </span>
                        </div>
                      </div>

                      {/* Question / Reply content */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minWidth: 0 }} className="form-row-responsive">
                        {/* Question Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pregunta del Usuario:</span>
                          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', minHeight: '50px' }}>
                            {log.message}
                          </div>
                        </div>

                        {/* Reply Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Respuesta de la IA:</span>
                          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--panel-border)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', minHeight: '50px' }}>
                            {log.reply}
                          </div>
                        </div>
                      </div>

                      {/* Reasoning if R1 model was used */}
                      {log.reasoning && (
                        <div style={{ borderTop: '1px dashed var(--panel-border)', paddingTop: '8px', marginTop: '4px' }}>
                          <button
                            onClick={() => toggleReasoningLog(log.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 0'
                            }}
                          >
                            {expandedReasoningLogs[log.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {expandedReasoningLogs[log.id] ? 'Ocultar pasos de razonamiento (DeepSeek R1)' : 'Mostrar pasos de razonamiento (DeepSeek R1)'}
                          </button>
                          
                          {expandedReasoningLogs[log.id] && (
                            <pre style={{
                              marginTop: '8px',
                              padding: '10px 14px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--panel-border)',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-sans)',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '180px',
                              overflowY: 'auto',
                              lineHeight: '1.4'
                            }}>
                              {log.reasoning}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
