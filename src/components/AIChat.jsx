import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Trash2, Bot, User, Sparkles, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AIChat({ purchases = [], sales = [], suppliers = [], clients = [], debts = [], expenses = [], userEmail = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('freshfrut_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing chat history:", e);
      }
    }
    return [
      {
        sender: 'assistant',
        text: '¡Hola! Soy tu asistente de Tamfresh. Tengo acceso en tiempo real a tus proveedores, clientes, lotes de berries en inventario, ventas registradas, deudas y gastos de operación. ¿En qué puedo ayudarte a analizar hoy?',
        reasoning: null,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const messagesEndRef = useRef(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('freshfrut_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const [aiConfig, setAiConfig] = useState({
    apiKey: localStorage.getItem('deepseek_api_key') || 'sk-1951afeabbfd4a04a3e06b0e0dbe5de5',
    model: localStorage.getItem('deepseek_model') || 'deepseek-chat',
    systemPrompt: localStorage.getItem('deepseek_system_prompt') || 
      'Eres un asistente de inteligencia artificial experto en la gestión de exportación de berries para Tamfresh. Ayudas al administrador y operador a analizar inventarios, deudas, ventas y gastos. Responde siempre en español de forma profesional y clara.'
  });

  const loadDbConfig = async () => {
    try {
      const { data, error } = await supabase.from('chat_config').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const keyVal = {};
        data.forEach(item => {
          keyVal[item.key] = item.value;
        });
        setAiConfig({
          apiKey: keyVal['deepseek_api_key'] || 'sk-1951afeabbfd4a04a3e06b0e0dbe5de5',
          model: keyVal['deepseek_model'] || 'deepseek-chat',
          systemPrompt: keyVal['deepseek_system_prompt'] || 'Eres un asistente de inteligencia artificial experto en la gestión de exportación de berries para Tamfresh. Ayudas al administrador y operador a analizar inventarios, deudas, ventas y gastos. Responde siempre en español de forma profesional y clara.'
        });
      }
    } catch (err) {
      console.error("Error loading chat config from db:", err);
    }
  };

  useEffect(() => {
    loadDbConfig();
  }, [isOpen]);

  // Compile database state into a compact text format
  const buildDatabaseContext = () => {
    let context = "INFORMACIÓN DE LA BASE DE DATOS EN TIEMPO REAL (SOLO LECTURA):\n\n";

    // 1. Proveedores
    context += "--- PROVEEDORES (SUPPLIERS) ---\n";
    if (suppliers.length === 0) {
      context += "Ninguno registrado.\n";
    } else {
      suppliers.forEach(s => {
        context += `- Proveedor ID: ${s.id} | Nombre: ${s.name} | Contacto: ${s.contact || 'N/A'} | Tel: ${s.phone || 'N/A'} | Ubicación: ${s.location || 'N/A'}\n`;
      });
    }

    // 2. Clientes
    context += "\n--- CLIENTES (CLIENTS) ---\n";
    if (clients.length === 0) {
      context += "Ninguno registrado.\n";
    } else {
      clients.forEach(c => {
        context += `- Cliente ID: ${c.id} | Nombre: ${c.name} | Contacto: ${c.contact || 'N/A'} | Tel: ${c.phone || 'N/A'} | Ubicación: ${c.location || 'N/A'}\n`;
      });
    }

    // 3. Inventario (Compras)
    context += "\n--- INVENTARIO Y COMPRAS (PURCHASES) ---\n";
    if (purchases.length === 0) {
      context += "No hay lotes de berries registrados.\n";
    } else {
      purchases.forEach(p => {
        context += `- Lote: ${p.id} | Berry: ${p.berry} (${p.variety}) | Kg Original: ${p.kg} | Kg Restantes (Stock): ${p.remainingKg} | Precio/Kg: $${p.pricePerKg} | Costo Total: $${p.totalCost} | Ubicación: ${p.storageLocation || 'N/A'} | Calidad (QC): ${p.qcStatus} | Estado Venta: ${p.saleStatus} | Fecha Recibo: ${p.date}\n`;
      });
    }

    // 4. Ventas
    context += "\n--- VENTAS REGISTRADAS (SALES) ---\n";
    if (sales.length === 0) {
      context += "No hay ventas registradas.\n";
    } else {
      sales.forEach(s => {
        context += `- Venta ID: ${s.id} | Lote Origen: ${s.purchaseId} | Cliente: ${s.client} | Kg Vendidos: ${s.kg} | Precio Venta/Kg: $${s.priceSoldPerKg} | Ingreso Total: $${s.totalRevenue} | Utilidad: $${s.profit} | Status Envío: ${s.status} | Transportista: ${s.shippingLine || 'N/A'} | Contenedor: ${s.containerId || 'N/A'} | Fecha: ${s.date}\n`;
      });
    }

    // 5. Deudas
    context += "\n--- CUENTAS Y DEUDAS (DEBTS) ---\n";
    if (debts.length === 0) {
      context += "No hay deudas ni cuentas por cobrar/pagar registradas.\n";
    } else {
      debts.forEach(d => {
        const tipo = d.type === 'PAYABLE' ? 'Por Pagar (A Proveedor)' : 'Por Cobrar (A Cliente)';
        context += `- Cuenta ID: ${d.id} | Tipo: ${tipo} | Entidad: ${d.entityName} | Monto Total: $${d.amount} | Saldo Pendiente: $${d.remainingAmount} | Estado: ${d.status} | ID Referencia: ${d.sourceId || 'N/A'} | Fecha Límite/Registro: ${d.date}\n`;
      });
    }

    // 6. Gastos
    context += "\n--- GASTOS OPERATIVOS (EXPENSES) ---\n";
    if (expenses.length === 0) {
      context += "No hay gastos de operación registrados.\n";
    } else {
      expenses.forEach(e => {
        context += `- Gasto ID: ${e.id} | Categoría: ${e.category} | Descripción: ${e.description || 'Sin descripción'} | Monto: $${e.amount} | Fecha: ${e.date}\n`;
      });
    }

    return context;
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');
    setLoading(true);

    // Append user message
    const userMessage = {
      sender: 'user',
      text: userMessageText,
      reasoning: null,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    const { apiKey, model, systemPrompt } = aiConfig;

    if (!apiKey) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error: No se ha configurado una API Key de DeepSeek. Por favor, ve a la pestaña "Configurar Chat" para agregar tu clave de acceso.',
          reasoning: null,
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const dbContext = buildDatabaseContext();
      const finalSystemMessage = `${systemPrompt}\n\n${dbContext}\n\nNota: Utiliza los datos de la base de datos anteriores para responder con números exactos. IMPORTANTE: Todas las cifras financieras en la base de datos (tanto compras, ventas, deudas, como gastos) están expresadas en Pesos Mexicanos (MXN). No realices conversiones de tipo de cambio ni asumas que las ventas a clientes extranjeros (como Walmart Inc (USA) o Driscoll's) están en dólares; todos los números representan MXN. Por lo tanto, puedes sumarlos y restarlos directamente sin aplicar ningún tipo de cambio para calcular las ganancias netas u otros totales.`;

      // Build message array for API
      // We limit context history to the last 10 messages to avoid token bloat
      const apiMessages = [
        { role: 'system', content: finalSystemMessage },
        ...messages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessageText }
      ];

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const choice = data?.choices?.[0]?.message;
        const replyText = choice?.content || 'No se recibió respuesta.';
        const reasoningText = choice?.reasoning_content || null; // DeepSeek R1 reasoning steps

        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: replyText,
            reasoning: reasoningText,
            timestamp: new Date().toISOString()
          }
        ]);

        // Insert log to Supabase Relational Database
        const { error: logError } = await supabase.from('ai_chat_logs').insert([{
          user_email: userEmail || 'admin@tamfresh.com',
          message: userMessageText,
          reply: replyText,
          reasoning: reasoningText,
          model: model
        }]);

        if (logError) {
          console.error("Error inserting audit chat log to Supabase:", logError);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `Código HTTP ${response.status}`;
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: `Error de la API de DeepSeek: ${errMsg}`,
            reasoning: null,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error de red al conectar con DeepSeek: ${err.message}`,
          reasoning: null,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar el historial de conversación en tu pantalla?')) {
      const resetMsg = [
        {
          sender: 'assistant',
          text: '¡Historial de chat restablecido! Estoy listo para responder tus dudas analíticas sobre Tamfresh y su base de datos. ¿En qué te ayudo?',
          reasoning: null,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(resetMsg);
    }
  };

  const toggleReasoning = (index) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Safe formatting helper to render basic markdown-like structures
  const formatResponseText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const hasFormatting = parts.length > 0;
      const renderedContent = hasFormatting ? parts : content;

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', listStyleType: 'disc', color: 'var(--text-primary)' }}>
            {hasFormatting ? renderedContent : bulletText}
          </li>
        );
      }

      if (line.trim().startsWith('>')) {
        const quoteText = line.trim().substring(1);
        return (
          <blockquote key={idx} style={{ borderLeft: '3px solid var(--color-strawberry)', paddingLeft: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '8px 0' }}>
            {hasFormatting ? renderedContent : quoteText}
          </blockquote>
        );
      }

      return (
        <p key={idx} style={{ margin: '0 0 8px 0', minHeight: '1.2em', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {renderedContent}
        </p>
      );
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Legend / Hint for IA Chat */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '90px',
            background: 'var(--panel-bg)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(30, 58, 138, 0.1)',
            border: '1px solid var(--panel-border)',
            zIndex: 10000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease',
            userSelect: 'none'
          }}
          className="ai-chat-legend"
        >
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
          Pregúntale a la IA
        </div>
      )}

      {/* Floating Action Button (FAB) in the Bottom Right Corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-blueberry) 0%, var(--color-blackberry) 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(30, 58, 138, 0.35)',
          cursor: 'pointer',
          border: 'none',
          zIndex: 10001,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1)'
        }}
        title="Asistente de IA"
        className="card-hover"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Floating Chat Panel popover */}
      {isOpen && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            width: '420px',
            height: '580px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
            border: '1px solid var(--panel-border)',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(30px) saturate(140%)',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 140px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--panel-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="/tamfresh_logo.png" 
                alt="Tamfresh Logo" 
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Asistente Tamfresh IA</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conectado a la Base de Datos</span>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Limpiar conversación local"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.25s ease'
                  }}
                >
                  {/* Meta info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    flexDirection: isUser ? 'row-reverse' : 'row'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isUser ? 'var(--color-strawberry)' : 'var(--bg-main)',
                      border: isUser ? 'none' : '1px solid var(--panel-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUser ? 'white' : 'var(--color-strawberry)'
                    }}>
                      {isUser ? <User size={10} /> : <Bot size={10} />}
                    </div>
                    <span>{isUser ? 'Tú' : 'Tamfresh IA'}</span>
                  </div>

                  {/* Reasoning block */}
                  {!isUser && msg.reasoning && (
                    <div style={{
                      width: '100%',
                      marginBottom: '6px',
                      borderLeft: '2px solid var(--text-muted)',
                      paddingLeft: '10px',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      borderRadius: '0 8px 8px 0'
                    }}>
                      <button
                        onClick={() => toggleReasoning(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {expandedReasoning[index] ? '▼ Ocultar razonamiento' : '▶ Mostrar razonamiento (R1)'}
                      </button>
                      {expandedReasoning[index] && (
                        <pre style={{
                          marginTop: '4px',
                          padding: '8px',
                          background: 'rgba(0,0,0,0.02)',
                          border: '1px solid var(--panel-border)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '120px',
                          overflowY: 'auto',
                          lineHeight: '1.3'
                        }}>
                          {msg.reasoning}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: isUser ? 'var(--color-strawberry)' : 'rgba(255, 255, 255, 0.95)',
                    border: isUser ? 'none' : '1px solid var(--panel-border)',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    boxShadow: isUser ? '0 4px 14px rgba(225, 29, 72, 0.18)' : '0 2px 10px rgba(0,0,0,0.02)',
                    fontSize: '0.9rem'
                  }}>
                    {isUser ? (
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.text}</p>
                    ) : (
                      <div style={{ wordBreak: 'break-word' }}>{formatResponseText(msg.text)}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking State */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: '1px solid var(--panel-border)',
                alignSelf: 'flex-start',
                width: 'fit-content'
              }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-strawberry)' }}></span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Pensando...
                </span>
              </div>
            )}

            {/* Suggestions if empty */}
            {messages.length === 1 && (
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  Preguntas Recomendadas:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    '¿Cuál es el stock actual de cada berry?',
                    '¿Qué clientes tienen deudas pendientes de cobro?',
                    '¿Cuáles son las ganancias netas del negocio?'
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="card-hover glass-panel"
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        width: '100%'
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--panel-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <input
              type="text"
              className="form-input"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid var(--panel-border)',
                fontSize: '0.9rem'
              }}
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
                boxShadow: 'none'
              }}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
