// Importer nødvendige moduler
const express = require("express"); // Web framework for Node.js
const path = require("path"); // Hjelpemiddel for fil- og katalogstier
const http = require("http"); // Node.js-modul for å opprette HTTP-server
const sqlite3 = require("sqlite3").verbose(); // SQLite3-modul med ekstra feilmeldinger
const session = require("express-session"); // Middleware for håndtering av bruker-sessions
const bcrypt = require("bcrypt"); // Bibliotek for sikker hashing av passord

// --- Opprett Express-applikasjonen ---
const app = express();

// --- Definer port og opprett HTTP-serveren ---
const port = 3000;
const server = http.createServer(app);

// --- Sett opp statiske filer fra "public"-mappen ---
app.use(express.static(path.join(__dirname, "public")));

// --- Middleware-konfigurasjon ---
// Parse JSON-data og URL-kodet data fra klienten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurer session-middleware for å lagre brukerdata etter innlogging
app.use(
    session({
        secret: "hemmeligNøkkel", // Husk å endre denne nøkkelen i produksjon!
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // Cookie "lever" i en uke
    })
);

// Middleware for å sjekke om brukeren er logget inn
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // Brukeren er logget inn, fortsett
    } else {
        res.redirect("/login"); // Ikke logget inn – omdiriger til login-siden
    }
}

// --- Databasekobling og opprettelse av nødvendige tabeller ---
// Opprett forbindelse til SQLite-databasen "chatDatabase.db"
const db = new sqlite3.Database("chatDatabase.db", (err) => {
    if (err) {
        console.error("Feil ved åpning av database:", err.message);
    } else {
        console.log("Koblet til SQLite-databasen.");

        // Opprett tabell for brukere dersom den ikke allerede finnes
        db.run(
            `CREATE TABLE IF NOT EXISTS Bruker (
        ID_bruker INTEGER PRIMARY KEY,
        Brukernavn TEXT,
        Passord TEXT
        )`
        );

        // Opprett tabell for kommentarer med fremmednøkkel til Bruker dersom den ikke allerede finnes
        db.run(
            `CREATE TABLE IF NOT EXISTS Kommentar (
        ID_kommentar INTEGER PRIMARY KEY,
        ID_bruker INTEGER,
        Kommentar TEXT,
        Tidspunkt TEXT,
        FOREIGN KEY (ID_bruker) REFERENCES Bruker(ID_bruker)
        )`
        );
    }
});

// --- Eksporter viktige variabler for bruk i app.js ---
// App.js (elevenes fil) importerer nå app, server, port, db, isAuthenticated og bcrypt
module.exports = { app, server, port, db, isAuthenticated, bcrypt };
