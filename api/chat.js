import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://postgres:kvUTPSMv8hvZLhtj@db.biwfnzpwgdfsakbiqibs.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { messages, dbContext, userEmail, tempApiKey } = body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages' });
  }

  let client;
  try {
    client = await pool.connect();
    
    // Retrieve credentials from chat_config
    const dbRes = await client.query('SELECT key, value FROM chat_config');
    const config = {};
    dbRes.rows.forEach(row => {
      config[row.key] = row.value;
    });

    const apiKey = tempApiKey || config['deepseek_api_key'];
    const model = config['deepseek_model'] || 'deepseek-chat';
    const systemPrompt = config['deepseek_system_prompt'] || '';

    if (!apiKey) {
      return res.status(500).json({ error: 'DeepSeek API Key is not configured in the database' });
    }

    // Build final system prompt
    const finalSystemMessage = `${systemPrompt}\n\n${dbContext || ''}\n\nNota: Utiliza los datos de la base de datos anteriores para responder con números exactos. IMPORTANTE: Todas las cifras financieras en la base de datos (tanto compras, ventas, deudas, como gastos) están expresadas en Pesos Mexicanos (MXN). No realices conversiones de tipo de cambio ni asumas que las ventas a clientes extranjeros (como Walmart Inc (USA) o Driscoll's) están en dólares; todos los números representan MXN. Por lo tanto, puedes sumarlos y restarlos directamente sin aplicar ningún tipo de cambio para calcular las ganancias netas u otros totales.`;

    // Limit chat history to last 10 messages + system prompt
    const apiMessages = [
      { role: 'system', content: finalSystemMessage },
      ...messages
    ];

    // Call DeepSeek API
    const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.3
      })
    });

    if (!dsResponse.ok) {
      const errText = await dsResponse.text();
      let parsedErr = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}
      const errMsg = parsedErr?.error?.message || errText || `Código HTTP ${dsResponse.status}`;
      return res.status(dsResponse.status).json({ error: errMsg });
    }

    const data = await dsResponse.json();
    const choice = data?.choices?.[0]?.message;
    const replyText = choice?.content || 'No se recibió respuesta.';
    const reasoningText = choice?.reasoning_content || null;

    // Log the transaction in ai_chat_logs using raw postgres client
    const userMessageText = messages[messages.length - 1]?.content || '';
    await client.query(
      'INSERT INTO ai_chat_logs (user_email, message, reply, reasoning, model) VALUES ($1, $2, $3, $4, $5)',
      [userEmail || 'admin@tamfresh.com', userMessageText, replyText, reasoningText, model]
    );

    return res.status(200).json({ reply: replyText, reasoning: reasoningText });

  } catch (err) {
    console.error('Serverless function chat error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
