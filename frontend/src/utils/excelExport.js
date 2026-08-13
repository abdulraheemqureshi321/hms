import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  try {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths based on longest string
    const colWidths = Object.keys(data[0]).map(key => {
      const maxLen = Math.max(
        key.toString().length,
        ...data.map(row => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  } catch (err) {
    console.error('Excel Export Error:', err);
    alert('Failed to generate Excel file: ' + err.message);
  }
};
