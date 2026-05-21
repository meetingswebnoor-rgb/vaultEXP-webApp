/**
 * Enterprise Export Service
 * Generates CSVs, and simulates PDF/XLSX binary generation.
 */

class ExportService {
  generateCSV(reportType, data) {
    if (reportType === 'pnl') {
      let csv = 'Category,Type,Amount\n';
      
      // Income
      if (data.breakdown && data.breakdown.income) {
        for (const [key, val] of Object.entries(data.breakdown.income)) {
          csv += `"${key}","Income","${val}"\n`;
        }
      }
      
      // Expenses
      if (data.breakdown && data.breakdown.expenses) {
        for (const [key, val] of Object.entries(data.breakdown.expenses)) {
          csv += `"${key}","Expense","${val}"\n`;
        }
      }

      csv += `"Total Income","Summary","${data.totalIncome || 0}"\n`;
      csv += `"Total Expenses","Summary","${data.totalExpenses || 0}"\n`;
      csv += `"Net Income","Summary","${data.netIncome || 0}"\n`;
      
      return Buffer.from(csv, 'utf-8');
    }

    if (reportType === 'balanceSheet') {
      let csv = 'Account,Type,Balance\n';
      
      if (data.assets && data.assets.accounts) {
        data.assets.accounts.forEach(acc => {
          csv += `"${acc.name}","Asset","${acc.balance}"\n`;
        });
      }
      
      csv += `"Total Assets","Summary","${data.assets?.total || 0}"\n`;
      csv += `"Total Liabilities","Summary","${data.liabilities?.total || 0}"\n`;
      csv += `"Total Equity","Summary","${data.equity?.total || 0}"\n`;

      return Buffer.from(csv, 'utf-8');
    }

    return Buffer.from('Unsupported Report Type\n', 'utf-8');
  }

  generatePDF(reportType, data) {
    // In production, use pdfkit or a microservice.
    // Simulating a binary PDF payload.
    return Buffer.from(`%PDF-1.4\n%Mock PDF for ${reportType}\n%%EOF`, 'utf-8');
  }

  generateXLSX(reportType, data) {
    // In production, use xlsx or exceljs.
    // Simulating a binary XLSX payload.
    return Buffer.from(`PK\x03\x04Mock XLSX binary for ${reportType}`, 'utf-8');
  }
}

module.exports = new ExportService();
