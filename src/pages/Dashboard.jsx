import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, AlertTriangle, Search, Download, CheckCircle, AlertCircle } from 'lucide-react';
import XLSX from 'xlsx-js-style';

const Dashboard = ({ isDarkMode }) => {
  const { inventory } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByAlert, setSortByAlert] = useState(false);

  const totalProducts = inventory.length;
  const alertProducts = inventory.filter(i => i.quantity <= i.alertQty).length;

  let processedData = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortByAlert) {
    processedData.sort((a, b) => (a.quantity - a.alertQty) - (b.quantity - b.alertQty));
  } else {
    processedData.sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const headers = [
      { v: "Product Name", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } } }, 
      { v: "Primary Qty left", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } } }, 
      { v: "Alt qty left", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } } }, 
      { v: "Status", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } } }
    ];
    const rows = processedData.map(item => {
      // Logic: Just use the number the server sent us
      const altVal = parseFloat(item.altQuantity) || 0;
      const altText = (altVal !== 0 || item.altUnit) ? `${altVal.toFixed(2).replace(/\.00$/, '')} ${item.altUnit || ''}` : '-';
      
      return [
        { v: item.name, s: { alignment: { horizontal: "center" } } },
        { v: `${item.quantity} ${item.unit}`, s: { alignment: { horizontal: "center" } } },
        { v: altText, s: { alignment: { horizontal: "center" } } }, 
        { v: item.quantity <= item.alertQty ? "LOW" : "OK", s: { font: { color: { rgb: item.quantity <= item.alertQty ? "DC2626" : "166534" }, bold: true }, alignment: { horizontal: "center" } } }
      ];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard_Report");
    XLSX.writeFile(workbook, "Stock_Status_Report.xlsx");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div><h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1><p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time stock overview</p></div>
        <div className={`text-sm font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className={`p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 ${isDarkMode ? 'bg-darkcard' : 'bg-white'}`}>
          <div className="flex justify-between items-center"><div><p className="text-gray-400 text-xs md:text-sm font-medium uppercase">Total Products</p><h2 className="text-3xl font-bold mt-1">{totalProducts}</h2></div><div className="p-3 bg-blue-500/10 rounded-full text-blue-500"><Package size={28} /></div></div>
        </div>
        <div onClick={() => setSortByAlert(!sortByAlert)} className={`p-6 rounded-2xl shadow-lg border-l-4 border-red-500 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-darkcard' : 'bg-white'} ${sortByAlert ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''}`}>
          <div className="flex justify-between items-center"><div><p className="text-gray-400 text-xs md:text-sm font-medium uppercase">Total Alert Products</p><h2 className="text-3xl font-bold mt-1 text-red-500">{alertProducts}</h2></div><div className="p-3 bg-red-500/10 rounded-full text-red-500"><AlertTriangle size={28} /></div></div>
        </div>
      </div>

      <div className={`rounded-2xl shadow-lg flex flex-col ${isDarkMode ? 'bg-darkcard' : 'bg-white'}`}>
        <div className={`p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="relative w-full md:w-80"><Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" /><input type="text" placeholder="Filter products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} /></div>
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-all font-medium w-full md:w-auto justify-center"><Download size={18} /> Export List</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                <th className="p-4 text-sm font-bold uppercase tracking-wide">Product Name</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wide text-center">Primary Qty left</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wide text-center">Alt qty left</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wide text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {processedData.map((item) => {
                const isLow = item.quantity <= item.alertQty;
                
                // --- SIMPLE DISPLAY LOGIC ---
                // We use parseFloat to catch any remaining string numbers
                const altVal = parseFloat(item.altQuantity) || 0;
                
                let display = "-";
                // Show Number if > 0 OR if the unit is defined
                if (altVal !== 0 || (item.altUnit && item.altUnit !== '-')) {
                    display = `${altVal.toFixed(2).replace(/\.00$/, '')} <span class="text-xs opacity-60">${item.altUnit || ''}</span>`;
                }

                return (
                  <tr key={item.id} className={`hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 font-medium">{item.name}<span className="text-xs opacity-50 ml-1 font-normal">({item.unit})</span></td>
                    <td className="p-4 text-center font-bold font-mono text-lg">{item.quantity}</td>
                    
                    <td className="p-4 text-center font-mono opacity-80">
                      {display !== '-' ? (<span dangerouslySetInnerHTML={{ __html: display }}></span>) : (<span className="opacity-30">-</span>)}
                    </td>
                    
                    <td className="p-4 text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isLow ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>{isLow ? <AlertCircle size={14} /> : <CheckCircle size={14} />}{isLow ? "Low" : "OK"}</span></td>
                  </tr>
                );
              })}
              {processedData.length === 0 && (<tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">{searchTerm ? "No products match your search." : "Inventory is empty."}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;