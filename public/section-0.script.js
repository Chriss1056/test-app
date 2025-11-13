
	  const img = new Image();
	  img.src = "logo.png";
	  
    // -------- Numeric helpers (comma or dot; no reformat while typing) --------
    function parseLocaleNumber(s){
      if (s == null) return 0;
      s = String(s).trim();
      if (!s) return 0;
      // keep digits, comma, dot, minus
      s = s.replace(/[^0-9,.\-]/g,'');
      // if both , and . exist, prefer last as decimal; remove others
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastComma !== -1 && lastDot !== -1){
        if (lastComma > lastDot){
          s = s.replace(/\./g,'').replace(',', '.'); // comma decimal
        } else {
          s = s.replace(/,/g,''); // dot decimal
        }
      } else {
        s = s.replace(',', '.');
      }
      const x = parseFloat(s);
      return isNaN(x) ? 0 : x;
    }















    // -------- PDF --------
    function downloadPDF(){
      computeTotals();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({unit:'pt', format:'a4'});
		
		const width = doc.internal.pageSize.getWidth();
		const height = doc.internal.pageSize.getHeight();
		
		let imgWidth = img.width;
		let imgHeight = img.height;
		if (imgWidth > 170) {
			const scale = 170 / imgWidth;
			imgWidth = 170;
			imgHeight *= scale;
		}

      // Header
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(230,0,0);
      const bestell = document.getElementById('bestellNummer').value || '';
      doc.text(`Rechnung zur Bestellung ${bestell}`, 40, 50);
		doc.addImage(img, "PNG", width - imgWidth - 50, 50 - imgHeight / 2, imgWidth, imgHeight);
      doc.setTextColor(0,0,0); doc.setFontSize(10); doc.setFont('helvetica','normal');

      const rnr = document.getElementById('rechnungsNummer').value || '';
      const rdat = document.getElementById('rechnungsDatum').value || '';
      const ldat = document.getElementById('lieferDatum').value || '';
	  const zahlungsart = document.getElementById('zahlungsart').value || '';
      const knr  = document.getElementById('kundenNummer').value || '';
      const ref  = document.getElementById('referenz').value || '';
      const asp  = document.getElementById('ansprechpartner').value || '';
      const eml  = document.getElementById('email').value || '';

      const kName = document.getElementById('kundeName').value || '';
      const kAdr  = (document.getElementById('kundeAdresse').value || '').split('\n');
      const kUID  = document.getElementById('kundeUID').value || '';
      const fName = document.getElementById('firma').value || '';
      const fAdr  = (document.getElementById('firmaAdresse').value || '').split('\n');
      const fUID  = document.getElementById('firmaUID').value || '';

	  let y = 84;
	  const GAP_S = 10, GAP_M = 18, GAP_L = 28;
      doc.setFont('helvetica','bold'); doc.text('Rechnungsdaten', 40, y); doc.setFont('helvetica','normal');
      y+=16; doc.text(`RECHNUNGS-NR.: ${rnr}`, 40, y); y+=14; doc.text(`RECHNUNGSDATUM: ${rdat}`, 40, y); y+=14; doc.text(`LIEFERDATUM: ${ldat}`, 40, y);
		y+=14; doc.text(`ZAHLUNGSART: ${zahlungsart}`, 40, y);
      let ry = 84; if (knr != '') { doc.text(`IHRE KUNDENNUMMER: ${knr}`, 340, ry); } ry+=16; if (ref != '') { doc.text(`REFERENZ: ${ref}`, 340, ry); } ry+=14; doc.text(`IHR ANSPRECHPARTNER: ${asp}`, 340, ry); ry+=14; doc.text(`E-MAIL: ${eml}`, 340, ry);

      y += 28; doc.setFont('helvetica','bold'); doc.text('Rechnung an', 40, y); doc.text('Von', 340, y); doc.setFont('helvetica','normal'); y += 16;
      let yLeft = y; doc.text(kName, 40, yLeft); yLeft += 14; kAdr.forEach(line=>{ if(line.trim()) { doc.text(line, 40, yLeft); yLeft+=14; } }); if (kUID){ doc.text(`UID: ${kUID}`, 40, yLeft); yLeft+=14; }
      let yRight = y; doc.text(fName, 340, yRight); yRight += 14; fAdr.forEach(line=>{ if(line.trim()) { doc.text(line, 340, yRight); yRight+=14; } }); if (fUID){ doc.text(`UID: ${fUID}`, 340, yRight); yRight+=14; }

      const body = [];
      document.querySelectorAll('#itemRows tr').forEach(tr=>{
        const desc = tr.querySelector('.desc').value || '';
        const qty  = parseLocaleNumber(tr.querySelector('.qty').value);
        const net  = parseLocaleNumber(tr.querySelector('.net').value);
        const tax  = parseLocaleNumber(tr.querySelector('.tax').value);
        const disc = parseLocaleNumber(tr.querySelector('.disc').value);
        const gro  = parseLocaleNumber(tr.querySelector('.gross').value);
        const lin  = parseLocaleNumber(tr.querySelector('.line').value);
        body.push([
          desc,
          qty.toFixed(2).replace('.',','),
          net.toFixed(2).replace('.',',') + ' €',
          tax.toFixed(2).replace('.',',') + ' %',
          gro.toFixed(2).replace('.',',') + ' €',
          disc.toFixed(2).replace('.',',') + ' %',
          lin.toFixed(2).replace('.',',') + ' €'
        ]);
      });

      doc.autoTable({
        startY: Math.max(yLeft, yRight) + 16,
        head: [['Beschreibung','Menge','Netto','Steuer','Brutto','Rabatt','Gesamtpreis']],
        body,
        styles:{ font:'helvetica', fontSize:9, cellPadding:4 },
        headStyles:{ fillColor:[245,245,245], textColor:[0,0,0] },
        columnStyles:{ 1:{halign:'right'}, 2:{halign:'right'}, 3:{halign:'right'}, 4:{halign:'right'}, 5:{halign:'right'}, 6:{halign:'right'} }
      });

// ---- Summenblock ----
const finY = doc.lastAutoTable.finalY + 30; // mehr Abstand nach der Tabelle
const boxW = 240;
const boxH = 85;
const boxX = doc.internal.pageSize.getWidth() - boxW - 40; // rechts ausrichten
const boxY = finY;

// Box Hintergrund (hellgrau)
doc.setFillColor(245, 245, 245);
doc.roundedRect(boxX, boxY, boxW, boxH, 6, 6, 'F');

// Summenwerte holen
const sumNet   = document.getElementById('sumNet').textContent;
const sumVAT20 = document.getElementById('sumVAT20').textContent;
const sumVAT0  = document.getElementById('sumVAT0').textContent;
const sumGross = document.getElementById('sumGross').textContent;

// Summenblock beschriften
let ty = boxY + 20;
doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
doc.text('Gesamtbetrag netto', boxX + 10, ty);
doc.text(`${sumNet} €`, boxX + boxW - 10, ty, {align:'right'}); 
ty += 16;

doc.text('zzgl. Umsatzsteuer 20%', boxX + 10, ty);
doc.text(`${sumVAT20} €`, boxX + boxW - 10, ty, {align:'right'}); 
ty += 16;

doc.text('zzgl. Umsatzsteuer 0%', boxX + 10, ty);
doc.text(`${sumVAT0} €`, boxX + boxW - 10, ty, {align:'right'}); 
ty += 20;

// Brutto fett + rot hervorheben
doc.setFont('helvetica', 'bold'); 
doc.setFontSize(12);
doc.setTextColor(0, 0, 0);
doc.text('Gesamtbetrag brutto', boxX + 10, ty);
doc.text(`${sumGross} €`, boxX + boxW - 10, ty, {align:'right'});
doc.setTextColor(0, 0, 0); // zurücksetzen

      // Reverse Charge hint
      const vat20Num = parseFloat((sumVAT20||'0').replace(/\./g,'').replace(',','.'))||0;
      const vat0Num  = parseFloat((sumVAT0 ||'0').replace(/\./g,'').replace(',','.'))||0;
      const taxZero  = Math.abs(vat20Num + vat0Num) < 1e-9;
      const hasCustomerUID = (document.getElementById('kundeUID').value||'').trim().length>0;
      if (hasCustomerUID && taxZero){
        doc.setFont('helvetica','normal'); doc.setTextColor(100);
        doc.text('Reverse Charge – Steuerschuld geht auf den Leistungsempfänger über (Art. 196 MwStSystRL).', 40, ty);
        doc.setTextColor(0);
      }

      // Notes
      const note = (document.getElementById('hinweis').value || '').trim();
      if (note){
        doc.setFont('helvetica','bold'); doc.text('Hinweis', 40, ty + 26);
        doc.setFont('helvetica','normal');
        doc.text(doc.splitTextToSize(note, 480), 40, ty + 42);
      }

      // Footer
      const footerY = 770;
      doc.setDrawColor(220); doc.line(40, footerY-18, 555, footerY-18);
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(90);
      doc.text('PUMPSHOT GmbH · pumpshotenergy.com · Sallet 6 · 4762 St. Willibald · Österreich', 40, footerY);
      doc.text('Tel: 06503903663 · E-Mail: office@pumpshot.at · Web: www.pumpshotenergy.com', 40, footerY+12);
      doc.text('Amtsgericht: Landesgericht Ried · FN-Nr.: FN658945M · USt-ID: ATU82402026 · St-Nr.: 41356/4923', 40, footerY+24);
      doc.text('Bank: Raiffeisenbank · IBAN: AT123445500005032271 · BIC: RZOOAT2L455', 40, footerY+36);
      doc.setTextColor(0);

      const file = `Rechnung_${(document.getElementById('rechnungsNummer').value || 'RE')}.pdf`;
      doc.save(file);
    }