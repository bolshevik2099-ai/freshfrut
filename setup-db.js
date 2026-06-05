import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres:kvUTPSMv8hvZLhtj@db.biwfnzpwgdfsakbiqibs.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

const ddl = `
-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- Create suppliers
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location TEXT
);

-- Create clients
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  country TEXT
);

-- Create purchases
CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  berry TEXT NOT NULL,
  variety TEXT NOT NULL,
  producer TEXT NOT NULL,
  kg INTEGER NOT NULL,
  "remainingKg" INTEGER NOT NULL,
  "pricePerKg" NUMERIC NOT NULL,
  "totalCost" NUMERIC NOT NULL,
  "storageLocation" TEXT NOT NULL,
  date DATE NOT NULL,
  "qcStatus" TEXT NOT NULL,
  "saleStatus" TEXT NOT NULL,
  "qcData" JSONB
);

-- Create sales
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  "purchaseId" TEXT REFERENCES purchases(id) ON DELETE CASCADE,
  berry TEXT NOT NULL,
  variety TEXT NOT NULL,
  kg INTEGER NOT NULL,
  client TEXT NOT NULL,
  "priceSoldPerKg" NUMERIC NOT NULL,
  "totalRevenue" NUMERIC NOT NULL,
  profit NUMERIC NOT NULL,
  "shippingLine" TEXT,
  "containerId" TEXT,
  status TEXT NOT NULL,
  date DATE NOT NULL
);

-- Create debts
CREATE TABLE debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  "entityName" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  "remainingAmount" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  date DATE NOT NULL
);

-- Create expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL
);
`;

const INITIAL_PURCHASES = [
  {
    id: 'LOT-FRE-4421',
    berry: 'Fresa',
    variety: 'Albion',
    producer: 'Héctor Gómez Pérez',
    kg: 5000,
    remainingKg: 0,
    pricePerKg: 42.00,
    totalCost: 210000,
    storageLocation: 'BODEGA',
    date: '2026-06-01',
    qcStatus: 'APPROVED',
    saleStatus: 'SOLD',
    qcData: {
      brix: 9.2,
      firmness: 420,
      softFruit: 1.5,
      mold: 0,
      targetMarket: 'USA',
      inspector: 'Ing. Sofía Martínez',
      qcScore: '97%'
    }
  },
  {
    id: 'LOT-ARA-9902',
    berry: 'Arándano',
    variety: 'Biloxi',
    producer: 'Agrícola Los Reyes S.A.',
    kg: 3500,
    remainingKg: 0,
    pricePerKg: 85.00,
    totalCost: 297500,
    storageLocation: 'BODEGA',
    date: '2026-06-01',
    qcStatus: 'APPROVED',
    saleStatus: 'SOLD',
    qcData: {
      brix: 12.4,
      firmness: 170,
      softFruit: 1.0,
      mold: 0,
      targetMarket: 'Japón',
      inspector: 'Ing. Carlos Mendoza',
      qcScore: '98%'
    }
  },
  {
    id: 'LOT-FRA-1082',
    berry: 'Frambuesa',
    variety: 'Heritage',
    producer: 'Invernaderos La Joya',
    kg: 1500,
    remainingKg: 1500,
    pricePerKg: 98.00,
    totalCost: 147000,
    storageLocation: 'BODEGA',
    date: '2026-06-02',
    qcStatus: 'APPROVED',
    saleStatus: 'UNSOLD',
    qcData: {
      brix: 8.8,
      firmness: 140,
      softFruit: 2.0,
      mold: 0,
      targetMarket: 'USA',
      inspector: 'Ing. Sofía Martínez',
      qcScore: '94%'
    }
  },
  {
    id: 'LOT-ARA-5012',
    berry: 'Arándano',
    variety: 'Biloxi',
    producer: 'Agrícola Los Reyes S.A.',
    kg: 3000,
    remainingKg: 3000,
    pricePerKg: 80.00,
    totalCost: 240000,
    storageLocation: 'PROVEEDOR',
    date: '2026-06-02',
    qcStatus: 'APPROVED',
    saleStatus: 'UNSOLD',
    qcData: {
      brix: 12.0,
      firmness: 165,
      softFruit: 1.2,
      mold: 0,
      targetMarket: 'USA',
      inspector: 'Ing. Carlos Mendoza',
      qcScore: '96%'
    }
  },
  {
    id: 'LOT-MOR-2005',
    berry: 'Mora',
    variety: 'Tupi',
    producer: 'Hermanos Valdés',
    kg: 2200,
    remainingKg: 2200,
    pricePerKg: 60.00,
    totalCost: 132000,
    storageLocation: 'BODEGA',
    date: '2026-06-02',
    qcStatus: 'REJECTED',
    saleStatus: 'UNSOLD',
    qcData: {
      brix: 7.2,
      firmness: 110,
      softFruit: 6.2,
      mold: 1.5,
      targetMarket: 'Local',
      inspector: 'Ing. Carlos Mendoza',
      qcScore: '50%'
    }
  },
  {
    id: 'LOT-FRE-7740',
    berry: 'Fresa',
    variety: 'Camino Real',
    producer: 'Rancho Santa María',
    kg: 4000,
    remainingKg: 4000,
    pricePerKg: 40.00,
    totalCost: 160000,
    storageLocation: 'PROVEEDOR',
    date: '2026-06-03',
    qcStatus: 'PENDING',
    saleStatus: 'UNSOLD',
    qcData: null
  }
];

const INITIAL_SALES = [
  {
    id: 'EXP-FRE-9001',
    purchaseId: 'LOT-FRE-4421',
    berry: 'Fresa',
    variety: 'Albion',
    kg: 5000,
    client: "Driscoll's LLC (USA)",
    priceSoldPerKg: 70.00,
    totalRevenue: 350000,
    profit: 140000,
    shippingLine: 'Maersk Line',
    containerId: 'MAEU-882049-1',
    status: 'En Ruta Marítima',
    date: '2026-06-02'
  },
  {
    id: 'EXP-ARA-9002',
    purchaseId: 'LOT-ARA-9902',
    berry: 'Arándano',
    variety: 'Biloxi',
    kg: 3500,
    client: 'Shanghai Fresh (China)',
    priceSoldPerKg: 136.00,
    totalRevenue: 476000,
    profit: 178500,
    shippingLine: 'MSC Logistics',
    containerId: 'MSCU-902910-3',
    status: 'Entregado',
    date: '2026-06-02'
  }
];

const INITIAL_SUPPLIERS = [
  { id: 'PROV-001', name: 'Héctor Gómez Pérez', phone: '351-123-4567', email: 'hector.gomez@gmail.com', location: 'Zamora, Mich.' },
  { id: 'PROV-002', name: 'Agrícola Los Reyes S.A.', phone: '354-987-6543', email: 'contacto@losreyes.com', location: 'Los Reyes, Mich.' },
  { id: 'PROV-003', name: 'Invernaderos La Joya', phone: '351-555-0144', email: 'lajoya@invernaderos.com', location: 'Jacona, Mich.' },
  { id: 'PROV-004', name: 'Hermanos Valdés', phone: '352-444-9900', email: 'valdes@hermanos.com', location: 'Tangancícuaro, Mich.' },
  { id: 'PROV-005', name: 'Rancho Santa María', phone: '353-888-2211', email: 'santamaria@rancho.com', location: 'Zamora, Mich.' }
];

const INITIAL_CLIENTS = [
  { id: 'CLI-001', name: "Driscoll's LLC (USA)", phone: '+1 415 555-0199', email: 'import@driscolls.com', country: 'USA' },
  { id: 'CLI-002', name: 'Shanghai Fresh (China)', phone: '+86 21 6688 9900', email: 'sales@shanghaifresh.com', country: 'China' },
  { id: 'CLI-003', name: 'Walmart Inc (USA)', phone: '+1 800 925-6278', email: 'procurement@walmart.com', country: 'USA' },
  { id: 'CLI-004', name: 'Tesco PLC (UK)', phone: '+44 1992 632222', email: 'buyers@tesco.com', country: 'UK' }
];

const INITIAL_DEBTS = [
  {
    id: 'DEB-001',
    type: 'PAYABLE',
    entityName: 'Agrícola Los Reyes S.A.',
    sourceId: 'LOT-ARA-5012',
    amount: 240000.00,
    remainingAmount: 240000.00,
    status: 'PENDING',
    date: '2026-06-02'
  },
  {
    id: 'DEB-002',
    type: 'RECEIVABLE',
    entityName: "Driscoll's LLC (USA)",
    sourceId: 'EXP-FRE-9001',
    amount: 350000.00,
    remainingAmount: 150000.00,
    status: 'PARTIAL',
    date: '2026-06-02'
  }
];

const INITIAL_EXPENSES = [
  { id: 'GAS-001', description: 'Cajas de cartón clam-shell (5000 pzs)', type: 'Empaque', amount: 45000.00, date: '2026-06-01' },
  { id: 'GAS-002', description: 'Diésel camiones de recolección', type: 'Logística', amount: 18500.00, date: '2026-06-02' },
  { id: 'GAS-003', description: 'Nómina cuadrilla de empaque Sem 22', type: 'Nómina', amount: 65000.00, date: '2026-06-02' },
  { id: 'GAS-004', description: 'Insecticida orgánico fosfatos', type: 'Insumos', amount: 12000.00, date: '2026-06-03' }
];

async function main() {
  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected!');

    console.log('Creating tables...');
    await client.query(ddl);
    console.log('Tables created successfully!');

    console.log('Inserting initial mock data...');

    // Suppliers
    for (const s of INITIAL_SUPPLIERS) {
      await client.query(
        'INSERT INTO suppliers (id, name, phone, email, location) VALUES ($1, $2, $3, $4, $5)',
        [s.id, s.name, s.phone, s.email, s.location]
      );
    }
    console.log('- Seeded suppliers');

    // Clients
    for (const c of INITIAL_CLIENTS) {
      await client.query(
        'INSERT INTO clients (id, name, phone, email, country) VALUES ($1, $2, $3, $4, $5)',
        [c.id, c.name, c.phone, c.email, c.country]
      );
    }
    console.log('- Seeded clients');

    // Purchases
    for (const p of INITIAL_PURCHASES) {
      await client.query(
        'INSERT INTO purchases (id, berry, variety, producer, kg, "remainingKg", "pricePerKg", "totalCost", "storageLocation", date, "qcStatus", "saleStatus", "qcData") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [p.id, p.berry, p.variety, p.producer, p.kg, p.remainingKg, p.pricePerKg, p.totalCost, p.storageLocation, p.date, p.qcStatus, p.saleStatus, p.qcData ? JSON.stringify(p.qcData) : null]
      );
    }
    console.log('- Seeded purchases');

    // Sales
    for (const s of INITIAL_SALES) {
      await client.query(
        'INSERT INTO sales (id, "purchaseId", berry, variety, kg, client, "priceSoldPerKg", "totalRevenue", profit, "shippingLine", "containerId", status, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [s.id, s.purchaseId, s.berry, s.variety, s.kg, s.client, s.priceSoldPerKg, s.totalRevenue, s.profit, s.shippingLine, s.containerId, s.status, s.date]
      );
    }
    console.log('- Seeded sales');

    // Debts
    for (const d of INITIAL_DEBTS) {
      await client.query(
        'INSERT INTO debts (id, type, "entityName", "sourceId", amount, "remainingAmount", status, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [d.id, d.type, d.entityName, d.sourceId, d.amount, d.remainingAmount, d.status, d.date]
      );
    }
    console.log('- Seeded debts');

    // Expenses
    for (const e of INITIAL_EXPENSES) {
      await client.query(
        'INSERT INTO expenses (id, description, type, amount, date) VALUES ($1, $2, $3, $4, $5)',
        [e.id, e.description, e.type, e.amount, e.date]
      );
    }
    console.log('- Seeded expenses');

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error during database setup:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main();
