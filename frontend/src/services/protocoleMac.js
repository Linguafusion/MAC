// frontend/src/services/protocoleMac.js
// Protocole MAC en quatre temps (méthode de Bruno Maurer).
// Miroir de backend/app/protocole_mac.py : les deux fichiers doivent rester identiques.

// Les quatre temps de sélection, dans l'ordre de passation
export const ETAPES_MAC = [
  { valeur: 2, libelle: "Les plus importantes pour moi", signe: "+2" },
  { valeur: -2, libelle: "Les moins importantes pour moi", signe: "−2" },
  { valeur: 1, libelle: "Les plus importantes encore pour moi", signe: "+1" },
  { valeur: -1, libelle: "Les moins importantes à nouveau pour moi", signe: "−1" },
];

// Les propositions non choisies pendant les quatre temps reçoivent automatiquement 0
export const VALEUR_MEDIANE = 0;
export const LIBELLE_MEDIANE = "Médiane (0) : non retenues";

export const LIBELLES_VALEUR = {
  2: "Les plus importantes pour moi",
  "-2": "Les moins importantes pour moi",
  1: "Les plus importantes encore pour moi",
  "-1": "Les moins importantes à nouveau pour moi",
  0: LIBELLE_MEDIANE,
};

// Nombre de choix à chaque temps, selon le nombre de propositions (k = N / 5)
const NOMBRE_PAR_ETAPE = { 10: 2, 15: 3, 20: 4 };

export function nombreParEtape(nombrePropositions) {
  return NOMBRE_PAR_ETAPE[nombrePropositions] ?? null;
}

export const NOMBRE_EN_LETTRES = { 2: "deux", 3: "trois", 4: "quatre" };

export function libelleValeur(valeur) {
  return LIBELLES_VALEUR[valeur] ?? "N/A";
}
