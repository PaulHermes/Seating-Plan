import React, { createContext, useState, useContext } from "react";

const LanguageContext = createContext();

const LANGUAGES = {
  en: {
    seatingPlan: "Seating Plan",
    singleDesk: "Single Desk",
    doubleDesk: "Double Desk",
    desk: "Desk",
    board: "Board",
    colour: "Colour",
    teacherDesk: "Teacher",
    shelf: "Shelf",
    customObjects: "Custom Objects",
    noObjects: "No objects available",
    newObject: "New Object",
    studentNames: "Student Names (one per line)",
    assign: "Assign",
    reset: "Reset",
    printOut: "Print",
    settings: "Settings",
    text: "Text",
    cancel: "Cancel",
    saveObject: "Save Object",
    saving: "Saving...",
    deleteObject: "Delete Object",
    objectName: "Object name",
    objectLabel: "Object Label",
    snapshotSave: "Save Snapshot",
    snapshotLoad: "Load Snapshot",
    rotatable: "Rotatable",
    deletable: "removable",
    gridSize: "Grid size",
    snapToGrid: "Snap to grid",
    sidebarHint: "Move desks in plan",
    width: "Width",
    height: "Height",
    language: "Language",
    close: "Close",
    nameLockedSeat: "Name for locked seat:",
    seat: "Seat",
    empty: "Empty",
    nameShelf: "New name for the shelf:",
    teacher: "Teacher",
  },
  de: {
    seatingPlan: "Sitzplan",
    singleDesk: "Einzeltisch",
    doubleDesk: "Zweiertisch",
    desk: "Tisch",
    board: "Tafel",
    colour: "Farbe",
    teacherDesk: "Lehrertisch",
    shelf: "Regal",
    customObjects: "Benutzerdefinierte Objekte",
    noObjects: "Keine Objekte vorhanden.",
    newObject: "Neues Objekt",
    studentNames: "Schülernamen (eine pro Zeile)",
    assign: "Zuweisen",
    reset: "Zurücksetzen",
    printOut: "Drucken",
    settings: "Einstellungen",
    text: "Text",
    cancel: "Abbrechen",
    saveObject: "Objekt speichern",
    saving: "Speichern...",
    deleteObject: "Objekt löschen",
    objectName: "Objektname",
    objectLabel: "Beschriftung",
    snapshotSave: "Snapshot speichern",
    snapshotLoad: "Snapshot importieren",
    rotatable: "rotierbar",
    deletable: "löschbar",
    gridSize: "Rastergröße",
    snapToGrid: "Einrasten an",
    sidebarHint: "Ziehe Tische im Plan.",
    width: "Breite",
    height: "Höhe",
    language: "Sprache",
    close: "Schließen",
    nameLockedSeat: "Name für diesen festen Platz:",
    seat: "Sitz",
    empty: "Frei",
    nameShelf: "Neuer Name für das Regal:",
    teacher: "Lehrer*in",
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("de");
  const t = (key) => LANGUAGES[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
