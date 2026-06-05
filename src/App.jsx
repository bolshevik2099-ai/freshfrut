import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import PurchaseForm from './components/PurchaseForm';
import QualityControl from './components/QualityControl';
import SalesForm from './components/SalesForm';
import Traceability from './components/Traceability';
import SuppliersList from './components/SuppliersList';
import ClientsList from './components/ClientsList';
import DebtsList from './components/DebtsList';
import ExpensesList from './components/ExpensesList';





function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: sups } = await supabase.from('suppliers').select('*');
        if (sups) setSuppliers(sups);

        const { data: clis } = await supabase.from('clients').select('*');
        if (clis) setClients(clis);

        const { data: purchs } = await supabase.from('purchases').select('*');
        if (purchs) setPurchases(purchs);

        const { data: sls } = await supabase.from('sales').select('*');
        if (sls) setSales(sls);

        const { data: dbts } = await supabase.from('debts').select('*');
        if (dbts) setDebts(dbts);

        const { data: exps } = await supabase.from('expenses').select('*');
        if (exps) setExpenses(exps);
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    }
    loadData();
  }, []);

  // --- CRUD Purchases ---
  const addPurchase = async (newPurchase, isCredit) => {
    const purchaseWithRemaining = {
      ...newPurchase,
      remainingKg: newPurchase.kg
    };
    setPurchases(prev => [purchaseWithRemaining, ...prev]);

    const { error } = await supabase.from('purchases').insert([purchaseWithRemaining]);
    if (error) console.error("Error inserting purchase:", error);

    if (isCredit) {
      const debtId = `DEB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newDebt = {
        id: debtId,
        type: 'PAYABLE',
        entityName: newPurchase.producer,
        sourceId: newPurchase.id,
        amount: newPurchase.totalCost,
        remainingAmount: newPurchase.totalCost,
        status: 'PENDING',
        date: newPurchase.date
      };
      setDebts(prev => [newDebt, ...prev]);

      const { error: debtErr } = await supabase.from('debts').insert([newDebt]);
      if (debtErr) console.error("Error inserting debt:", debtErr);
    }
  };

  const updatePurchaseQcStatus = async (id, qcStatus, qcData) => {
    setPurchases(prev => prev.map(p => 
      p.id === id ? { ...p, qcStatus, qcData } : p
    ));

    const { error } = await supabase
      .from('purchases')
      .update({ qcStatus, qcData })
      .eq('id', id);
    if (error) console.error("Error updating QC status:", error);
  };

  const editPurchase = async (id, updatedLot) => {
    let finalLot;
    setPurchases(prev => prev.map(p => {
      if (p.id === id) {
        const lotSales = sales.filter(s => s.purchaseId === id);
        const totalSold = lotSales.reduce((sum, s) => sum + s.kg, 0);
        const remaining = Math.max(0, updatedLot.kg - totalSold);
        const saleStatus = remaining === 0 ? 'SOLD' : remaining < updatedLot.kg ? 'PARTIALLY_SOLD' : 'UNSOLD';
        
        finalLot = {
          ...p,
          ...updatedLot,
          remainingKg: remaining,
          saleStatus,
          totalCost: updatedLot.kg * updatedLot.pricePerKg
        };
        return finalLot;
      }
      return p;
    }));

    if (finalLot) {
      const { error } = await supabase
        .from('purchases')
        .update({
          producer: finalLot.producer,
          kg: finalLot.kg,
          remainingKg: finalLot.remainingKg,
          pricePerKg: finalLot.pricePerKg,
          totalCost: finalLot.totalCost,
          storageLocation: finalLot.storageLocation,
          berry: finalLot.berry,
          variety: finalLot.variety,
          date: finalLot.date,
          qcStatus: finalLot.qcStatus,
          saleStatus: finalLot.saleStatus,
          qcData: finalLot.qcData
        })
        .eq('id', id);
      if (error) console.error("Error updating purchase:", error);
    }

    // Also update any linked debt amount if it exists
    setDebts(prev => prev.map(d => {
      if (d.sourceId === id) {
        const newAmount = updatedLot.kg * updatedLot.pricePerKg;
        const amountDiff = newAmount - d.amount;
        const newRemaining = Math.max(0, d.remainingAmount + amountDiff);
        const status = newRemaining === 0 ? 'PAID' : newRemaining < newAmount ? 'PARTIAL' : 'PENDING';
        
        const finalDebt = {
          ...d,
          entityName: updatedLot.producer,
          amount: newAmount,
          remainingAmount: newRemaining,
          status
        };

        supabase
          .from('debts')
          .update({
            entityName: finalDebt.entityName,
            amount: finalDebt.amount,
            remainingAmount: finalDebt.remainingAmount,
            status: finalDebt.status
          })
          .eq('id', d.id)
          .then(({ error: debtErr }) => {
            if (debtErr) console.error("Error updating debt:", debtErr);
          });

        return finalDebt;
      }
      return d;
    }));
  };

  const deletePurchase = async (id) => {
    if (confirm(`¿Estás seguro de eliminar el Lote ${id}? Esto también eliminará las ventas y deudas asociadas.`)) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      setSales(prev => prev.filter(s => s.purchaseId !== id));
      setDebts(prev => prev.filter(d => d.sourceId !== id));

      const { error: dErr } = await supabase.from('debts').delete().eq('sourceId', id);
      if (dErr) console.error("Error deleting linked debts:", dErr);

      const { error: pErr } = await supabase.from('purchases').delete().eq('id', id);
      if (pErr) console.error("Error deleting purchase:", pErr);
    }
  };

  // --- CRUD Sales ---
  const addSale = async (newSale, isCredit) => {
    setSales(prev => [newSale, ...prev]);

    const { error } = await supabase.from('sales').insert([newSale]);
    if (error) console.error("Error inserting sale:", error);

    if (isCredit) {
      const debtId = `DEB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newDebt = {
        id: debtId,
        type: 'RECEIVABLE',
        entityName: newSale.client,
        sourceId: newSale.id,
        amount: newSale.totalRevenue,
        remainingAmount: newSale.totalRevenue,
        status: 'PENDING',
        date: newSale.date
      };
      setDebts(prev => [newDebt, ...prev]);

      const { error: debtErr } = await supabase.from('debts').insert([newDebt]);
      if (debtErr) console.error("Error inserting debt:", debtErr);
    }
  };

  const updatePurchaseSaleStatus = async (lotId, kgSold) => {
    let finalLot;
    setPurchases(prev => prev.map(p => {
      if (p.id === lotId) {
        const remaining = Math.max(0, p.remainingKg - kgSold);
        const saleStatus = remaining === 0 ? 'SOLD' : 'PARTIALLY_SOLD';
        finalLot = { 
          ...p, 
          remainingKg: remaining, 
          saleStatus 
        };
        return finalLot;
      }
      return p;
    }));

    if (finalLot) {
      const { error } = await supabase
        .from('purchases')
        .update({ remainingKg: finalLot.remainingKg, saleStatus: finalLot.saleStatus })
        .eq('id', lotId);
      if (error) console.error("Error updating purchase remaining kg:", error);
    }
  };

  const deleteSale = async (saleId) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    if (confirm(`¿Estás seguro de eliminar la Venta ${saleId}? Los kilos vendidos se devolverán al inventario y se cancelará su deuda asociada.`)) {
      let finalLot;
      setPurchases(prev => prev.map(p => {
        if (p.id === saleToDelete.purchaseId) {
          const remaining = p.remainingKg + saleToDelete.kg;
          const saleStatus = remaining === p.kg ? 'UNSOLD' : 'PARTIALLY_SOLD';
          finalLot = { ...p, remainingKg: remaining, saleStatus };
          return finalLot;
        }
        return p;
      }));
      setSales(prev => prev.filter(s => s.id !== saleId));
      setDebts(prev => prev.filter(d => d.sourceId !== saleId));

      if (finalLot) {
        const { error: pErr } = await supabase
          .from('purchases')
          .update({ remainingKg: finalLot.remainingKg, saleStatus: finalLot.saleStatus })
          .eq('id', finalLot.id);
        if (pErr) console.error("Error updating purchase remaining kg after sale deletion:", pErr);
      }

      const { error: sErr } = await supabase.from('sales').delete().eq('id', saleId);
      if (sErr) console.error("Error deleting sale:", sErr);

      const { error: dErr } = await supabase.from('debts').delete().eq('sourceId', saleId);
      if (dErr) console.error("Error deleting sale debt:", dErr);
    }
  };

  const editSale = async (saleId, updatedSale) => {
    const oldSale = sales.find(s => s.id === saleId);
    if (!oldSale) return;

    const kgDiff = updatedSale.kg - oldSale.kg; // positive = sold more
    const lot = purchases.find(p => p.id === oldSale.purchaseId);
    if (!lot) return;

    if (kgDiff > lot.remainingKg) {
      alert(`Error: No hay suficientes kilos en el lote de origen para cubrir la diferencia (${lot.remainingKg.toLocaleString()} kg disponibles).`);
      return;
    }

    // Deduct diff from lot
    let finalLot;
    setPurchases(prev => prev.map(p => {
      if (p.id === oldSale.purchaseId) {
        const remaining = Math.max(0, p.remainingKg - kgDiff);
        const saleStatus = remaining === 0 ? 'SOLD' : remaining === p.kg ? 'UNSOLD' : 'PARTIALLY_SOLD';
        finalLot = { ...p, remainingKg: remaining, saleStatus };
        return finalLot;
      }
      return p;
    }));

    if (finalLot) {
      const { error: pErr } = await supabase
        .from('purchases')
        .update({ remainingKg: finalLot.remainingKg, saleStatus: finalLot.saleStatus })
        .eq('id', finalLot.id);
      if (pErr) console.error("Error updating purchase remaining kg after sale edit:", pErr);
    }

    // Update sale and associated debt
    const newRevenue = updatedSale.kg * updatedSale.priceSoldPerKg;
    setDebts(prev => prev.map(d => {
      if (d.sourceId === saleId) {
        const revDiff = newRevenue - d.amount;
        const newRemaining = Math.max(0, d.remainingAmount + revDiff);
        const status = newRemaining === 0 ? 'PAID' : newRemaining < newRevenue ? 'PARTIAL' : 'PENDING';
        
        const finalDebt = {
          ...d,
          entityName: updatedSale.client,
          amount: newRevenue,
          remainingAmount: newRemaining,
          status
        };

        supabase
          .from('debts')
          .update({
            entityName: finalDebt.entityName,
            amount: finalDebt.amount,
            remainingAmount: finalDebt.remainingAmount,
            status: finalDebt.status
          })
          .eq('id', d.id)
          .then(({ error: dErr }) => {
            if (dErr) console.error("Error updating debt after sale edit:", dErr);
          });

        return finalDebt;
      }
      return d;
    }));

    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        const profit = newRevenue - (updatedSale.kg * lot.pricePerKg);
        const finalSale = {
          ...s,
          ...updatedSale,
          totalRevenue: newRevenue,
          profit
        };

        supabase
          .from('sales')
          .update({
            client: finalSale.client,
            kg: finalSale.kg,
            priceSoldPerKg: finalSale.priceSoldPerKg,
            totalRevenue: finalSale.totalRevenue,
            profit: finalSale.profit,
            shippingLine: finalSale.shippingLine,
            containerId: finalSale.containerId,
            status: finalSale.status
          })
          .eq('id', saleId)
          .then(({ error: sErr }) => {
            if (sErr) console.error("Error updating sale in database:", sErr);
          });

        return finalSale;
      }
      return s;
    }));
  };

  // --- CRUD Suppliers ---
  const addSupplier = async (newSupplier) => {
    setSuppliers(prev => [newSupplier, ...prev]);
    const { error } = await supabase.from('suppliers').insert([newSupplier]);
    if (error) console.error("Error inserting supplier:", error);
  };

  const editSupplier = async (id, updatedSupplier) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
    const { error } = await supabase.from('suppliers').update(updatedSupplier).eq('id', id);
    if (error) console.error("Error updating supplier:", error);
  };

  const deleteSupplier = async (id) => {
    if (confirm('¿Estás seguro de eliminar este proveedor? Su información de contacto se borrará del directorio.')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) console.error("Error deleting supplier:", error);
    }
  };

  // --- CRUD Clients ---
  const addClient = async (newClient) => {
    setClients(prev => [newClient, ...prev]);
    const { error } = await supabase.from('clients').insert([newClient]);
    if (error) console.error("Error inserting client:", error);
  };

  const editClient = async (id, updatedClient) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
    const { error } = await supabase.from('clients').update(updatedClient).eq('id', id);
    if (error) console.error("Error updating client:", error);
  };

  const deleteClient = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? Su información de contacto se borrará del directorio.')) {
      setClients(prev => prev.filter(c => c.id !== id));
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) console.error("Error deleting client:", error);
    }
  };

  // --- Debt Payment Handler ---
  const registerDebtPayment = async (debtId, paymentAmount) => {
    let finalDebt;
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        const remaining = Math.max(0, d.remainingAmount - paymentAmount);
        const status = remaining === 0 ? 'PAID' : remaining < d.amount ? 'PARTIAL' : 'PENDING';
        finalDebt = {
          ...d,
          remainingAmount: remaining,
          status
        };
        return finalDebt;
      }
      return d;
    }));

    if (finalDebt) {
      const { error } = await supabase
        .from('debts')
        .update({ remainingAmount: finalDebt.remainingAmount, status: finalDebt.status })
        .eq('id', debtId);
      if (error) console.error("Error registering debt payment:", error);
    }
  };

  // --- Edit Debt Handler ---
  const editDebt = async (id, updatedFields) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          ...updatedFields
        };
      }
      return d;
    }));

    const { error } = await supabase.from('debts').update(updatedFields).eq('id', id);
    if (error) console.error("Error updating debt fields:", error);
  };

  // --- CRUD Expenses ---
  const addExpense = async (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    const { error } = await supabase.from('expenses').insert([newExpense]);
    if (error) console.error("Error inserting expense:", error);
  };

  const editExpense = async (id, updatedExpense) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
    const { error } = await supabase.from('expenses').update(updatedExpense).eq('id', id);
    if (error) console.error("Error updating expense:", error);
  };

  const deleteExpense = async (id) => {
    if (confirm('¿Estás seguro de eliminar este gasto de operación?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard purchases={purchases} sales={sales} expenses={expenses} />
        )}

        {activeTab === 'inventory' && (
          <Inventory 
            purchases={purchases} 
            sales={sales} 
            deletePurchase={deletePurchase} 
            editPurchase={editPurchase} 
            deleteSale={deleteSale} 
            editSale={editSale} 
          />
        )}
        
        {activeTab === 'purchases' && (
          <PurchaseForm 
            purchases={purchases} 
            addPurchase={addPurchase} 
            deletePurchase={deletePurchase} 
            editPurchase={editPurchase} 
            suppliers={suppliers}
          />
        )}
        
        {activeTab === 'quality' && (
          <QualityControl purchases={purchases} updatePurchaseQcStatus={updatePurchaseQcStatus} />
        )}
        
        {activeTab === 'sales' && (
          <SalesForm 
            purchases={purchases} 
            sales={sales} 
            addSale={addSale} 
            updatePurchaseSaleStatus={updatePurchaseSaleStatus} 
            deleteSale={deleteSale} 
            editSale={editSale} 
            clients={clients}
          />
        )}
        
        {activeTab === 'traceability' && (
          <Traceability purchases={purchases} sales={sales} />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersList 
            suppliers={suppliers} 
            addSupplier={addSupplier} 
            editSupplier={editSupplier} 
            deleteSupplier={deleteSupplier} 
          />
        )}

        {activeTab === 'clients' && (
          <ClientsList 
            clients={clients} 
            addClient={addClient} 
            editClient={editClient} 
            deleteClient={deleteClient} 
          />
        )}

        {activeTab === 'debts' && (
          <DebtsList 
            debts={debts} 
            registerDebtPayment={registerDebtPayment} 
            editDebt={editDebt}
            suppliers={suppliers} 
            clients={clients} 
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesList 
            expenses={expenses} 
            addExpense={addExpense} 
            editExpense={editExpense} 
            deleteExpense={deleteExpense} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
