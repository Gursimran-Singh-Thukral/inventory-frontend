import React, { useState } from 'react';
import { Search, Download, Plus, X, Package, Pencil, Trash2 } from 'lucide-react'; // Removed Sun/Moon
import XLSX from 'xlsx-js-style';
import { useInventory } from '../context/InventoryContext';

const UNIT_OPTIONS = ["pcs", "nos", "set", "kg", "g", "can", "mtr", "feet", "roll", "pkt", "ltr", "box"];

// ACCEPT PROP HERE
const Items = ({ isDarkMode }) => {
  const { inventory, addItem, updateItem, deleteItem } = useInventory();
  const userRole = localStorage.getItem('userRole'); 

  const [searchTerm, setSearchTerm] = useState("");
  // REMOVED LOCAL DARK MODE STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", unit: "pcs", altUnit: "", factor: "", alertQty: "" });

  // REMOVED TOGGLE THEME FUNCTION (It's in Sidebar now)

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "altUnit" && value === "") {
        setNewItem(prev => ({ ...prev, altUnit: "", factor: "" }));
    } else {
        setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewItem({ name: "", unit: "pcs", altUnit: "", factor: "", alertQty: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      unit: item.unit,
      altUnit: item.altUnit === "-" ? "" : item.altUnit,
      factor: item.factor === "Manual" || item.factor === "-" ? "" : item.factor,
      alertQty: item.alertQty
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this item?")) deleteItem(id);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const itemData = {
      id: editingId,
      name: newItem.name,
      unit: newItem.unit,
      altUnit: newItem.altUnit || "-", 
      factor: newItem.altUnit ? (newItem.factor || "Manual") : "-", 
      alertQty: parseInt(newItem.alertQty) || 0
    };

    if (editingId) {
      updateItem(itemData);
    } else {
      addItem(itemData);
    }
    setIsModalOpen(false);
  };

  const filteredItems = inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
    const cellStyle = { alignment: { horizontal: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };

    const headers = [{ v: "Item Name", s: headerStyle }, { v: "Primary Unit", s: headerStyle }, { v: "Alt Unit", s: headerStyle }, { v: "Conversion", s: headerStyle }, { v: "Alert Qty", s: headerStyle }];
    const rows = filteredItems.map(item => [{ v: item.name, s: cellStyle }, { v: item.unit, s: cellStyle }, { v: item.altUnit, s: cellStyle }, { v: item.factor, s: cellStyle }, { v: item.alertQty, s: cellStyle }]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items_List");
    XLSX.writeFile(workbook, "Items_List.xlsx");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* Header - Button Removed */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Items Master</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your product list</p>
        </div>
      </div>

      <div className={`p-4 rounded-t-xl flex flex-col md:flex-row gap-4 justify-between items-center border-b ${isDarkMode ? 'bg-darkcard border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} 
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm md:text-base">
            <Download size={18} /> <span className="hidden md:inline">Export</span>
          </button>
          
          {userRole === 'admin' && (
            <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm md:text-base">
              <Plus size={18} /> <span className="hidden md:inline">Add Item</span><span className="md:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className={`overflow-x-auto rounded-b-xl shadow-sm border border-t-0 ${isDarkMode ? 'bg-darkcard border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              {["Item Name", "Primary Unit", "Alt Unit", "Conversion", "Alert Qty"].map(h => (
                <th key={h} className="p-4 font-semibold text-sm uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
              {userRole === 'admin' && <th className="p-4 font-semibold text-sm uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredItems.map((item) => (
              <tr key={item.id} className={`hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 font-mono text-blue-500">{item.unit}</td>
                <td className="p-4 opacity-70">{item.altUnit}</td>
                <td className="p-4 opacity-70">{item.factor}</td>
                <td className="p-4 font-bold text-red-500">{item.alertQty}</td>
                
                {userRole === 'admin' && (
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-[95%] md:w-full md:max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2"><Package className="text-blue-500" /> {editingId ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input required name="name" value={newItem.name} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Copper Pipe 1/2 inch" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Unit *</label>
                    <select required name="unit" value={newItem.unit} onChange={handleChange} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                      {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Alt Unit (Optional)</label>
                    <select name="altUnit" value={newItem.altUnit} onChange={handleChange} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">None</option>
                      {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${!newItem.altUnit ? "opacity-50" : ""}`}>Conversion Factor</label>
                    <input name="factor" value={newItem.factor} onChange={handleChange} type="number" disabled={!newItem.altUnit} className={`w-full p-3 rounded-lg border dark:border-gray-700 outline-none transition-colors ${!newItem.altUnit ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50" : "dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"}`} placeholder={!newItem.altUnit ? "Enter Alt Unit first" : "Leave blank for Manual"} />
                    <p className="text-xs opacity-60 mt-1">1 Primary = ? Alt</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alert Quantity *</label>
                    <input required name="alertQty" value={newItem.alertQty} onChange={handleChange} type="number" className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min stock level" />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all">{editingId ? "Update Item" : "Save Item"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;