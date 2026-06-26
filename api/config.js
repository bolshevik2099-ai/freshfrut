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

  let client;
  try {
    client = await pool.connect();

    if (req.method === 'GET') {
      const dbRes = await client.query('SELECT key, value FROM chat_config');
      const config = {};
      dbRes.rows.forEach(row => {
        config[row.key] = row.value;
      });

      return res.status(200).json({
        model: config['deepseek_model'] || 'deepseek-chat',
        systemPrompt: config['deepseek_system_prompt'] || '',
        hasApiKey: !!config['deepseek_api_key']
      });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON body' });
        }
      }

      const { model, systemPrompt, apiKey } = body || {};

      if (!model || !systemPrompt) {
        return res.status(400).json({ error: 'Missing model or systemPrompt' });
      }

      // Update model
      await client.query(
        'INSERT INTO chat_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        ['deepseek_model', model.trim()]
      );

      // Update system prompt
      await client.query(
        'INSERT INTO chat_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        ['deepseek_system_prompt', systemPrompt]
      );

      // Update API key if it's not a placeholder and not empty
      if (apiKey && apiKey !== '••••••••••••••••' && apiKey.trim() !== '') {
        await client.query(
          'INSERT INTO chat_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          ['deepseek_api_key', apiKey.trim()]
        );
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Serverless function config error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
