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



    describe("update", () => {
        let copyCountryObject;
        beforeEach(() => {
            copyCountryObject = { ...countryObject };
            delete copyCountryObject.country_id;
            delete copyCountryObject.fun_fact;
            delete copyCountryObject.map_image_url;

            copyCountryObject.languages = "English, Welsh, Scotish, Irish, and others";
            copyCountryObject.capital = "Birmingham";
        });

        it("updates a country on successful db query", async () => {
            // Arrange

            const mockCountries = [
                { ...countryObject, languages: copyCountryObject.languages, capital: copyCountryObject.capital }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const country = new Country(countryObject);
            expect(country.capital).toBe("London");
            expect(country.languages).toBe("English");
            const updatedCountry = await country.update(copyCountryObject);

            // Assert
            expect(country).toBeInstanceOf(Country);
            expect(country.name).toBe("UK");
            expect(country.capital).toBe("Birmingham");
            expect(country.languages).toBe("English, Welsh, Scotish, Irish, and others");
            expect(country.country_id).toBe(1);
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(updatedCountry).toEqual({
                ...countryObject,
                languages: copyCountryObject.languages, 
                capital: copyCountryObject.capital
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Arrange
            const mockResult = {
                    ...copyCountryObject,
                    fun_fact: countryObject.fun_fact,
                    map_image_url: countryObject.map_image_url,
                    country_id: countryObject.country_id
            }

            // Act
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            const country = new Country(countryObject);

            // Arrange
            await expect(country.update(copyCountryObject)).rejects.toThrow("Failed to update country");
            expect(db.query).toHaveBeenCalledWith(`UPDATE country
                                            SET name = $1,
                                                capital = $2,
                                                population = $3,
                                                languages = $4,
                                                fun_fact = $5, 
                                                map_image_url = $6
                                                WHERE country_id = $7 RETURNING *`, [
                                                    mockResult.name, mockResult.capital, mockResult.population, mockResult.languages,
                                                    mockResult.fun_fact, mockResult.map_image_url, mockResult.country_id
                                                ]);
        });
    });


    describe("destroy", () => {
        it("destroys a country on successful db query", async () => {
            // Arrange
            const mockCountries = [ countryObject ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const country = new Country(countryObject);
            const deletedCountry = await country.destroy();

            // Assert
            expect(country).toBeInstanceOf(Country);
            expect(country.name).toBe("UK");
            expect(country.capital).toBe(country.capital);
            expect(country.languages).toBe(country.languages);
            expect(country.country_id).toBe(1);
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(deletedCountry).toEqual({
                ...countryObject
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Act & Arrange
            jest.spyOn(db, "query").mockRejectedValue(new Error("Something wrong with the DB"));
            const country = new Country(countryObject);
            await expect(country.destroy()).rejects.toThrow("Something wrong with the DB")
        });
    });
});
