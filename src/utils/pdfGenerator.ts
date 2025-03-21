
import { PDFOptions, Credential } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Add type augmentation for jsPDF to use autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (
  credentials: Credential[],
  options: PDFOptions
): jsPDF => {
  const { title, password, includeNotes } = options;
  
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    encryption: {
      userPassword: password || '',
      ownerPassword: password || '',
      userPermissions: ['print', 'copy'] as any
    }
  });
  
  // Add title
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text(title || 'Bold Pass Credentials', 105, 20, { align: 'center' });
  
  // Add creation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
  
  // Add credentials table
  const tableColumn = includeNotes
    ? ['Username', 'Password', 'Notes', 'Created']
    : ['Username', 'Password', 'Created'];
  
  const tableRows = credentials.map(credential => {
    const row = [
      credential.username,
      credential.password,
      includeNotes ? credential.notes : null,
      new Date(credential.createdAt).toLocaleDateString()
    ].filter(Boolean);
    
    return row;
  });
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: includeNotes ? { cellWidth: 50 } : { cellWidth: 30 },
      3: includeNotes ? { cellWidth: 30 } : {}
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Generated with Bold Pass - Store securely',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10
    );
  }
  
  return doc;
};

export const downloadPDF = (
  credentials: Credential[],
  options: PDFOptions
): void => {
  const doc = generatePDF(credentials, options);
  doc.save(`${options.title || 'bold-pass-credentials'}.pdf`);
};
