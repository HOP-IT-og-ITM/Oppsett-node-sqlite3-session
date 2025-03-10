// Modul med alt server-oppsettet som ikke endres i programmet
const { app, server, port, db, isAuthenticated, bcrypt } = require("./server");
// Modul for å håndtere fil- og katalogstier
const path = require("path");

// Rot-rute: Sender brukeren til riktig side basert på om de er logget inn
app.get("/", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "chat.html"));
});

// Rute for å serve login-siden
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "login.html"));
});

// Rute for å serve registreringssiden (opprett bruker)
app.get("/opprett-bruker", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "new-user.html"));
});

// Rute for å serve kommentar-siden
app.get("/kommentar", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "chat.html"));
});

// Rute for å logge ut og ødelegge session
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.redirect("/");
});

/*
  API-endepunkt for å hente alle kommentarer.
*/
app.get("/api/kommentar", isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM Kommentar";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Feil ved henting av kommentarer:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rute for å logge inn. Sammenligner oppgitt passord med hash i databasen.
app.post("/login", (req, res) => {
    const { Brukernavn, Passord } = req.body;

    if (!Brukernavn || !Passord) {
        return res.status(400).send("Manglende Brukernavn eller Passord");
    }

    const sql = "SELECT * FROM BRUKER WHERE Brukernavn = ?";
    db.get(sql, [Brukernavn], async (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Intern serverfeil");
        }
        if (row && (await bcrypt.compare(Passord, row.Passord))) {
            req.session.user = row; // Lagre brukerdata i session
            res.redirect("/kommentar");
        } else {
            res.redirect("/login?error=ugyldig");
        }
    });
});

/*
  API-endepunkt for registrering av ny bruker.
  Forventer data med feltene "Brukernavn" og "Passord".
  Passordet blir hashet før lagring.
*/
app.post("/api/bruker", async (req, res) => {
    const { Brukernavn, Passord } = req.body;

    if (!Brukernavn || !Passord) {
        return res
            .status(400)
            .json({ error: "Manglende Brukernavn eller Passord" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Passord, 10);
        const sql = `INSERT INTO BRUKER (Brukernavn, Passord) VALUES (?, ?)`;

        db.run(sql, [Brukernavn, hashedPassword], function (err) {
            if (err) {
                console.error("Feil ved innsetting av bruker:", err.message);
                return res.status(500).json({ error: err.message });
            }
            // Returner den nye brukerens ID og Brukernavn
            res.redirect("/");
        });
    } catch (err) {
        console.error("Feil ved hashing av passord:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/*
  API-endepunkt for å legge til en ny kommentar.
  Kun tilgjengelig for loggede brukere. Bruker brukerens ID fra session.
*/
app.post("/api/kommentar", isAuthenticated, (req, res) => {
    const { Kommentar } = req.body;
    const ID_bruker = req.session.user.ID_bruker;

    if (!Kommentar) {
        return res.status(400).json({ error: "Manglende kommentar" });
    }

    const Tidspunkt = new Date().toISOString();
    const sql = `INSERT INTO Kommentar (ID_bruker, Kommentar, Tidspunkt) VALUES (?, ?, ?)`;

    db.run(sql, [ID_bruker, Kommentar, Tidspunkt], function (err) {
        if (err) {
            console.error("Feil ved innsetting av kommentar:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({
            ID_kommentar: this.lastID,
            ID_bruker,
            Kommentar,
            Tidspunkt,
        });
    });
});

// Start serveren og lytt på angitt port
server.listen(port, () => {
    console.log(`Serveren kjører på http://localhost:${port}`);
});
