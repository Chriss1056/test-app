import { useEffect } from "react";

import "./section-0.styles.css";

export default function Index() {
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    const loadScriptsSequentially = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");
        await loadScript("/section-0.script.js");
      } catch (err) {
        console.error("Failed to load scripts:", err);
      }
    };
    loadScriptsSequentially();

    return () => {
      document
        .querySelectorAll<HTMLScriptElement>(
          'script[src*="jspdf"], script[src*="autotable"], script[src="/section-0.script.js"]'
        )
        .forEach((s) => s.remove());
    };
  }, []);
  
  return (<>
  <h2>Rechnung zur Bestellung</h2>

  <div className="card grid cols-2">
    <div>
      <label>Bestell-Nr.</label>
      <input id="bestellNummer"/>
      <label>Rechnungs-Nr.</label>
      <input id="rechnungsNummer"/>
      <label>Rechnungsdatum</label>
      <input type="date" id="rechnungsDatum" />
      <label>Lieferdatum</label>
      <input type="date" id="lieferDatum" />
    </div>
    <div>
      <label>Ihre Kundennummer</label>
      <input id="kundenNummer"/>
      <label>Referenz</label>
      <input id="referenz"/>
      <label>Ansprechpartner</label>
      <input id="ansprechpartner" defaultValue="Fabian Flotzinger" />
      <label>E-Mail</label>
      <input id="email" defaultValue="office@pumpshot.at" />
    </div>
  </div>
	

		<div className="card">
			<h3>Zahlungsart</h3>
			<label>Zahlungsart</label>
			<select id="zahlungsart">
  				<option value="Onlinezahlung">Onlinezahlung (bereits beglichen)</option>
  				<option value="Bar">Barzahlung</option>
  				<option value="SumUp">Kartenzahlung (SumUp)</option>
  				<option value="Überweisung">Überweisung</option>
  				<option value="Offen">Offen (noch zu zahlen)</option>
			</select>
		</div>

  <div className="grid cols-2" style={{ marginTop: "16px" }}>
    <div className="card">
      <h3 className="muted">Rechnungsadresse</h3>
      <label>Name / Firma</label>
      <input id="kundeName" placeholder="Name oder Firma" />
      <label>Adresse</label>
      <textarea style={{ resize: "none" }} id="kundeAdresse" rows="3" placeholder="Straße Hausnr., PLZ Ort, Land"></textarea>
      <label>UID (Kunde, optional)</label>
      <input id="kundeUID" placeholder="z. B. DE123456789" />
    </div>
    <div className="card">
      <h3 className="muted">PUMPSHOT Absender</h3>
      <label>Firma</label>
      <input id="firma" defaultValue="PUMPSHOT GmbH" />
      <label>Adresse</label>
      <textarea style={{ resize: "none" }} id="firmaAdresse" rows="3" defaultValue={"Sallet 6\n4762 Sankt Willibald\nÖsterreich"}></textarea>
      <label>UID (Firma, optional)</label>
      <input id="firmaUID" defaultValue="ATU82402026" />
    </div>
  </div>

  <div className="card" style={{ marginTop: "16px" }}>
    <div className="toolbar">
      <button type="button" id="addRowBtn">+ Position hinzufügen</button>
      <button type="button" className="ghost" id="addPfandBtn">+ Pfand</button>
      <button type="button" className="ghost" id="addShippingBtn">+ Versand</button>
    </div>
    <table id="itemsTable">
      <thead>
        <tr>
          <th style={{ width: "22%" }}>Beschreibung</th>
          <th className="right" style={{ width: "7%" }}>Menge</th>
          <th className="right" style={{ width: "11%" }}>Netto (€/E)</th>
          <th className="right" style={{ width: "11%" }}>Brutto (€/E)</th>
          <th className="right" style={{ width: "9%" }}>Steuer %</th>
          <th className="right" style={{ width: "9%" }}>Rabatt (%)</th>
          <th className="right" style={{ width: "14%" }}>Zeilengesamt (Brutto €)</th>
          <th style={{ width: "15%" }}>Eingabe-Modus</th>
          <th style={{ width: "6%" }}></th>
        </tr>
      </thead>
      <tbody id="itemRows"></tbody>
    </table>
  </div>

  <div className="grid cols-2" style={{ marginTop: "16px" }}>
    <div className="card">
      <h3 className="muted">Hinweise </h3>
      <textarea style={{ resize: "vertical" }} id="hinweis" rows={ 5 }  placeholder="Danke für Ihre Bestellung ..."></textarea>
    </div>
    <div className="card">
      <table>
        <tbody>
        <tr>
          <td>Gesamtbetrag netto</td>
          <td className="right mono"><span id="sumNet">0,00</span>&nbsp;€</td>
        </tr>
        <tr>
          <td>zzgl. Umsatzsteuer 20%</td>
          <td className="right mono"><span id="sumVAT20">0,00</span>&nbsp;€</td>
        </tr>
        <tr>
          <td>zzgl. Umsatzsteuer 0%</td>
          <td className="right mono"><span id="sumVAT0">0,00</span>&nbsp;€</td>
        </tr>
        <tr>
          <th>Gesamtbetrag brutto</th>
          <th className="right mono"><span id="sumGross">0,00</span>&nbsp;€</th>
        </tr>
        </tbody>
      </table>
      <div className="toolbar" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="secondary" id="pdfBtn">📄 PDF generieren</button>
      </div>
    </div>
  </div>

  <div className="card" style={{ marginTop: "16px" }}>
    <div className="footer-note">
      <strong>PUMPSHOT GmbH</strong> &middot; pumpshot.at &middot; Sallet 6 &middot; 4762 St. Willibald &middot; Österreich<br/>
      Tel: <a href="tel:+436503903663">+43 650 3903663</a> &middot; E-Mail: <a href="mailto:office@pumpshot.at">office@pumpshot.at</a> &middot; Web: <a href="https://pumpshotenergy.com" target="_blank" rel="noopener noreferrer">pumpshotenergy.com</a><br/>
      Amtsgericht: Landesgericht Ried &middot; FN-Nr.: FN658945M &middot; USt-ID: ATU82402026 &middot; St-Nr.: 41356/4923<br/>
      Bank: Raiffeisenbank &middot; IBAN: AT123445500005032271 &middot; BIC: RZOOAT2L455
    </div>
  </div>

</>);
}
