const Country = require("../models/Country");

async function index(req, res) {
    try {
        const countries = await Country.getAll();
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function show(req, res) {
    try {
        const name = req.params.name;
        const country = await Country.getOneByCountryName(name);
        res.status(200).json(country);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const data = req.body;
        const newCountry = await Country.create(data);
        res.status(201).send(newCountry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}



module.exports = {
    index,
    show,
    create
}