import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:kvUTPSMv8hvZLhtj@db.biwfnzpwgdfsakbiqibs.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function main() {
  try {
    console.log('Conectando a la base de datos de Supabase...');
    await client.connect();
    console.log('¡Conexión establecida!');

    console.log('Creando tabla ai_chat_logs...');
    const query = `
      CREATE TABLE IF NOT EXISTS ai_chat_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        reply TEXT NOT NULL,
        reasoning TEXT,
        model VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    await client.query(query);
    console.log('¡Tabla ai_chat_logs creada con éxito!');
  } catch (error) {
    console.error('Error durante la creación de la tabla:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada.');
  }
}

main();
