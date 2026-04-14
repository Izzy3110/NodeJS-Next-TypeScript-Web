import PDFDocument from '@react-pdf/pdfkit';
import fs from 'fs';
import path from 'path';
import { translations, Language } from '@/data/translations';

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
    .replace(/<sup>.*?<\/sup>/g, '');
}

export async function createInvoice(data: any) {
  return new Promise<{ filePath: string; fileName: string; fileSize: number }>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, autoFirstPage: false });

      // @react-pdf/pdfkit supports the 14 standard PDF fonts built-in by name
      // No file registration needed — works on Windows & Linux without bundling
      doc.addPage();

      const lang: Language = (data.lang as Language) || 'de';
      const t = (key: string) => (translations[lang] as any)[key] || key;

      const itemIds = data.items.map((it: any) => it.id).join(',');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `invoice-${itemIds}-${dateStr}.pdf`;
      const generatedDir = path.join(process.cwd(), 'pdf', 'generated');
      
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }
      
      const filePath = path.join(generatedDir, fileName);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // 1. Date (Top Right)
      doc.fontSize(10).font('Helvetica-Bold').text(t('invoice_order_date'), 110, 25, { align: 'right' });
      doc.font('Helvetica').text(new Date().toLocaleString(), 110, 37, { align: 'right' });

      // 2. Header Logo (Top Left)
      const logoPath = path.join(process.cwd(), 'takeoff_logo_transparent', 'takeoff_logo_transparent.png');
      doc.image(logoPath, 50, 25, { height: 70 });

      // 3. INVOICE Label (Left, below logo)
      const logoHeight = 70;
      const invoiceLabelTop = 25 + logoHeight + 10;
      doc.fontSize(20).font('Helvetica-Bold').text(t('invoice_title'), 50, invoiceLabelTop);

      // 4. Addresses Area
      const infoTop = invoiceLabelTop + 65;
      
      // Sender (Left)
      doc.fontSize(10).font('Helvetica-Bold').text('TakeOff Restaurant', 50, infoTop);
      doc.font('Helvetica');
      doc.text('Gurvinder Kaur Ghotra', 50, infoTop + 22);
      doc.text('Aftholderberger Str. 5', 50, infoTop + 38);
      doc.text('88630 Pfullendorf', 50, infoTop + 60);

      // Receiver (Right)
      const receiverLeft = 350;
      const client = data.summary.client;
      const clientAddr = client.address;
      doc.fontSize(10).font('Helvetica-Bold').text(client.name, receiverLeft, infoTop);
      doc.font('Helvetica');
      doc.text(clientAddr.client_address_line_1, receiverLeft, infoTop + 22);
      if (clientAddr.client_address_line_2) {
        doc.text(clientAddr.client_address_line_2, receiverLeft, infoTop + 38);
      }
      doc.text(`${clientAddr.client_address_plz} ${clientAddr.client_address_city}`, receiverLeft, infoTop + 60);

      const contactTop = infoTop + 80;
      doc.text(`${t('invoice_tel')} +49 7552 4000088`, 50, contactTop);
      doc.text(`${t('invoice_tel')} ${client.tel[0]}`, receiverLeft, contactTop);
      doc.text(`${t('invoice_email')} ${client.email}`, receiverLeft, contactTop + 18);

      // 5. Table Area
      const tableTop = infoTop + 150;
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

      doc.moveTo(50, currentY).lineTo(562, currentY).stroke();
      currentY += 15;

      const summary = data.summary;
      const labelX = 250;
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

      currentY += 45;
      const boxWidth = 512;
      const boxHeight = 50;
      doc.rect(50, currentY, boxWidth, boxHeight).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text(t('invoice_client_comments'), 60, currentY + 10);
      doc.font('Helvetica').text('Not too hot, please!', 60, currentY + 25);

      const bottomY = 720;
      doc.fontSize(10).font('Helvetica-Bold').text(`${t('invoice_copy_to')} ${client.email}`, 50, bottomY);

      doc.end();

      stream.on('finish', () => {
        const stats = fs.statSync(filePath);
        resolve({
          filePath: filePath,
          fileName: fileName,
          fileSize: stats.size
        });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
