import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (bookingData) => {
    try {
        // 1. Data Validation
        if (!bookingData || !bookingData.id) {
            alert('Abe, walang data na makita para sa invoice!');
            console.error("Missing bookingData:", bookingData);
            return;
        }

        console.log("Generating Robust Invoice for:", bookingData);
        const doc = new jsPDF();
        
        // 2. Header Layout
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("ABE EVENTS - SMART ESCROW", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // Gray-400
        doc.text("GAWANG KAPAMPANGAN • SECURED BY SMART ESCROW™", 14, 26);
        
        // Line Separator
        doc.setDrawColor(229, 231, 235);
        doc.line(14, 32, 196, 32);

        // 3. Main Transaction Table
        autoTable(doc, {
            startY: 40,
            head: [['Field', 'Details']],
            body: [
                ['Booking ID', `#${bookingData.id.toUpperCase()}`],
                ['Client Name', bookingData.clientName || 'Jennie Rose'],
                ['Vendor Name', bookingData.vendorName || 'Reggie Photography'],
                ['Event Date', bookingData.date || 'Dec 25, 2025'],
                ['Package', bookingData.package || 'Elite Experience'],
                ['Total Price', `PHP ${(bookingData.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
        });

        // 4. Payment Breakdown Table
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text("Payment Breakdown", 14, finalY);

        const amount = bookingData.price || 0;
        const mobFund = amount * 0.20;
        const finalPayout = amount * 0.80;

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Milestone', 'Allocation', 'Amount Status']],
            body: [
                ['Mobilization Fund (20%)', `PHP ${mobFund.toLocaleString()}`, 'RELEASED ✅'],
                ['Final Payout (80%)', `PHP ${finalPayout.toLocaleString()}`, 'RELEASED ✅'],
                ['Platform Service Fee', '2%', 'PAID'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55] },
        });

        // 5. Branding & Footer
        const finalY2 = doc.lastAutoTable.finalY + 20;
        
        // Status Stamp
        doc.setFillColor(240, 253, 244); // Light Green
        doc.rect(14, finalY2, 182, 12, 'F');
        doc.setTextColor(22, 163, 74); // Green-600
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PAYMENT VERIFIED! CHING! 💰", 105, finalY2 + 8, { align: 'center' });

        // Footer Note
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.setFont("helvetica", "italic");
        doc.text("This document serves as an official proof of escrow release.", 105, 275, { align: 'center' });
        doc.text("ABE Events © 2025 • Gawang Kapampangan 💰", 105, 282, { align: 'center' });

        // 6. The Trigger Command
        console.log("Forcing Download...");
        doc.save(`ABE-Receipt-${bookingData.id.toUpperCase()}.pdf`);
        
    } catch (error) {
        console.error("PDF Emergency Error:", error);
        alert("Abe, may error sa pag-generate ng PDF! I-check ang console.");
    }
};
