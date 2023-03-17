const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    ime: String,
    prezime: String,
    JMBG: String,
    email: String,
    korisnickoIme: String,
    sifra: String,
    privilegije: Boolean
});

const Korisnik = mongoose.model('Korisnik', userSchema);

exports.Korisnik = Korisnik;