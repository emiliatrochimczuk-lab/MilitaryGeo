import type {MilitaryType} from "../types/military.ts";

export const MILITARY_TYPES: MilitaryType[] = [
  "barracks", "naval_base", "airfield", "training_area", "range",
  "office", "danger_area", "bunker"
];

export const MILITARY_LABELS: Record<MilitaryType, string> = {
    barracks: "Koszary",
    naval_base: "Baza morska",
    airfield: "Lotnisko",
    training_area: "Obszar szkoleniowy",
    range: "Strzelnica",
    primary: "Główne obiekty",
    office: "Biuro",
    danger_area: "Strefa niebezpieczna",
    shelter: "Schron",
    bunker: "Bunkier"
}; 