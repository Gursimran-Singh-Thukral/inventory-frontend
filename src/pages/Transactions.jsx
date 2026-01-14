import React, { useState } from 'react';
import { Search, Download, Plus, X, ClipboardList, Pencil, Trash2, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import XLSX from 'xlsx-js-style';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useInventory } from '../context/InventoryContext';

const Transactions = ({ isDarkMode }) => {
  const { inventory, transactions, addTransaction, updateTransaction, deleteTransaction } = useInventory();
  const userRole = localStorage.getItem('userRole');

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Custom Delete Modal State
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date(), 
    itemName: "", type: "IN", quantity: "", altQty: "", remarks: "", unit: "", altUnit: ""
  });

  // --- HANDLERS ---
  const handleItemSelect = (e) => {
    const selectedName = e.target.value;
    const item = inventory.find(i => i.name === selectedName);
    
    setFormData(prev => ({ 
      ...prev, 
      itemName: selectedName,
      unit: item ? item.unit : "",
      altUnit: item ? item.altUnit : ""
    }));

    if (item && formData.quantity && item.factor && item.factor !== "Manual" && item.factor !== "-") {
      const factor = parseFloat(item.factor);
      setFormData(prev => ({ ...prev, altQty: (parseFloat(prev.quantity) * factor).toFixed(2) }));
    }
  };

  const handleQtyChange = (e) => {
    const qty = e.target.value;
    setFormData(prev => ({ ...prev, quantity: qty }));

    const item = inventory.find(i => i.name === formData.itemName);
    if (item && qty && item.factor && item.factor !== "Manual" && item.factor !== "-") {
      const factor = parseFloat(item.factor);
      setFormData(prev => ({ ...prev, altQty: (parseFloat(qty) * factor).toFixed(2) }));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ date: new Date(), itemName: "", type: "IN", quantity: "", altQty: "", remarks: "", unit: "", altUnit: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (txn) => {
    setEditingId(txn.id);
    setFormData({ ...txn, date: new Date(txn.date) });
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...formData, date: formData.date.toISOString().split('T')[0] };
    if (editingId) {
      updateTransaction({ ...payload, id: editingId });
    } else {
      addTransaction(payload);
    }
    setIsModalOpen(false);
  };

  // --- FILTER & EXPORT ---
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          txn.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (startDate && endDate) {
      const txnDate = new Date(txn.date);
      txnDate.setHours(0,0,0,0);
      const start = new Date(startDate); start.setHours(0,0,0,0);
      const end = new Date(endDate); end.setHours(23,59,59,999);
      matchesDate = txnDate >= start && txnDate <= end;
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } };
    const cellStyle = { alignment: { horizontal: "center" } };
    const headers = [{ v: "Date", s: headerStyle }, { v: "Type", s: headerStyle }, { v: "Item", s: headerStyle }, { v: "Qty", s: headerStyle }, { v: "Alt Qty", s: headerStyle }, { v: "Remarks", s: headerStyle }];
    const rows = filteredTransactions.map(t => [
      { v: t.date, s: cellStyle },
      { v: t.type, s: { ...cellStyle, font: { color: { rgb: t.type === "IN" ? "166534" : "991B1B" }, bold: true } } },
      { v: t.itemName, s: cellStyle },
      { v: t.quantity, s: cellStyle },
      { v: t.altQty || "-", s: cellStyle },
      { v: t.remarks, s: cellStyle }
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "Transactions_Report.xlsx");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold">Transactions</h1><p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track stock movements</p></div>
      </div>

      {/* Toolbar */}
      <div className={`p-4 rounded-t-xl flex flex-col md:flex-row flex-wrap gap-4 justify-between items-center border-b ${isDarkMode ? 'bg-darkcard border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-stretch md:items-center">
            <div className="relative w-full md:w-64"><Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} /></div>
            <div className="relative w-full md:w-64 z-20"><div className="absolute left-3 top-3 pointer-events-none z-10 text-gray-400"><CalendarIcon size={18} /></div><DatePicker selectsRange={true} startDate={startDate} endDate={endDate} onChange={(update) => setDateRange(update)} isClearable={true} placeholderText="Select Date Range" className={`w-full pl-10 pr-4 py-2 rounded-lg border cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800'}`} dateFormat="MMM d, yyyy" /></div>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm md:text-base"><Download size={18} /> <span className="hidden md:inline">Export</span></button>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm md:text-base"><Plus size={18} /> <span className="hidden md:inline">Add Transaction</span><span className="md:hidden">Add</span></button>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-b-xl shadow-sm border border-t-0 ${isDarkMode ? 'bg-darkcard border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              {["Date", "Type", "Item", "Qty", "Alt Qty", "Remarks"].map(h => <th key={h} className="p-4 font-semibold text-sm uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              {userRole === 'admin' && <th className="p-4 font-semibold text-sm uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className={`hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                <td className="p-4 font-mono text-sm opacity-70">{txn.date}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${txn.type === "IN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{txn.type}</span></td>
                <td className="p-4 font-medium">{txn.itemName}</td>
                <td className="p-4 font-bold">{txn.quantity}</td>
                <td className="p-4 opacity-70">{txn.altQty || "-"}</td>
                <td className="p-4 text-sm opacity-80 truncate max-w-xs">{txn.remarks}</td>
                {userRole === 'admin' && (
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(txn)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteId(txn.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-[95%] md:w-full md:max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="text-blue-500" /> {editingId ? "Edit Transaction" : "New Transaction"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col"><label className="block text-sm font-medium mb-1">Date</label><DatePicker selected={formData.date} onChange={(date) => setFormData({...formData, date})} className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`} dateFormat="yyyy-MM-dd" /></div>
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"><option value="IN">Stock IN (Purchase)</option><option value="OUT">Stock OUT (Use)</option></select></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Item Name</label><input required list="items" value={formData.itemName} onChange={handleItemSelect} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type to search..." /><datalist id="items">{inventory.map(item => <option key={item.id} value={item.name} />)}</datalist></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Primary Qty {formData.unit && <span className="text-blue-500 font-bold">({formData.unit})</span>}</label><input required type="number" value={formData.quantity} onChange={handleQtyChange} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" /></div>
                  <div><label className="block text-sm font-medium mb-1">Alt Qty {formData.altUnit && <span className="text-blue-500 font-bold">({formData.altUnit})</span>}</label><input type="number" value={formData.altQty} onChange={(e) => setFormData({...formData, altQty: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Remarks</label><textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Purchase order #123" rows="2"></textarea></div>
                <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button><button type="submit" className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all">{editingId ? "Update" : "Save"}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center transform transition-all scale-100 ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-800'}`}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete Transaction?</h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Are you sure you want to delete this transaction? Stock levels will remain unchanged unless you adjust them manually.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for DatePicker */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
        .dark .react-datepicker { background-color: #1f2937; border-color: #374151; color: white; font-family: inherit; }
        .dark .react-datepicker__header { background-color: #111827; border-bottom-color: #374151; }
        .dark .react-datepicker__current-month, .dark .react-datepicker-time__header, .dark .react-datepicker-year-header { color: white; }
        .dark .react-datepicker__day-name, .dark .react-datepicker__day, .dark .react-datepicker__time-name { color: #d1d5db; }
        .dark .react-datepicker__day:hover, .dark .react-datepicker__month-text:hover, .dark .react-datepicker__quarter-text:hover, .dark .react-datepicker__year-text:hover { background-color: #374151; }
        .dark .react-datepicker__day--selected, .dark .react-datepicker__day--in-selecting-range, .dark .react-datepicker__day--in-range { background-color: #2563eb; color: white; }
        .react-datepicker__close-icon::after { background-color: #ef4444; color: white; }
      `}</style>
    </div>
  );
};

export default Transactions;