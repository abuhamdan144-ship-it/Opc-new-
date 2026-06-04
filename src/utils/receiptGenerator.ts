import { jsPDF } from 'jspdf';
import { Donation } from '../types';

/**
 * Generates and downloads a beautiful, official PDF receipt for a community donation.
 * Designed to look modern, trustworthy, and high-quality utilizing a grid layouts and fine lines.
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

  // --- Theme Colors ---
  // Primary (Deep Navy / Slate 950 vibe)
  const primaryColor = { r: 15, g: 23, b: 42 }; 
  // Accent Accent (Gold / Yellow 450 vibe for premium feel)
  const accentColor = { r: 234, g: 179, b: 8 }; 
  // Emerald Green Accent for "Audited" status
  const emeraldColor = { r: 4, g: 120, b: 87 };
  // Text Colors
  const darkText = { r: 33, g: 37, b: 41 };
  const greyText = { r: 100, g: 110, b: 120 };

  // --- 1. Draw Elegant Outer Border with Rounded Corners ---
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(1.2);
  // Rounded rectangle outer border spanning margins
  doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 4, 4, 'S');

  // Subtle interior thin line
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 2, 2, 'S');

  // --- 2. Elegant Header with Golden/Slate Accents ---
  // Top Banner Pill
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(15, 15, pageWidth - 30, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('OMAN PAKHTOON COMMUNITY (OPC) • OFFICIAL WELFARE REGISTRY REPORT', pageWidth / 2, 21.5, { align: 'center' });

  // Main Community Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('عمان پختون کمیونٹی', pageWidth / 2, 42, { align: 'center' });

  doc.setFontSize(18);
  doc.text('OMAN PAKHTOON COMMUNITY', pageWidth / 2, 51, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Under direct patronage of community elders & registered welfare board', pageWidth / 2, 57, { align: 'center' });
  doc.text('Muscat, Sultanate of Oman • Email: opc.welfare@gmail.com', pageWidth / 2, 62, { align: 'center' });

  // Neat Gold Accent Divider
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.8);
  doc.line(40, 68, pageWidth - 40, 68);

  // --- 3. Receipt Info Box (Right) & Subject Banner (Left) ---
  const receiptNo = `OPC-REC-${donation.id.slice(0, 8).toUpperCase()}`;
  
  // Left: Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('OFFICIAL CONTRIBUTION RECEIPT', 22, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Welfare Trust & Emergency Casualty Fund', 22, 90.5);

  // Right Grid Info Panel
  doc.setFillColor(248, 250, 252); // Very light slate backdrop
  doc.rect(115, 78, 73, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(115, 78, 73, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('RECEIPT DETAILS', 120, 83);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text(`Receipt No: `, 120, 88);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  doc.text(receiptNo, 140, 88);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text(`Date Issued: `, 120, 93);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  doc.text(donation.date || new Date().toISOString().split('T')[0], 140, 93);

  // --- 4. Formal Certification Acknowledgement ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  
  // Custom multi-line text mapping
  const certText1 = 'This document solemnly certifies and verifies that a financial contribution has been graciously';
  const certText2 = 'received and deposited into the OPC Welfare Mutual Aid ledger by the esteemed community donor named below:';
  doc.text(certText1, 22, 110);
  doc.text(certText2, 22, 115.5);

  // --- 5. Donor Main Display Card ---
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(22, 122, pageWidth - 44, 18, 'F');
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.5);
  // Left border highlight
  doc.line(22, 122, 22, 140);
  doc.line(pageWidth - 22, 122, pageWidth - 22, 140);
  doc.line(22, 122, pageWidth - 22, 122);
  doc.line(22, 140, pageWidth - 22, 140);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('DONOR / REGISTERED MEMBER NAME', 28, 128);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(donation.donorName.toUpperCase(), 28, 135);

  // --- 6. Table of Contribution Details ---
  const tableY = 149;
  
  // Table Header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(22, tableY, pageWidth - 44, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION OF CONTRIBUTION & WELFARE SCOPE', 26, tableY + 5.5);
  doc.text('TOTAL DEPOSIT', pageWidth - 26, tableY + 5.5, { align: 'right' });

  // Table Row 1: Amount & Description
  doc.setFillColor(255, 255, 255);
  doc.rect(22, tableY + 8, pageWidth - 44, 28, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.rect(22, tableY + 8, pageWidth - 44, 28, 'S');

  // Row details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  doc.text('OPC Welfare Association Fund Contribution', 26, tableY + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Direct allocation towards: emergency Meyyat Body transit backings,', 26, tableY + 21);
  doc.text('Omani medical triage backings, labor permission relief, and rescue activities.', 26, tableY + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(`Payment Instrument: via ${donation.method === 'bank' ? 'Bank Muscat Transfers' : 'OML Mobile Pay Portal'}`, 26, tableY + 31);

  // Right Side amount block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(emeraldColor.r, emeraldColor.g, emeraldColor.b);
  doc.text(`${Number(donation.amount).toFixed(3)} OMR`, pageWidth - 26, tableY + 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Omani Rials (عماني ريال)', pageWidth - 26, tableY + 21, { align: 'right' });

  // Sum Summary Card Below Table
  const summaryY = tableY + 36;
  doc.setFillColor(248, 250, 252);
  doc.rect(22, summaryY, pageWidth - 44, 16, 'F');
  doc.rect(22, summaryY, pageWidth - 44, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  doc.text('AUDIT STATUS:', 26, summaryY + 10);

  // Audit Status Pills
  if (donation.status === 'verified') {
    doc.setFillColor(209, 250, 229); // light green
    doc.roundedRect(52, summaryY + 6, 42, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(emeraldColor.r, emeraldColor.g, emeraldColor.b);
    doc.text('FULLY AUDITED & APPROVED', 54, summaryY + 10.5);
  } else {
    doc.setFillColor(254, 243, 199); // light yellow
    doc.roundedRect(52, summaryY + 6, 42, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text('PENDING VERIFICATION', 54, summaryY + 10.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Contributions are double-authenticated by the Finance Council Treasury Board.', 105, summaryY + 10);

  // --- 7. Urdu Slogans & Beautiful Quote ---
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.4);
  doc.line(30, summaryY + 25, pageWidth - 30, summaryY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  // Elegant translation note
  doc.text('"Every contribution acts as a beacon of solidarity and hope for the Pakhtoon workforce inside Oman."', pageWidth / 2, summaryY + 31, { align: 'center' });
  doc.text('اللہ تبارک وتعالیٰ اپ کے صدقات وعطیات قبول فرمائے اور دونوں جہانوں میں جزائے خیر عطا فرمائے۔', pageWidth / 2, summaryY + 36.5, { align: 'center' });

  // --- 8. Bottom Validation Seal & Signature Board ---
  const signY = pageHeight - 56;
  
  // Left Stamp Placeholder
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.circle(38, signY + 12, 12, 'S');
  
  // Custom inside-circle text for beautiful verification seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('OPC TRUSTED', 38, signY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('FINANCE SEAL', 38, signY + 13, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
  doc.text('★ VALID ★', 38, signY + 16.5, { align: 'center' });

  // Center Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(80, signY + 10, 130, signY + 10);

  // Right Signatures
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.4);
  doc.line(140, signY + 10, 185, signY + 10); // Treasury line

  // Signature Subtitles
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Audit Timestamp Label', 105, signY + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(darkText.r, darkText.g, darkText.b);
  doc.text(new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC', 105, signY + 18.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('FINANCE SECRETARY SEC', 162.5, signY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('Oman Pakhtoon Cabinet Treasury', 162.5, signY + 18.5, { align: 'center' });

  // Faux elegant script signatures on top of lines
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Ch. H. Shah', 160, signY + 6.5);

  // --- Footer Warning Note ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(greyText.r, greyText.g, greyText.b);
  doc.text('This is an automatic ledger authenticated report distributed securely to registered members. For verification enquiries, contact direct helpdesk services.', pageWidth / 2, pageHeight - 16, { align: 'center' });

  // Trigger browser download dialog
  doc.save(`OPC-RECEIPT-${donation.id.slice(0, 8).toUpperCase()}.pdf`);
}
