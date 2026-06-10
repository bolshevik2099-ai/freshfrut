import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres:kvUTPSMv8hvZLhtj@db.biwfnzpwgdfsakbiqibs.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database successfully.");

    const ddl = `
      -- Create packaging_materials table
      CREATE TABLE IF NOT EXISTS packaging_materials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
        stock_qty INTEGER NOT NULL DEFAULT 0,
        lent_qty INTEGER NOT NULL DEFAULT 0,
        total_qty INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create packaging_transactions table
      CREATE TABLE IF NOT EXISTS packaging_transactions (
        id TEXT PRIMARY KEY,
        material_id TEXT REFERENCES packaging_materials(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        producer_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
        client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
        reference_id TEXT,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Alter purchases table to add consigned columns
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "isConsigned" BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "consignedMaterialId" TEXT REFERENCES packaging_materials(id) ON DELETE SET NULL;
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "consignedQuantity" INTEGER;

      -- Alter sales table to add consigned columns
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS "isConsigned" BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS "consignedMaterialId" TEXT REFERENCES packaging_materials(id) ON DELETE SET NULL;
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS "consignedQuantity" INTEGER;
    `;

    await client.query(ddl);
    console.log("Database schema updated successfully (packaging tables and columns created).");
  } catch (err) {
    console.error("Error updating database schema:", err);
  } finally {
    await client.end();
  }
}

main();
