import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { translations, Language } from '../src/data/translations';

async function generatePDF() {
  const chunks: Buffer[] = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  
  process.stdin.on('end', () => {
    let input = Buffer.concat(chunks).toString().trim();
    try {
      // Find the first '{' to skip dotenv info messages or other noise
      const jsonStart = input.indexOf('{');
      if (jsonStart !== -1) {
        input = input.substring(jsonStart);
      }
      const data = JSON.parse(input);
      createInvoice(data);
    } catch (err) {
      console.error('Failed to parse JSON input:', err);
      console.error('Full input was:', input);
      process.exit(1);
    }
  });
}

function decodeEntities(text: string) {
  if (!text) return text;
  return text
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&auml;/g, 'ä')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&szlig;/g, 'ß')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<sup>.*?<\/sup>/g, ''); // Remove superscript tags as PDFKit doesn't render HTML
}

function createInvoice(data: any) {
  const doc = new PDFDocument({ margin: 50 });
  const lang: Language = (data.lang as Language) || 'de'; // Default to German
  const t = (key: string) => (translations[lang] as any)[key] || key;

  // Dynamic Filename
  const itemIds = data.items.map((it: any) => it.id).join(',');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `invoice-${itemIds}-${dateStr}.pdf`;
  const filePath = path.join(process.cwd(), 'pdf', 'generated', fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // 1. Date (Top Right)
  doc.fontSize(10).font('Helvetica-Bold').text(t('invoice_order_date'), 110, 25, { align: 'right' });
  doc.font('Helvetica').text(new Date().toLocaleString(), 110, 37, { align: 'right' });

  // 2. Header Logo (Top Left)
  doc.save();
  doc.translate(50, 25);
  doc.scale(6); 
  doc.path('M1.946 9.315c-.522.174-.527.455.01.634l2.89.963 1.152 2.305c.179.359.458.359.638 0l.963-1.926 2.305-1.152c.359-.179.359-.458 0-.638l-7.958-3.186zm6.756 1.152l-2.305 1.152-.963 1.926c-.179.359-.458.359-.638 0l-1.152-2.305-2.89-.963c-.537-.179-.532-.46.01-.634l7.958-3.186c.359-.179.458-.179.638 0l-3.186 7.958c-.174.537-.455.532-.634-.01l-.963-2.89-2.305-1.152z')
     .fill('#0056b3'); 
  doc.restore();

  // 3. INVOICE Label (Left, below logo)
  const logoHeight = 70; // (scale 6 * path height 11)
  const invoiceLabelTop = 25; // 20 units spacing to logo
  doc.fontSize(20).font('Helvetica-Bold').text(t('invoice_title'), 50, invoiceLabelTop);

  // 4. Addresses Area
  const infoTop = invoiceLabelTop + 120; // 40 units spacing to INVOICE label
  
  // Sender (Left)
  doc.fontSize(10).font('Helvetica-Bold').text('TakeOff Restaurant', 50, infoTop);
  doc.font('Helvetica');
  doc.text('Gurvinder Kaur Ghotra', 50, infoTop + 22); // Increased gap from 16
  doc.text('Aftholderberger Str. 5', 50, infoTop + 38);
  // PLZ line always at the same level as receiver PLZ (+60) - increased gap to 22
  doc.text('88630 Pfullendorf', 50, infoTop + 60);

  // Receiver (Right)
  const receiverLeft = 350;
  const client = data.summary.client;
  const clientAddr = client.address;
  doc.fontSize(10).font('Helvetica-Bold').text(client.name, receiverLeft, infoTop);
  doc.font('Helvetica');
  doc.text(clientAddr.client_address_line_1, receiverLeft, infoTop + 22); // Increased gap from 16
  if (clientAddr.client_address_line_2) {
    doc.text(clientAddr.client_address_line_2, receiverLeft, infoTop + 38);
  }
  // PLZ line always at the same level as sender PLZ (+60)
  doc.text(`${clientAddr.client_address_plz} ${clientAddr.client_address_city}`, receiverLeft, infoTop + 60);

  // Spaced lines - fixed to infoTop + 80 to ensure grid alignment across columns
  const contactTop = infoTop + 80;
  doc.text(`${t('invoice_tel')} +49 7552 4000088`, 50, contactTop); // Aligned with receiver Tel
  doc.text(`${t('invoice_tel')} ${client.tel[0]}`, receiverLeft, contactTop);
  doc.text(`${t('invoice_email')} ${client.email}`, receiverLeft, contactTop + 18); // Email last row

  // 5. Table Area
  const tableTop = infoTop + 150; // Shifted down further to accommodate taller address block
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text(t('invoice_col_count'), 50, tableTop);
  doc.text(t('invoice_col_name'), 100, tableTop);
  doc.text(t('invoice_col_category'), 270, tableTop);
  doc.text(t('invoice_col_price'), 452, tableTop, { width: 110, align: 'right' });
  
  doc.moveTo(50, tableTop + 15).lineTo(562, tableTop + 15).stroke();
  doc.font('Helvetica');

  // Items
  let currentY = tableTop + 25;
  data.items.forEach((item: any) => {
    doc.text(item.count.toString(), 50, currentY);
    doc.text(decodeEntities(item.name), 100, currentY, { width: 170 });
    doc.text(decodeEntities(item.category || ''), 270, currentY);
    doc.text(`${item.affected_price} €`, 452, currentY, { width: 110, align: 'right' });
    currentY += 20;
  });

  // Summary section
  doc.moveTo(50, currentY).lineTo(562, currentY).stroke();
  currentY += 15;

  const summary = data.summary;
  const labelX = 250; // Widened label area for longer German strings
  const valueX = 452;
  const valueWidth = 110;

  currentY += 15;

  doc.text(t('invoice_subtotal'), labelX, currentY);
  doc.text(`${summary.sum_elements.toFixed(2)} €`, valueX, currentY, { width: valueWidth, align: 'right' });
  currentY += 15;

  doc.text(`${t('invoice_tax_food')} (${(summary.tax_food_percentage * 100).toFixed(0)}%):`, labelX, currentY);
  doc.text(`${summary.tax_food_applied_value.toFixed(2)} €`, valueX, currentY, { width: valueWidth, align: 'right' });
  currentY += 15;

  doc.text(`${t('invoice_tax_drinks')} (${(summary.tax_drinks_percentage * 100).toFixed(0)}%):`, labelX, currentY);
  doc.text(`${summary.tax_drinks_applied_value.toFixed(2)} €`, valueX, currentY, { width: valueWidth, align: 'right' });
  currentY += 15;

  doc.text(t('invoice_delivery_costs'), labelX, currentY);
  doc.text(`${summary.delivery_costs.toFixed(2)} €`, valueX, currentY, { width: valueWidth, align: 'right' });
  currentY += 15;

  doc.font('Helvetica-Bold').fontSize(12);
  doc.text(t('invoice_total'), labelX, currentY);
  doc.text(`${summary.total.toFixed(2)} €`, valueX, currentY, { width: valueWidth, align: 'right' });

  // 6. Client Comments (Rectangle below total, fullwidth)
  currentY += 45; // Adjusted from 60 to save space
  const boxWidth = 512; // Full width (50 to 562)
  const boxHeight = 50;
  doc.rect(50, currentY, boxWidth, boxHeight).stroke();
  doc.fontSize(10).font('Helvetica-Bold').text(t('invoice_client_comments'), 60, currentY + 10);
  doc.font('Helvetica').text('Not too hot, please!', 60, currentY + 25);

  // 7. Footer (Bottom Left, ensure Page 1)
  const bottomY = 720; // Moved up from 760 to ensure it stays on Page 1
  doc.fontSize(10).font('Helvetica-Bold').text(`${t('invoice_copy_to')} ${client.email}`, 50, bottomY);

  doc.end();
  console.log(`PDF generated: ${filePath}`);
}

generatePDF();
