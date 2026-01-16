import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const InventoryContext = createContext();

// ⚠️ CHECK THIS: If testing on laptop, use localhost. If deployed, use Render URL.
const API_URL = "https://inventory-management-system-i7af.onrender.com/api"; 
// const API_URL = "http://localhost:5000/api"; 

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA (The Truth Source) ---
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
      console.error("Error fetching data:", error);
    }
  };

  // Poll every 2 seconds to keep devices in sync
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS (Async/Await guarantees DB update) ---

  const addItem = async (item) => {
    try {
      // 1. Send to Server
      const res = await axios.post(`${API_URL}/items`, item);
      // 2. Only update UI if Server succeeds
      setInventory(prev => [...prev, res.data]);
      return res.data; // Return data so Quick Add knows it's done
    } catch (err) { 
      console.error("Add Item Failed:", err); 
      alert("Failed to save item. Check connection.");
    }
  };

  const updateItem = async (updatedItem) => {
    try {
      await axios.put(`${API_URL}/items/${updatedItem.id}`, updatedItem);
      fetchData(); // Force refresh to catch any side effects (renaming, etc)
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      fetchData(); // Force refresh to remove cascading transactions
    } catch (err) { console.error(err); }
  };

  const addTransaction = async (txn) => {
    try {
      const res = await axios.post(`${API_URL}/transactions`, txn);
      setTransactions(prev => [res.data, ...prev]);
      fetchData(); // Refresh inventory quantities immediately
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