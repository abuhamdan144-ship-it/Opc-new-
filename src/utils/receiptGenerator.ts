import { jsPDF } from 'jspdf';
import { Donation } from '../types';

/**
 * Generates and downloads a high-contrast, beautiful, formal PDF receipt for welfare fund donations.
 * This is designed with strong dark grays, warm gold tints, and high visibility to solve low-contrast concerns.
 */
export function generateDonationReceipt(donation: Donation) {
  // Create an A4 PDF document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // --- Strict High Contrast Theme Colors ---
  const primaryColor = { r: 11, g: 15, b: 25 }; // Deep Slate / Off-Black
  const accentGold = { r: 194, g: 120, b: 3 };  // Dark Gold for high contrast text & borders
  const statusGreen = { r: 4, g: 108, b: 78 };   // Forest Green
  const bodyText = { r: 17, g: 24, b: 39 };      // Strong gray/black
  const secondaryText = { r: 75, g: 85, b: 99 };  // Standard readable grey

  // --- 1. Draw Outer Structural Borders (Elegant Slate & Gold Pillars) ---
  doc.setDrawColor(accentGold.r, accentGold.g, accentGold.b);
  doc.setLineWidth(1.0);
  doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 3, 3, 'S');

  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 14, pageWidth - 28, pageHeight - 28, 2, 2, 'S');

  // --- 2. Header Block ---
  // Solid Dark Banner
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(14, 14, pageWidth - 28, 12, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('OMAN PAKHTOON COMMUNITY (OPC) • REGISTERED WELFARE COOPERATIVE', pageWidth / 2, 21.5, { align: 'center' });

  // Community Names Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('عمان پختون کمیونٹی', pageWidth / 2, 42, { align: 'center' });

  doc.setFontSize(16);
  doc.text('OMAN PAKHTOON COMMUNITY', pageWidth / 2, 50, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Under patronage of OPC Tribal Elder Board & Labor Support Cabinets', pageWidth / 2, 56, { align: 'center' });
  doc.text('Muscat Central Secretariat, Sultanate of Oman • opc.welfare@gmail.com', pageWidth / 2, 61, { align: 'center' });

  // Gold Horizontal Spacer
  doc.setDrawColor(accentGold.r, accentGold.g, accentGold.b);
  doc.setLineWidth(0.8);
  doc.line(40, 67, pageWidth - 40, 67);

  // --- 3. Receipt Info Grid Panels ---
  const receiptNo = `OPC-TXN-${donation.id.slice(0, 8).toUpperCase()}`;

  // Left Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('OFFICIAL CONTRIBUTION RECEIPT', 22, 85);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Welfare Mutual Aid Fund', 22, 90.5);

  // Right Grid Info Panel box - Solid white base, high contrast dark borders
  doc.setFillColor(250, 250, 250); 
  doc.rect(115, 78, 73, 20, 'F');
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.4);
  doc.rect(115, 78, 73, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('RECEIPT METADATA', 120, 83);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);
  doc.text(`Receipt ID: `, 120, 88);
  doc.setFont('helvetica', 'bold');
  doc.text(receiptNo, 142, 88);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date Filed: `, 120, 93);
  doc.setFont('helvetica', 'bold');
  doc.text(donation.date || new Date().toISOString().split('T')[0], 142, 93);

  // --- 4. Formal Acknowledgement Statement ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);

  const stmt1 = 'This certificate officially acknowledges that a benevolent welfare contribution was received';
  const stmt2 = 'and recorded under the OPC ledger. These funds go toward humanitarian aid & casualty transit.';
  doc.text(stmt1, 22, 108);
  doc.text(stmt2, 22, 113.5);

  // --- 5. Contributor Display Card ---
  doc.setFillColor(244, 244, 245);
  doc.rect(22, 120, pageWidth - 44, 20, 'F');
  doc.setDrawColor(accentGold.r, accentGold.g, accentGold.b);
  doc.setLineWidth(0.6);
  doc.rect(22, 120, pageWidth - 44, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(accentGold.r, accentGold.g, accentGold.b);
  doc.text('CONTRIBUTOR / MEMBER DETAILS', 28, 126);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(donation.donorName.toUpperCase(), 28, 134);

  // --- 6. Table of Contribution breakdown ---
  const tableY = 148;
  
  // Table Header (Solid Black)
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(22, tableY, pageWidth - 44, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('FALAHI CONTRIBUTION SCOPE', 26, tableY + 5.5);
  doc.text('SUM DEPOSITED', pageWidth - 26, tableY + 5.5, { align: 'right' });

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(22, tableY + 8, pageWidth - 44, 26, 'F');
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.4);
  doc.rect(22, tableY + 8, pageWidth - 44, 26, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);
  doc.text('OPC Welfare Emergency Relief Endowment', 26, tableY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Allocated towards: Deceased Meyyat Repatriation flights, accidental support,', 26, tableY + 21);
  doc.text('blood drives at Khoula Hospital, and general emergency labor assistance.', 26, tableY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  const payType = donation.method === 'bank' ? 'Bank Muscat Online Transfer' : 'Oman Mobile Pay Wallet';
  doc.text(`Payment Instrument: Verified via [${payType}]`, 26, tableY + 30);

  // Sum Block (Validated High Contrast)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(statusGreen.r, statusGreen.g, statusGreen.b);
  doc.text(`${Number(donation.amount).toFixed(3)} OMR`, pageWidth - 26, tableY + 16, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Omani Rials (عماني ريال)', pageWidth - 26, tableY + 21, { align: 'right' });

  // --- 7. Validation / Audit Status Section ---
  const summaryY = tableY + 34;
  doc.setFillColor(250, 250, 250);
  doc.rect(22, summaryY, pageWidth - 44, 15, 'F');
  doc.rect(22, summaryY, pageWidth - 44, 15, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);
  doc.text('AUDITED TRUST STATE:', 26, summaryY + 9);

  if (donation.status === 'verified') {
    doc.setFillColor(220, 252, 231); // Clear Green Pill
    doc.roundedRect(68, summaryY + 5, 42, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(statusGreen.r, statusGreen.g, statusGreen.b);
    doc.text('LEDGER AUDITED & ACTIVE', 70, summaryY + 9);
  } else {
    doc.setFillColor(254, 243, 199); // Clear Yellow Pill
    doc.roundedRect(68, summaryY + 5, 42, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // dark amber
    doc.text('PENDING CASH CONFIRMATION', 70, summaryY + 9);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Official funds are verified under bank transaction ID logs.', 115, summaryY + 9);

  // --- 8. Urdu Translation Blessing Message ---
  doc.setDrawColor(accentGold.r, accentGold.g, accentGold.b);
  doc.setLineWidth(0.4);
  doc.line(30, summaryY + 23, pageWidth - 30, summaryY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);
  doc.text('اللہ تبارک وتعالیٰ آپ کے صدقات وقبول فرمائے اور دونوں جہانوں میں جزائے خیر عطا فرمائے۔', pageWidth / 2, summaryY + 30, { align: 'center' });
  doc.text('A contribution receipt issued under the custody of Pakhtoon Cabinet Elders in Oman.', pageWidth / 2, summaryY + 35, { align: 'center' });

  // --- 9. Signatures and Validation Seals ---
  const signY = pageHeight - 55;

  // Left Circular stamp
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.5);
  doc.circle(38, signY + 12, 11, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('OPC CABINET', 38, signY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('RECEIPT STAMP', 38, signY + 13, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(accentGold.r, accentGold.g, accentGold.b);
  doc.text('★ REGISTERED ★', 38, signY + 16.5, { align: 'center' });

  // Center Verification Code
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(80, signY + 8, 130, signY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('Verification Code', 105, signY + 12, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(bodyText.r, bodyText.g, bodyText.b);
  doc.text(donation.transactionId || 'N/A', 105, signY + 16, { align: 'center' });

  // Right Signatures Line
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.5);
  doc.line(140, signY + 8, 185, signY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('FINANCE OFFICE CHAIR', 162.5, signY + 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('OPC Cabinets Treasury Control', 162.5, signY + 16, { align: 'center' });

  // Faux elegant script signature
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('Ch. Shah Jehan', 148, signY + 5.5);

  // Final Bottom Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryText.r, secondaryText.g, secondaryText.b);
  doc.text('This receipt was automatically compiled and stored securely in Firestore ledger registers.', pageWidth / 2, pageHeight - 14, { align: 'center' });

  // Save/Download PDF
  doc.save(`OPC-RECEIPT-${donation.id.slice(0, 8).toUpperCase()}.pdf`);
}
