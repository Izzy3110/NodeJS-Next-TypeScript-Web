import { jsPDF } from 'jspdf';
import autoTable, { FontStyle } from 'jspdf-autotable';
import type { InvoiceData } from '@/types';

function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  
  // 1. Convert <br> and <br/> to newlines
  let processed = text.replace(/<br\s*\/?>/gi, '\n');
  
  // 2. Decode common HTML entities
  const entities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&euro;': '€',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&ouml;': 'ö',
    '&Ouml;': 'Ö',
    '&auml;': 'ä',
    '&Auml;': 'Ä',
    '&szlig;': 'ß'
  };
  
  processed = processed.replace(/&[a-z0-9#]+;/gi, (match) => {
    // Check if it's one of our mapped entities
    if (entities[match.toLowerCase()]) return entities[match.toLowerCase()];
    
    // Check for numeric entities like &#123;
    const numericMatch = match.match(/^&#(\d+);$/);
    if (numericMatch) return String.fromCharCode(parseInt(numericMatch[1], 10));
    
    return match;
  });

  return processed;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [41, 128, 185]; // A nice blue
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Deep grey-blue
  const lightGrey: [number, number, number] = [245, 245, 245];

  // Header - Branding area
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - 20, 20, { align: 'right' });
  doc.text(`Date: ${data.date.toLocaleDateString()}`, pageWidth - 20, 28, { align: 'right' });

  // Customer Section
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text([
    data.customer.name,
    data.customer.street,
    `${data.customer.zipCode} ${data.customer.city}`,
    data.customer.country || ''
  ], 20, 62);

  // Items Table
  const tableRows = data.items.map(item => [
    { 
      content: decodeHTMLEntities(item.description) + (item.details ? `\n\n${decodeHTMLEntities(item.details)}` : ''), 
      styles: { fontStyle: 'normal' as FontStyle } 
    },
    item.quantity.toString(),
    `${item.unitPrice.toFixed(2)} ${data.currency}`,
    `${item.totalPrice.toFixed(2)} ${data.currency}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Item & Details', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: lightGrey
    },
    styles: {
      fontSize: 9,
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  // Totals Section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  // Delivery Costs
  doc.text('Delivery Costs:', pageWidth - 100, finalY);
  doc.text(`${data.deliveryCosts.toFixed(2)} ${data.currency}`, pageWidth - 20, finalY, { align: 'right' });
  
  // Total Amount
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const totalY = finalY + 10;
  doc.text('Total Amount:', pageWidth - 100, totalY);
  doc.text(`${data.totalAmount.toFixed(2)} ${data.currency}`, pageWidth - 20, totalY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc;
}
