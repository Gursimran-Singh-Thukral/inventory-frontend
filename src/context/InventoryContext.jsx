import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const InventoryContext = createContext();

// Ensure this matches your Render URL exactly
const API_URL = "https://inventory-api-gursimran.onrender.com/api"; 

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  const fetchData = async () => {
    try {
      const [itemsRes, txnRes] = await Promise.all([
        axios.get(`${API_URL}/items`),
        axios.get(`${API_URL}/transactions`)
      ]);
      setInventory(itemsRes.data);
      setTransactions(txnRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  };

  // AUTO-SYNC (Every 2 Seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  const addItem = async (item) => {
    try {
      const res = await axios.post(`${API_URL}/items`, item);
      setInventory([...inventory, res.data]);
    } catch (err) { console.error(err); }
  };

  const updateItem = async (updatedItem) => {
    try {
      // 1. Optimistic Update (Update Name in UI immediately)
      const oldItem = inventory.find(i => i.id === updatedItem.id);
      setInventory(inventory.map(i => i.id === updatedItem.id ? updatedItem : i));
      
      // Update local transactions immediately too
      if (oldItem && oldItem.name !== updatedItem.name) {
        setTransactions(prev => prev.map(t => 
          t.itemName === oldItem.name ? { ...t, itemName: updatedItem.name } : t
        ));
      }

      // 2. API Call
      await axios.put(`${API_URL}/items/${updatedItem.id}`, updatedItem);
      fetchData(); // Sync with server to be sure
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    try {
      // 1. Find the name of the item being deleted
      const itemToDelete = inventory.find(i => i.id === id);
      
      // 2. Local Cleanup (Instant UI update)
      setInventory(inventory.filter(i => i.id !== id));
      if (itemToDelete) {
        setTransactions(transactions.filter(t => t.itemName !== itemToDelete.name));
      }

      // 3. API Call (Server Cleanup)
      await axios.delete(`${API_URL}/items/${id}`);
      
      // 4. Force Fetch (Ensure server matches local)
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const addTransaction = async (txn) => {
    try {
      const res = await axios.post(`${API_URL}/transactions`, txn);
      setTransactions([res.data, ...transactions]);
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const updateTransaction = async (updatedTxn) => {
    try {
      await axios.put(`${API_URL}/transactions/${updatedTxn.id}`, updatedTxn);
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  return (
    <InventoryContext.Provider value={{ 
      inventory, transactions, 
      addItem, updateItem, deleteItem, 
      addTransaction, updateTransaction, deleteTransaction,
      loading 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);