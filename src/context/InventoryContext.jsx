import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const InventoryContext = createContext();

// ⚠️ FIXED URL: Added "/api" at the end
const API_URL = "https://inventory-management-system-i7af.onrender.com/api"; 

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const [itemsRes, txnRes] = await Promise.all([
        axios.get(`${API_URL}/items`),        // Becomes .../api/items
        axios.get(`${API_URL}/transactions`)  // Becomes .../api/transactions
      ]);
      setInventory(itemsRes.data);
      setTransactions(txnRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Poll every 2 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  const addItem = async (item) => {
    try {
      const res = await axios.post(`${API_URL}/items`, item);
      setInventory(prev => [...prev, res.data]);
      return res.data; 
    } catch (err) { 
      console.error("Add Item Failed:", err); 
      alert("Failed to save item. Check connection.");
    }
  };

  const updateItem = async (updatedItem) => {
    try {
      await axios.put(`${API_URL}/items/${updatedItem.id}`, updatedItem);
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const addTransaction = async (txn) => {
    try {
      const res = await axios.post(`${API_URL}/transactions`, txn);
      setTransactions(prev => [res.data, ...prev]);
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