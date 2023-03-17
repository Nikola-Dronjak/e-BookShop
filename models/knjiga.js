const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema ({
    naziv: String,
    autor: String,
    zanr: String,
    ISBN: String,
    cena: String,
    kolicina: Number
});

const Knjiga = mongoose.model('Knjiga', bookSchema);

exports.Knjiga = Knjiga;