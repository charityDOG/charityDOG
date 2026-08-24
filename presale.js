import { BrowserWallet, Transaction, Forge } from 'https://meshjs.dev';

// 1. Admin-Wallet verbinden
const wallet = await BrowserWallet.enable('eternl'); // oder nami/lace
const adminAddress = await wallet.getChangeAddress();

// 2. MeshJS Forge für das einmalige State-NFT aufsetzen
const forge = new Forge();
const stateTokenName = "cDOGState"; // Name des technischen Hilfs-NFTs

// Wir fügen das Minting für genau 1 NFT hinzu
forge.mint({
  assetName: stateTokenName,
  assetQuantity: '1',
});

// 3. Den Start-Zustand (SaleDatum) definieren
// Entspricht exakt der Struktur deiner 'Sale' Ausprägung in Aiken
const initialSaleDatum = {
  alternative: 0, // 0 = Erster Konstruktor (Sale)
  fields: [
    0,                   // raised: Bisher 0 ADA gesammelt
    0,                   // sold: Bisher 0 cDOG verkauft
    100000000000,        // cap: 100.000 ADA (in Lovelace: * 1.000.000)
    25000000000,         // goal: 25.000 ADA (in Lovelace)
    3000,                // price: 3.000 cDOG pro ADA
    1785000000,          // deadline: Unix-Timestamp für das Ende
    5 * 1000000,         // min_buy: 5 ADA Mindestkauf
    2000 * 1000000       // max_buy: 2.000 ADA Maximalkauf
  ]
};

// 4. Transaktion vorbereiten
const tx = new Transaction({ initiator: wallet });

// Das NFT minten
tx.setForge(forge);

// Berechne die Smart-Contract-Adresse, die aus deinem Aiken-Build entsteht
const scriptAddress = "DEINE_AIKEN_SMART_CONTRACT_ADRESSE";

// Sende das frisch geprägte State-NFT zusammen mit dem Start-Datum an den Kontrakt
tx.sendAssets(
  {
    address: scriptAddress,
    datum: { value: initialSaleDatum, inline: true } // Wichtig: Inline-Datum nutzen!
  },
  [
    {
      unit: "HIER_DIE_VON_MESH_GENERIERTE_MINTING_POLICY" + "63444f475374617465", // Policy + Hex von 'cDOGState'
      quantity: '1'
    }
  ]
);

// 5. Transaktion abschicken
const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);

console.log("Presale erfolgreich initialisiert! Tx-Hash:", txHash);
