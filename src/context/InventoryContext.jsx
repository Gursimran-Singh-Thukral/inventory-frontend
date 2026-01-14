import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const InventoryContext = createContext();

// THE API URL (Your Backend Address)
const API_URL = "https://inventory-management-system-i7af.onrender.com/api";

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // --- 1. FETCH DATA FROM SERVER ON LOAD ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const itemsRes = await axios.get(`${API_URL}/items`);
      const txnRes = await axios.get(`${API_URL}/transactions`);
      
      // Ensure backend "id" (from .toJSON transform) matches frontend expectations
      setInventory(itemsRes.data);
      setTransactions(txnRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- 2. ITEM ACTIONS ---
  const addItem = async (item) => {
    try {
      const res = await axios.post(`${API_URL}/items`, item);
      setInventory([...inventory, res.data]);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const updateItem = async (updatedItem) => {
    try {
      const res = await axios.put(`${API_URL}/items/${updatedItem.id}`, updatedItem);
      setInventory(inventory.map(item => item.id === updatedItem.id ? res.data : item));
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // --- 3. TRANSACTION ACTIONS ---
  const addTransaction = async (txn) => {
    try {
      // Create Transaction
      const res = await axios.post(`${API_URL}/transactions`, txn);
      const newTxn = res.data;
      
      // Update Transaction List
      setTransactions([newTxn, ...transactions]);

      // Update Inventory Stock Locally (to reflect change immediately)
      const qtyChange = parseFloat(txn.quantity);
      setInventory(prev => prev.map(item => {
        if (item.name === txn.itemName) {
          const newQty = txn.type === "IN" 
            ? (item.quantity + qtyChange) 
            : (item.quantity - qtyChange);
          return { ...item, quantity: newQty };
        }
        return item;
      }));

    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const updateTransaction = (updatedTxn) => {
    // For now, simple local update (Backend update logic is complex for stock recalc)
    setTransactions(transactions.map(txn => txn.id === updatedTxn.id ? updatedTxn : txn));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(txn => txn.id !== id));
  };

  return (
    <InventoryContext.Provider value={{ 
      inventory, addItem, updateItem, deleteItem,
      transactions, addTransaction, updateTransaction, deleteTransaction 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);