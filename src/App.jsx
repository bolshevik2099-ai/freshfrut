import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Menu } from 'lucide-react';
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
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AIChat from './components/AIChat';
import ChatConfig from './components/ChatConfig';
import PackagingManager from './components/PackagingManager';





function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('freshfrut_session') === 'active' ? 'admin' : 'landing';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('freshfrut_user_role') || 'admin';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('freshfrut_user_email') || 'admin@tamfresh.com';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [lastOperatorActivity, setLastOperatorActivity] = useState(null);

  const fetchLastOperatorActivity = async () => {
    try {
      const { data } = await supabase
        .from('user_activity_logs')
        .select('created_at')
        .eq('user_email', 'operador@tamfresh.com')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const date = new Date(data[0].created_at);
        const formatted = date.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
        setLastOperatorActivity(formatted);
      }
    } catch (err) {
      console.error("Error fetching operator activity:", err);
    }
  };

  const handleLogin = (email, role) => {
    localStorage.setItem('freshfrut_session', 'active');
    localStorage.setItem('freshfrut_user_email', email);
    localStorage.setItem('freshfrut_user_role', role);
    setUserEmail(email);
    setUserRole(role);
    setCurrentView('admin');
    setActiveTab('dashboard');

    if (email === 'operador@tamfresh.com') {
      supabase.from('user_activity_logs').insert([{ user_email: 'operador@tamfresh.com', activity_type: 'LOGIN' }]).then(() => {});
    } else if (email === 'admin@tamfresh.com') {
      fetchLastOperatorActivity();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('freshfrut_session');
    localStorage.removeItem('freshfrut_user_email');
    localStorage.removeItem('freshfrut_user_role');
    setUserEmail('admin@tamfresh.com');
    setUserRole('admin');
    setLastOperatorActivity(null);
    setCurrentView('landing');
  };

  const fetchPackagingMaterials = async () => {
    try {
      const { data: pkgs } = await supabase.from('packaging_materials').select('*');
      if (pkgs) setPackagingMaterials(pkgs);
    } catch (err) {
      console.error("Error refreshing packaging materials:", err);
    }
  };

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

        const { data: pkgs } = await supabase.from('packaging_materials').select('*');
        if (pkgs) setPackagingMaterials(pkgs);

        // Track user activity and fetch operator activity for admin
        const sessionActive = localStorage.getItem('freshfrut_session') === 'active';
        const emailStored = localStorage.getItem('freshfrut_user_email');
        if (sessionActive) {
          if (emailStored === 'operador@tamfresh.com') {
            await supabase.from('user_activity_logs').insert([{ user_email: 'operador@tamfresh.com', activity_type: 'REFRESH' }]);
          } else if (emailStored === 'admin@tamfresh.com') {
            await fetchLastOperatorActivity();
          }
        }
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

    // Consigned packaging logic
    if (newPurchase.isConsigned) {
      const supplier = suppliers.find(s => s.name === newPurchase.producer);
      const producerId = supplier ? supplier.id : null;
      const txId = `TX-PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: txId,
        material_id: newPurchase.consignedMaterialId,
        type: newPurchase.consignedType || 'RETURNED_IN_PURCHASE',
        quantity: newPurchase.consignedQuantity,
        producer_id: producerId,
        reference_id: newPurchase.id,
        date: newPurchase.date,
        notes: newPurchase.consignedType === 'LEND_TO_PRODUCER'
          ? `Salida por préstamo de cajas en recepción ${newPurchase.id}`
          : `Entrada por recepción de fruta fresca en lote ${newPurchase.id}`
      };
      await supabase.from('packaging_transactions').insert([payload]);

      const mat = packagingMaterials.find(m => m.id === newPurchase.consignedMaterialId);
      if (mat) {
        let newStock = mat.stock_qty;
        let newLent = mat.lent_qty;
        if (payload.type === 'RETURNED_IN_PURCHASE') {
          newStock = mat.stock_qty + newPurchase.consignedQuantity;
          newLent = Math.max(0, mat.lent_qty - newPurchase.consignedQuantity);
        } else if (payload.type === 'LEND_TO_PRODUCER') {
          newStock = Math.max(0, mat.stock_qty - newPurchase.consignedQuantity);
          newLent = mat.lent_qty + newPurchase.consignedQuantity;
        }

        await supabase
          .from('packaging_materials')
          .update({
            stock_qty: newStock,
            lent_qty: newLent,
            total_qty: newStock + newLent
          })
          .eq('id', mat.id);
      }
      fetchPackagingMaterials();
    }

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
    const lot = purchases.find(p => p.id === id);
    if (!lot) return;

    const lotSales = sales.filter(s => s.purchaseId === id);
    const totalSold = lotSales.reduce((sum, s) => sum + s.kg, 0);
    const remaining = Math.max(0, updatedLot.kg - totalSold);
    const saleStatus = remaining === 0 ? 'SOLD' : remaining < updatedLot.kg ? 'PARTIALLY_SOLD' : 'UNSOLD';
    
    const finalLot = {
      ...lot,
      ...updatedLot,
      remainingKg: remaining,
      saleStatus,
      totalCost: updatedLot.kg * updatedLot.pricePerKg
    };

    setPurchases(prev => prev.map(p => p.id === id ? finalLot : p));

    // Revert old packaging transaction if it existed
    if (lot.isConsigned) {
      const { data: txs } = await supabase.from('packaging_transactions').select('*').eq('reference_id', id);
      if (txs && txs.length > 0) {
        const tx = txs[0];
        const mat = packagingMaterials.find(m => m.id === tx.material_id);
        if (mat) {
          let newStock = mat.stock_qty;
          let newLent = mat.lent_qty;
          if (tx.type === 'RETURNED_IN_PURCHASE') {
            newStock = Math.max(0, mat.stock_qty - tx.quantity);
            newLent = mat.lent_qty + tx.quantity;
          } else if (tx.type === 'LEND_TO_PRODUCER') {
            newStock = mat.stock_qty + tx.quantity;
            newLent = Math.max(0, mat.lent_qty - tx.quantity);
          }
          await supabase.from('packaging_materials').update({ stock_qty: newStock, lent_qty: newLent, total_qty: newStock + newLent }).eq('id', mat.id);
        }
        await supabase.from('packaging_transactions').delete().eq('reference_id', id);
      }
    }

    // Apply new packaging transaction if updated is consigned
    if (updatedLot.isConsigned) {
      const supplier = suppliers.find(s => s.name === updatedLot.producer);
      const producerId = supplier ? supplier.id : null;
      const txId = `TX-PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: txId,
        material_id: updatedLot.consignedMaterialId,
        type: updatedLot.consignedType || 'RETURNED_IN_PURCHASE',
        quantity: updatedLot.consignedQuantity,
        producer_id: producerId,
        reference_id: id,
        date: updatedLot.date,
        notes: updatedLot.consignedType === 'LEND_TO_PRODUCER'
          ? `Salida por préstamo de cajas en recepción ${id} (Editado)`
          : `Entrada por recepción de fruta fresca en lote ${id} (Editado)`
      };
      await supabase.from('packaging_transactions').insert([payload]);

      // Fetch fresh material status to ensure accuracy
      const { data: freshMats } = await supabase.from('packaging_materials').select('*').eq('id', updatedLot.consignedMaterialId);
      if (freshMats && freshMats.length > 0) {
        const mat = freshMats[0];
        let newStock = mat.stock_qty;
        let newLent = mat.lent_qty;
        if (payload.type === 'RETURNED_IN_PURCHASE') {
          newStock = mat.stock_qty + updatedLot.consignedQuantity;
          newLent = Math.max(0, mat.lent_qty - updatedLot.consignedQuantity);
        } else if (payload.type === 'LEND_TO_PRODUCER') {
          newStock = Math.max(0, mat.stock_qty - updatedLot.consignedQuantity);
          newLent = mat.lent_qty + updatedLot.consignedQuantity;
        }
        await supabase.from('packaging_materials').update({ stock_qty: newStock, lent_qty: newLent, total_qty: newStock + newLent }).eq('id', mat.id);
      }
    }
    fetchPackagingMaterials();

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
        qcData: finalLot.qcData,
        isConsigned: finalLot.isConsigned,
        consignedMaterialId: finalLot.consignedMaterialId,
        consignedQuantity: finalLot.consignedQuantity,
        consignedType: finalLot.consignedType
      })
      .eq('id', id);
    if (error) console.error("Error updating purchase:", error);

    // Also update any linked debt amount if it exists
    const d = debts.find(debt => debt.sourceId === id);
    if (d) {
      const newAmount = updatedLot.kg * updatedLot.pricePerKg;
      const amountDiff = newAmount - d.amount;
      const newRemaining = Math.max(0, d.remainingAmount + amountDiff);
      const status = newRemaining === 0 ? 'PAID' : newRemaining < newAmount ? 'PARTIAL' : 'PENDING';

      setDebts(prev => prev.map(debt => {
        if (debt.sourceId === id) {
          return {
            ...debt,
            entityName: updatedLot.producer,
            amount: newAmount,
            remainingAmount: newRemaining,
            status
          };
        }
        return debt;
      }));

      const { error: debtErr } = await supabase
        .from('debts')
        .update({
          entityName: updatedLot.producer,
          amount: newAmount,
          remainingAmount: newRemaining,
          status
        })
        .eq('id', d.id);
      if (debtErr) console.error("Error updating debt:", debtErr);
    }
  };

  const deletePurchase = async (id) => {
    const lot = purchases.find(p => p.id === id);
    if (!lot) return;

    if (confirm(`¿Estás seguro de eliminar el Lote ${id}? Esto también eliminará las ventas y deudas asociadas.`)) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      setSales(prev => prev.filter(s => s.purchaseId !== id));
      setDebts(prev => prev.filter(d => d.sourceId !== id));

      // Find and revert associated packaging transaction for the purchase
      const { data: txs } = await supabase.from('packaging_transactions').select('*').eq('reference_id', id);
      if (txs && txs.length > 0) {
        const tx = txs[0];
        const mat = packagingMaterials.find(m => m.id === tx.material_id);
        if (mat) {
          let newStock = mat.stock_qty;
          let newLent = mat.lent_qty;
          if (tx.type === 'RETURNED_IN_PURCHASE') {
            newStock = Math.max(0, mat.stock_qty - tx.quantity);
            newLent = mat.lent_qty + tx.quantity;
          } else if (tx.type === 'LEND_TO_PRODUCER') {
            newStock = mat.stock_qty + tx.quantity;
            newLent = Math.max(0, mat.lent_qty - tx.quantity);
          }
          await supabase.from('packaging_materials').update({ stock_qty: newStock, lent_qty: newLent, total_qty: newStock + newLent }).eq('id', mat.id);
        }
        await supabase.from('packaging_transactions').delete().eq('reference_id', id);
      }

      // Also revert and delete packaging transactions for any sales linked to this purchase
      const associatedSales = sales.filter(s => s.purchaseId === id);
      for (const sale of associatedSales) {
        const { data: saleTxs } = await supabase.from('packaging_transactions').select('*').eq('reference_id', sale.id);
        if (saleTxs && saleTxs.length > 0) {
          const tx = saleTxs[0];
          const mat = packagingMaterials.find(m => m.id === tx.material_id);
          if (mat) {
            let newStock = mat.stock_qty;
            if (tx.type === 'SHIPPED_IN_SALE') {
              newStock = mat.stock_qty + tx.quantity;
            } else if (tx.type === 'RECEIVE_FROM_BUYER') {
              newStock = Math.max(0, mat.stock_qty - tx.quantity);
            }
            await supabase.from('packaging_materials').update({ stock_qty: newStock, total_qty: newStock + mat.lent_qty }).eq('id', mat.id);
          }
          await supabase.from('packaging_transactions').delete().eq('reference_id', sale.id);
        }
      }
      fetchPackagingMaterials();

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

    // Consigned packaging logic
    if (newSale.isConsigned) {
      const clientObj = clients.find(c => c.name === newSale.client);
      const clientId = clientObj ? clientObj.id : null;
      const txId = `TX-PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: txId,
        material_id: newSale.consignedMaterialId,
        type: newSale.consignedType || 'SHIPPED_IN_SALE',
        quantity: newSale.consignedQuantity,
        client_id: clientId,
        reference_id: newSale.id,
        date: newSale.date,
        notes: newSale.consignedType === 'RECEIVE_FROM_BUYER'
          ? `Entrada por devolución de cajas de comprador en venta ${newSale.id}`
          : `Salida por despacho de fruta en venta ${newSale.id}`
      };
      await supabase.from('packaging_transactions').insert([payload]);

      const mat = packagingMaterials.find(m => m.id === newSale.consignedMaterialId);
      if (mat) {
        let newStock = mat.stock_qty;
        if (payload.type === 'SHIPPED_IN_SALE') {
          newStock = Math.max(0, mat.stock_qty - newSale.consignedQuantity);
        } else if (payload.type === 'RECEIVE_FROM_BUYER') {
          newStock = mat.stock_qty + newSale.consignedQuantity;
        }
        await supabase
          .from('packaging_materials')
          .update({
            stock_qty: newStock,
            total_qty: newStock + mat.lent_qty
          })
          .eq('id', mat.id);
      }
      fetchPackagingMaterials();
    }

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
    const lot = purchases.find(p => p.id === lotId);
    if (!lot) return;

    const remaining = Math.max(0, lot.remainingKg - kgSold);
    const saleStatus = remaining === 0 ? 'SOLD' : 'PARTIALLY_SOLD';

    setPurchases(prev => prev.map(p => 
      p.id === lotId ? { ...p, remainingKg: remaining, saleStatus } : p
    ));

    const { error } = await supabase
      .from('purchases')
      .update({ remainingKg: remaining, saleStatus })
      .eq('id', lotId);
    if (error) console.error("Error updating purchase remaining kg:", error);
  };

  const deleteSale = async (saleId) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    if (confirm(`¿Estás seguro de eliminar la Venta ${saleId}? Los kilos vendidos se devolverán al inventario y se cancelará su deuda asociada.`)) {
      const lot = purchases.find(p => p.id === saleToDelete.purchaseId);
      
      if (lot) {
        const remaining = lot.remainingKg + saleToDelete.kg;
        const saleStatus = remaining === lot.kg ? 'UNSOLD' : 'PARTIALLY_SOLD';

        setPurchases(prev => prev.map(p => 
          p.id === saleToDelete.purchaseId ? { ...p, remainingKg: remaining, saleStatus } : p
        ));

        const { error: pErr } = await supabase
          .from('purchases')
          .update({ remainingKg: remaining, saleStatus })
          .eq('id', lot.id);
        if (pErr) console.error("Error updating purchase remaining kg after sale deletion:", pErr);
      }

      // Always find and revert any associated packaging transaction
      const { data: txs } = await supabase.from('packaging_transactions').select('*').eq('reference_id', saleId);
      if (txs && txs.length > 0) {
        const tx = txs[0];
        const mat = packagingMaterials.find(m => m.id === tx.material_id);
        if (mat) {
          let newStock = mat.stock_qty;
          if (tx.type === 'SHIPPED_IN_SALE') {
            newStock = mat.stock_qty + tx.quantity;
          } else if (tx.type === 'RECEIVE_FROM_BUYER') {
            newStock = Math.max(0, mat.stock_qty - tx.quantity);
          }
          await supabase.from('packaging_materials').update({ stock_qty: newStock, total_qty: newStock + mat.lent_qty }).eq('id', mat.id);
        }
        await supabase.from('packaging_transactions').delete().eq('reference_id', saleId);
      }
      fetchPackagingMaterials();

      setSales(prev => prev.filter(s => s.id !== saleId));
      setDebts(prev => prev.filter(d => d.sourceId !== saleId));

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

    const remaining = Math.max(0, lot.remainingKg - kgDiff);
    const saleStatus = remaining === 0 ? 'SOLD' : remaining === lot.kg ? 'UNSOLD' : 'PARTIALLY_SOLD';

    setPurchases(prev => prev.map(p => 
      p.id === oldSale.purchaseId ? { ...p, remainingKg: remaining, saleStatus } : p
    ));

    const { error: pErr } = await supabase
      .from('purchases')
      .update({ remainingKg: remaining, saleStatus })
      .eq('id', lot.id);
    if (pErr) console.error("Error updating purchase remaining kg after sale edit:", pErr);

    // Revert old packaging transaction if it existed
    if (oldSale.isConsigned) {
      const { data: txs } = await supabase.from('packaging_transactions').select('*').eq('reference_id', saleId);
      if (txs && txs.length > 0) {
        const tx = txs[0];
        const mat = packagingMaterials.find(m => m.id === tx.material_id);
        if (mat) {
          let newStock = mat.stock_qty;
          if (tx.type === 'SHIPPED_IN_SALE') {
            newStock = mat.stock_qty + tx.quantity;
          } else if (tx.type === 'RECEIVE_FROM_BUYER') {
            newStock = Math.max(0, mat.stock_qty - tx.quantity);
          }
          await supabase.from('packaging_materials').update({ stock_qty: newStock, total_qty: newStock + mat.lent_qty }).eq('id', mat.id);
        }
        await supabase.from('packaging_transactions').delete().eq('reference_id', saleId);
      }
    }

    // Apply new packaging transaction if updated is consigned
    if (updatedSale.isConsigned) {
      const clientObj = clients.find(c => c.name === updatedSale.client);
      const clientId = clientObj ? clientObj.id : null;
      const txId = `TX-PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: txId,
        material_id: updatedSale.consignedMaterialId,
        type: updatedSale.consignedType || 'SHIPPED_IN_SALE',
        quantity: updatedSale.consignedQuantity,
        client_id: clientId,
        reference_id: saleId,
        date: updatedSale.date,
        notes: updatedSale.consignedType === 'RECEIVE_FROM_BUYER'
          ? `Entrada por devolución de cajas de comprador en venta ${saleId} (Editado)`
          : `Salida por despacho de fruta en venta ${saleId} (Editado)`
      };
      await supabase.from('packaging_transactions').insert([payload]);

      // Fetch fresh material status to ensure accuracy
      const { data: freshMats } = await supabase.from('packaging_materials').select('*').eq('id', updatedSale.consignedMaterialId);
      if (freshMats && freshMats.length > 0) {
        const mat = freshMats[0];
        let newStock = mat.stock_qty;
        if (payload.type === 'SHIPPED_IN_SALE') {
          newStock = Math.max(0, mat.stock_qty - updatedSale.consignedQuantity);
        } else if (payload.type === 'RECEIVE_FROM_BUYER') {
          newStock = mat.stock_qty + updatedSale.consignedQuantity;
        }
        await supabase.from('packaging_materials').update({ stock_qty: newStock, total_qty: newStock + mat.lent_qty }).eq('id', mat.id);
      }
    }
    fetchPackagingMaterials();

    // Update sale and associated debt
    const newRevenue = updatedSale.kg * updatedSale.priceSoldPerKg;
    const d = debts.find(debt => debt.sourceId === saleId);
    
    if (d) {
      const revDiff = newRevenue - d.amount;
      const newRemaining = Math.max(0, d.remainingAmount + revDiff);
      const status = newRemaining === 0 ? 'PAID' : newRemaining < newRevenue ? 'PARTIAL' : 'PENDING';

      setDebts(prev => prev.map(debt => 
        debt.sourceId === saleId ? { ...debt, entityName: updatedSale.client, amount: newRevenue, remainingAmount: newRemaining, status } : debt
      ));

      const { error: dErr } = await supabase
        .from('debts')
        .update({
          entityName: updatedSale.client,
          amount: newRevenue,
          remainingAmount: newRemaining,
          status
        })
        .eq('id', d.id);
      if (dErr) console.error("Error updating debt after sale edit:", dErr);
    }

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
            status: finalSale.status,
            isConsigned: finalSale.isConsigned,
            consignedMaterialId: finalSale.consignedMaterialId,
            consignedQuantity: finalSale.consignedQuantity,
            consignedType: finalSale.consignedType
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
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const remaining = Math.max(0, debt.remainingAmount - paymentAmount);
    const status = remaining === 0 ? 'PAID' : remaining < debt.amount ? 'PARTIAL' : 'PENDING';

    setDebts(prev => prev.map(d => 
      d.id === debtId ? { ...d, remainingAmount: remaining, status } : d
    ));

    const { error } = await supabase
      .from('debts')
      .update({ remainingAmount: remaining, status })
      .eq('id', debtId);
    if (error) console.error("Error registering debt payment:", error);
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

  // --- Delete Debt Handler ---
  const deleteDebt = async (id) => {
    if (confirm(`¿Estás seguro de eliminar esta cuenta/deuda ${id}?`)) {
      setDebts(prev => prev.filter(d => d.id !== id));
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) console.error("Error deleting debt:", error);
    }
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

  if (currentView === 'landing') {
    return <LandingPage onNavigateToLogin={() => setCurrentView('login')} purchases={purchases} />;
  }

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
  }

  return (
    <div className="app-container">
      {/* Mobile Header Bar */}
      <header className="mobile-header glass-panel" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '160px',
        zIndex: 1000,
        display: 'none', // Managed in CSS via media queries
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderRadius: 0,
        borderBottom: '1px solid var(--panel-border)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)'
      }}>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Menu size={24} />
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
          <img src="/tamfresh_logo.png" alt="Tamfresh Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
          Tam<span style={{ color: 'var(--color-success)' }}>fresh</span>
        </span>
        <div style={{ width: '40px' }}></div> {/* Spacer to center title */}
      </header>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        userRole={userRole} 
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Panel Content */}
      <main className="main-content">
        {userRole === 'admin' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            boxShadow: '0 4px 15px rgba(30, 58, 138, 0.03)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '8px'
          }} className="admin-activity-bar">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px', backgroundColor: lastOperatorActivity ? 'var(--color-success)' : 'var(--color-warning)' }}></span>
              <strong>Seguimiento de Operador:</strong> {lastOperatorActivity ? `Última actividad el ${lastOperatorActivity}` : 'Sin actividad reciente registrada (operador aún no ha ingresado)'}
            </span>
            <span className="badge badge-blue" style={{ padding: '4px 10px', fontSize: '0.7rem', textTransform: 'none', background: 'rgba(30, 58, 138, 0.05)', color: 'var(--color-blueberry)', border: '1px solid rgba(30, 58, 138, 0.15)' }}>
              Modo Administrador
            </span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard purchases={purchases} sales={sales} expenses={expenses} debts={debts} />
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
        
        {activeTab === 'packaging' && (
          <PackagingManager 
            suppliers={suppliers} 
            clients={clients} 
            onRefreshMaterials={fetchPackagingMaterials}
          />
        )}
        
        {activeTab === 'purchases' && (
          <PurchaseForm 
            purchases={purchases} 
            addPurchase={addPurchase} 
            deletePurchase={deletePurchase} 
            editPurchase={editPurchase} 
            suppliers={suppliers}
            packagingMaterials={packagingMaterials}
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
            packagingMaterials={packagingMaterials}
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
            deleteDebt={deleteDebt}
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

        {activeTab === 'chat_config' && (
          <ChatConfig />
        )}
      </main>

      <AIChat 
        purchases={purchases} 
        sales={sales} 
        suppliers={suppliers} 
        clients={clients} 
        debts={debts} 
        expenses={expenses} 
        userEmail={userEmail}
      />
    </div>
  );
}

export default App;
