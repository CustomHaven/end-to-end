const Country = require("../models/Country");

async function index(req, res) {
    try {
        const countries = await Country.getAll();
        console.log(countries);
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    index
}