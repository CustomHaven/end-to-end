const Country = require("../../../models/Country");
const db = require("../../../db/connect");

let countryObject;

describe("Country Model", () => {
    beforeEach(() => {
        countryObject = {
            country_id: 1,
            name: "UK",
            capital: "London",
            population: 6000000,
            languages: "English",
            fun_fact: "Very fun place",
            map_image_url: "https://www.google.com"
        };
        jest.clearAllMocks();
    });

    describe("getAll", () => {

        it("resolves with countries on successful db query", async () => {
            // Arrange
            const mockCountries = [
                countryObject, {...countryObject, country_id: 2, name: "USA" }, {...countryObject, country_id: 3, name: "UAE" }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const countries = await Country.getAll();

            // Assert
            expect(countries).toHaveLength(3);
            expect(countries[2].name).toBe("UAE");
            expect(countries[1].country_id).toBe(2);
        });

        it("should throw an Error if no countries are found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Country.getAll).rejects.toThrow("No countries available");
            expect(db.query).toHaveBeenCalledWith("SELECT name FROM country;");
        });
    });

    describe("getOneByCountryName", () => {

        it("resolves with a country on successful db query", async () => {
            // Arrange
            const mockCountries = [
                countryObject
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const country = await Country.getOneByCountryName("UK");

            // Assert
            expect(country).toBeInstanceOf(Country);
            expect(country.name).toBe("UK");
            expect(country.country_id).toBe(1);
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM country WHERE LOWER(name) = LOWER($1);", ["UK"]);
        });

        it("should throw an Error if no country is found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Country.getOneByCountryName).rejects.toThrow("Unable to locate country");
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM country WHERE LOWER(name) = LOWER($1);", [undefined]);
        });
    });


    describe("create", () => {
        let copyCountryObject;
        beforeEach(() => {
            copyCountryObject = { ...countryObject };
            delete copyCountryObject.country_id;
            delete copyCountryObject.fun_fact;
            delete copyCountryObject.map_image_url;
        })

        it("resolves with a country on successful creation", async () => {
            // Arrange

            const mockCountries = [
                { ...countryObject, country_id: 5 }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const country = await Country.create(copyCountryObject);

            // Assert
            expect(country).toBeInstanceOf(Country);
            expect(country.name).toBe("UK");
            expect(country.country_id).toBe(5);
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO country (name, capital, population, languages) 
                                            VALUES ($1, $2, $3, $4) RETURNING *`, [copyCountryObject.name, "London", 6000000, "English"]);
        });

        it("should throw an Error if country already exists", async () => {
            // Arrange
            const mockCountries = [ countryObject ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act & Arrange
            await expect(Country.create(copyCountryObject)).rejects.toThrow("A country with this name already exists");
            expect(db.query).toHaveBeenCalledWith("SELECT name FROM country WHERE LOWER(name) = LOWER($1);", ["UK"]);
        });
    });


});