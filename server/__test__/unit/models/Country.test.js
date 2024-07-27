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

        it("should throw an Error if no country are found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Country.getAll).rejects.toThrow("No countries available");
            expect(db.query).toHaveBeenCalledWith("SELECT name FROM country;");
        });
    });

});