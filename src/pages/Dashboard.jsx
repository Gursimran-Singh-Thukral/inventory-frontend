import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, AlertTriangle, Search, Download, CheckCircle, AlertCircle } from 'lucide-react';
import XLSX from 'xlsx-js-style';

const Dashboard = ({ isDarkMode }) => {
  const { inventory } = useInventory();
  
  // Local State for Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByAlert, setSortByAlert] = useState(false);

  // --- 1. KPI CALCULATIONS ---
  const totalProducts = inventory.length;
  const alertProducts = inventory.filter(i => i.quantity <= i.alertQty).length;

  // --- 2. FILTER & SORT LOGIC ---
  let processedData = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortByAlert) {
    // Sort logic: 
    // Calculate "Safety Gap" (Qty - AlertQty).
    // Smallest gap (most negative) comes first. 
    // This puts critical low stock (-10) before warning (-2) before safe (+50).
    processedData.sort((a, b) => {
      const gapA = a.quantity - a.alertQty;
      const gapB = b.quantity - b.alertQty;
      return gapA - gapB;
    });
  } else {
    // Default sort by Name for better readability when not in "Alert Mode"
    processedData.sort((a, b) => a.name.localeCompare(b.name));
  }

  // --- 3. EXPORT FUNCTION ---
  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    
    // Beautiful Styles
    const headerStyle = { 
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }, 
      fill: { fgColor: { rgb: "2563EB" } }, 
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } 
    };
    
    const cellStyle = { 
      alignment: { horizontal: "center" }, 
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } 
    };

    const statusLowStyle = { 
      font: { color: { rgb: "DC2626" }, bold: true }, // Red Text
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const statusOkStyle = { 
      font: { color: { rgb: "166534" }, bold: true }, // Green Text
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    // Prepare Headers
    const headers = [
      { v: "Product Name", s: headerStyle }, 
      { v: "Quantity Remaining", s: headerStyle }, 
      { v: "Status", s: headerStyle }
    ];

    // Prepare Data Rows
    const rows = processedData.map(item => {
      const isLow = item.quantity <= item.alertQty;
      return [
        { v: item.name, s: cellStyle },
        { v: `${item.quantity} ${item.unit}`, s: cellStyle },
        { v: isLow ? "LOW" : "OK", s: isLow ? statusLowStyle : statusOkStyle }
      ];
    });

    // Create Sheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Column Widths
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard_Report");
    XLSX.writeFile(workbook, "Stock_Status_Report.xlsx");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time stock overview</p>
        </div>
        <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* TOP CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        
        {/* Card 1: Total Products */}
        <div className={`p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 ${isDarkMode ? 'bg-darkcard' : 'bg-white'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs md:text-sm font-medium uppercase">Total Products</p>
              <h2 className="text-3xl font-bold mt-1">{totalProducts}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500"><Package size={28} /></div>
          </div>
        </div>

        {/* Card 2: Alert Products (CLICKABLE SORT) */}
        <div 
          onClick={() => setSortByAlert(!sortByAlert)} // Toggle sort on click
          className={`p-6 rounded-2xl shadow-lg border-l-4 border-red-500 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-darkcard' : 'bg-white'} ${sortByAlert ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs md:text-sm font-medium uppercase">Total Alert Products</p>
              <h2 className="text-3xl font-bold mt-1 text-red-500">{alertProducts}</h2>
              <p className="text-xs text-red-400 mt-1 underline">
                {sortByAlert ? "Table Sorted by Priority" : "Click to Prioritize Low Stock"}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full text-red-500"><AlertTriangle size={28} /></div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className={`rounded-2xl shadow-lg flex flex-col ${isDarkMode ? 'bg-darkcard' : 'bg-white'}`}>
        
        {/* TOOLBAR: Search & Export */}
        <div className={`p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Filter products..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} 
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-all font-medium w-full md:w-auto justify-center"
          >
            <Download size={18} /> Export List
          </button>
        </div>
        
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                <th className="p-4 text-sm font-bold uppercase tracking-wide">Name of the Product</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wide text-center">Quantity Remaining</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wide text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {processedData.map((item) => {
                const isLow = item.quantity <= item.alertQty;
                
                return (
                  <tr key={item.id} className={`hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    {/* Name */}
                    <td className="p-4 font-medium">
                      {item.name}
                      <span className="text-xs opacity-50 ml-1 font-normal">({item.unit})</span>
                    </td>
                    
                    {/* Quantity */}
                    <td className="p-4 text-center font-bold font-mono text-lg">
                      {item.quantity}
                    </td>
                    
                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isLow 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {isLow ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                        {isLow ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {processedData.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-400 italic">
                    {searchTerm ? "No products match your search." : "Inventory is empty."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;