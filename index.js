const express = require('express');
const hbs = require('hbs');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient} = require('mongodb');
const mongoose = require('mongoose');
const {Knjiga} = require('./models/knjiga');
const { Korisnik } = require('./models/korisnik');

const url = "mongodb+srv://Admin:admin@cluster0.cv0sz3z.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

app.set('view engine', hbs); // komanda za postavljanje HandleBars kao default viewing engine

app.use(express.static(__dirname + "/CSS")); // komanda koja govori gde se nalazi CSS
app.use(bodyParser.urlencoded({extended:true}));

// rute

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/login", function(req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.get("/admin", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/katalog.hbs", function(req, res){
    res.render("katalog.hbs");
});

app.get("/porucivanjeKnjiga", function(req, res) {
    res.render("katalog.hbs");
});

app.get("/dodavanjeKnjiga", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

app.get("/dodavanjeKorisnika", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/azuriranjeKnjiga", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

app.get("/brisanjeKnjige", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

app.get("/brisanjeKorisnika", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

// dugme za povratak nazad

app.get("/nazad", function(req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get("/odjavljivanje", function(req, res) {
    res.sendFile(__dirname + "/index.html")
});

//prikaz knjiga

app.get("/prikazKnjiga", async(req, res) =>{
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        const knjige = await client.db('eBookShop').collection('knjige').find().project({naziv: 1, autor: 1, zanr: 1, ISBN: 1, cena: 1, kolicina: 1}).toArray();
        if(knjige.length == 0) {
            console.log("Trenutno nema ni jedna knjiga na stanju.");
            res.redirect("/");
        } else {
            res.render("katalog.hbs", {knjiga: knjige});
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
});

//porucivanje knjiga

app.post("/porucivanjeKnjiga", async(req, res) =>{
    const nazivKnjige = req.body.knjigaKojaSePorucuje;
    const brPorudzbina = req.body.unosBrPorudzbina;
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        const knjiga = await client.db('eBookShop').collection('knjige').find({naziv: nazivKnjige}).toArray();
        if(knjiga.length == 0) {
            console.log("Ne postoji knjiga sa datim nazivom.");
            res.redirect("/prikazKnjiga");
        } else if(knjiga[0].kolicina == 0) {
            console.log("Trenutno nema date knjige na stanju.");
            res.redirect("/prikazKnjiga");
        } else if(knjiga[0].kolicina-brPorudzbina<0) {
            console.log("Ne možete poručiti više od raspoloživog broja knjiga.");
            res.redirect("/prikazKnjiga");
        } else {
            await client.db('eBookShop').collection('knjige').updateOne({naziv: nazivKnjige}, {$set: {kolicina: knjiga[0].kolicina-brPorudzbina}});
            console.log("Vaša porudžbina je uspešno prosleđena.");
            res.redirect("/prikazKnjiga");
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
});

//prijavljivanje

app.post("/prijavljivanje", async(req, res) => {
    const korisnickoIme = req.body.username;
    const sifra = req.body.password;
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        const korisnik = await client.db('eBookShop').collection('korisnici').find({korisnickoIme: korisnickoIme, sifra: sifra}).project({korisnickoIme: 1, sifra: 1, privilegije: 1}).toArray();
        if(korisnik.length == 0){
            console.log("Korisnik sa datim kredencijalima nije pronađen.");
            res.redirect("/login");
        } else {
            const privilegije = korisnik[0].privilegije;
            if(privilegije === true) {
                res.redirect("/admin");
            } else {
                res.redirect("/prikazKnjiga");
            }
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
});

//unos

app.post("/dodavanjeKnjiga", async(req,res) => {
    const novaKnjiga = new Knjiga({
        naziv: req.body.unosNaziva,
        autor: req.body.unosAutora,
        zanr: req.body.unosZanra,
        ISBN: req.body.unosISBNa,
        cena: req.body.unosCene,
        kolicina: req.body.unosKolicine
    });
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        await client.db('eBookShop').collection('knjige').insertOne(novaKnjiga);
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
    res.redirect("/admin");
});

app.post("/dodavanjeKorisnika", async(req,res) => {
    const noviKorisnik = new Korisnik({
        ime: req.body.unosImena,
        prezime: req.body.unosPrezimena,
        JMBG: req.body.unosJMBGa,
        email: req.body.unosEmaila,
        korisnickoIme: req.body.unosKorisnickogImena,
        sifra: req.body.unosSifre,
        privilegije: 0
    });
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        await client.db('eBookShop').collection('korisnici').insertOne(noviKorisnik);
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
    res.redirect("/signup");
});

//azuriranje

app.post("/azuriranjeKnjiga", async(req, res) => {
    const isbn = req.body.ISBNKnjigeZaAzuriranje;
    const azuriranaKnjiga = {
        naziv: req.body.noviNaziv,
        autor: req.body.noviAutor,
        zanr: req.body.noviZanr,
        ISBN: isbn,
        cena: req.body.novaCena,
        kolicina: req.body.novaKolicina
    }
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        await client.db('eBookShop').collection('knjige').updateOne({"ISBN": isbn}, {$set: azuriranaKnjiga});
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
    res.redirect("/admin");
});

//brisanje

app.post("/brisanjeKnjige", async(req, res) => {
    const isbn = req.body.isbnKnjigeZaBrisanje;
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        await client.db('eBookShop').collection('knjige').deleteOne({"ISBN": isbn});
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
    res.redirect("/admin");
});

app.post("/brisanjeKorisnika", async(req, res) => {
    const jmbg = req.body.korisnikovJMBG;
    try {
        await client.connect();
        console.log("Uspešno ste se povezali sa serverom.");
        await client.db('eBookShop').collection('korisnici').deleteOne({"JMBG": jmbg});
    } catch (err) {
        console.log(err.stack);
    } finally {
        client.close();
    }
    res.redirect("/admin");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));