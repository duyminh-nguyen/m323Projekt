# Final Fantasy XIII Character Database Viewer

## Beschreibung

Dieses Projekt ist ein **Final Fantasy XIII Character Database Viewer**, mit dem Charaktere aus dem Final-Fantasy-XIII-Universum verwaltet und angezeigt werden können.

Die Applikation erlaubt es dem Benutzer:

- neue Charaktere zur Datenbank hinzuzufügen
- bestehende Charaktere anzuzeigen
- Charaktere zu entfernen
- Charaktere nach ihrer **Primary Role** zu filtern
- detaillierte Charakterinformationen anzusehen

Das Projekt wird **in JavaScript implementiert** und verwendet **Node.js**, um die Anwendung über die Konsole auszuführen. JavaScript wurde gewählt, da die Sprache funktionale Programmierkonzepte wie Higher-Order Functions, Immutable Data und Function Composition gut unterstützt.

Die Anwendung wird hauptsächlich über ein **Konsolenmenü** gesteuert, in dem der Benutzer verschiedene Optionen auswählen kann. Zusätzlich kann eine einfache Benutzeroberfläche verwendet werden, um die Charakterinformationen übersichtlich darzustellen.

Ziel des Projekts ist es, **Konzepte der funktionalen Programmierung praktisch anzuwenden**, insbesondere:

- Pure Functions
- Immutable Data
- Higher-Order Functions
- Function Composition
- Rekursion
- Trennung von Businesslogik und Benutzeroberfläche

---

# Features

## Charakterverwaltung

Die Applikation verwaltet eine Liste von Charakteren mit folgenden Informationen:

- Name
- Alter
- Rasse
- Geschlecht
- Größe
- Charakterbeschreibung
- Primary Role
- Ultimate Weapon

Der Benutzer kann Charaktere:

- hinzufügen
- anzeigen
- bearbeiten
- löschen

---

## Charakterübersicht

Der Benutzer kann eine Liste aller gespeicherten Charaktere anzeigen.

Von dieser Liste aus kann ein bestimmter Charakter ausgewählt werden, um eine **Detailansicht mit allen Informationen** zu öffnen.

Diese Ansicht enthält:

- Name
- Rolle
- Waffe
- Beschreibung
- weitere Attribute

---

## Filter nach Primary Role

Die Charakterliste kann nach der **Primary Role** gefiltert werden.

Beispiele für Rollen aus Final Fantasy XIII:

- Commando
- Ravager
- Sentinel
- Saboteur
- Synergist
- Medic

Der Benutzer kann dadurch schnell alle Charaktere mit einer bestimmten Rolle anzeigen.

---

## Konsolenmenü

Die Anwendung verfügt über ein strukturiertes Menüsystem.

Beispiel:

### Hauptmenü

1. Charaktere anzeigen  
2. Charakter hinzufügen  
3. Charakter bearbeiten  
4. Programm beenden  

### Charakterliste

1. Charakter auswählen  
2. Nach Rolle filtern  
3. Zurück zum Hauptmenü  

Dieses Menüsystem ermöglicht eine einfache Navigation durch die Anwendung.

---

# Setup

## Voraussetzungen

Zur Ausführung der Anwendung wird benötigt:

- **Node.js**
- eine **Konsole oder ein Terminal**

---

## Installation

Repository klonen:

```bash
git clone https://github.com/duyminh-nguyen/m323Projekt.git
