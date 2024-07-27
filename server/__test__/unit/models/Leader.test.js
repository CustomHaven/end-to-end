const Leader = require("../../../models/Leader");
const Country = require("../../../models/Country");
const db = require("../../../db/connect");

let leaderObject;

describe("Leader Model", () => {
    beforeEach(() => {
        leaderObject = {
            leader_id: 1,
            name: "John Doe",
            years_in_service: 3,
            country_id: 1,
        };
        jest.clearAllMocks();
    });

    describe("getAll", () => {

        it("resolves with leaders on successful db query", async () => {
            // Arrange
            const mockLeaders = [
                leaderObject, {...leaderObject, leader_id: 2, name: "USA" }, {...leaderObject, leader_id: 3, name: "UAE" }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockLeaders });

            // Act
            const leaders = await Leader.getAll();

            // Assert
            expect(leaders).toHaveLength(3);
            expect(leaders[0].name).toBe("John Doe");
            expect(leaders[0].years_in_service).toBe(3);
            expect(leaders[2].name).toBe("UAE");
            expect(leaders[1].leader_id).toBe(2);
        });

        it("should throw an Error if no leaders are found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Leader.getAll).rejects.toThrow("No leaders available");
            expect(db.query).toHaveBeenCalledWith("SELECT name FROM leader;");
        });
    });

    describe("getOneByLeaderName", () => {

        it("resolves with a leader on successful db query", async () => {
            // Arrange
            const mockLeaders = [
                leaderObject
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockLeaders });

            // Act
            const leader = await Leader.getOneByLeaderName("John Doe");

            // Assert
            expect(leader).toBeInstanceOf(Leader);
            expect(leader.name).toBe("John Doe");
            expect(leader.leader_id).toBe(1);
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM leader WHERE LOWER(name) = LOWER($1);", ["John Doe"]);
        });

        it("should throw an Error if no leader is found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Leader.getOneByLeaderName("hi")).rejects.toThrow("Unable to locate leader");
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM leader WHERE LOWER(name) = LOWER($1);", ["hi"]);
        });
    });


    describe("create", () => {
        let copyLeaderObject;
        // 
        beforeEach(() => {
            copyLeaderObject = { ...leaderObject };
            delete copyLeaderObject.leader_id;
            delete copyLeaderObject.country_id;
            copyLeaderObject.name = "New Leader";
            copyLeaderObject.years_in_service = 12;
        });

        it("resolves with a new leader on successful creation", async () => {
            // Arrange

            const mockResultLeaders = [
                { ...leaderObject, leader_id: 5, years_in_service: copyLeaderObject.years_in_service, name: copyLeaderObject.name, country_id: 8 }
            ];
            jest.spyOn(Country, "getOneByCountryName").mockResolvedValueOnce({ country_id: 8 });
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResultLeaders });

            // Act
            const leader = await Leader.create(copyLeaderObject);

            // Assert
            expect(leader).toBeInstanceOf(Leader);
            expect(leader.name).toBe("New Leader");
            expect(leader.leader_id).toBe(5);
            expect(leader.years_in_service).toBe(12);
            
            expect(Country.getOneByCountryName).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO leader (name, years_in_service, country_id) 
                                            VALUES ($1, $2, $3) RETURNING *`, [
                                                copyLeaderObject.name, 
                                                copyLeaderObject.years_in_service,
                                                8
                                            ]);
            
            expect(leader).toEqual(mockResultLeaders[0])
        });

        it("should throw an Error if leader already exists", async () => {
            // Arrange
            copyLeaderObject.name = "John Doe";
            const mockLeaders = [ leaderObject ];
            jest.spyOn(Country, "getOneByCountryName").mockResolvedValueOnce({ country_id: 8 });
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockLeaders });

            // Act & Arrange
            await expect(Leader.create(copyLeaderObject)).rejects.toThrow("A leader with this name already exists");
            expect(db.query).toHaveBeenCalledWith("SELECT name FROM leader WHERE LOWER(name) = LOWER($1);", ["John Doe"]);
        });
    });



    describe("update", () => {
        let copyLeaderObject;
        // 
        beforeEach(() => {
            copyLeaderObject = { ...leaderObject };
            delete copyLeaderObject.leader_id;
            delete copyLeaderObject.country_id;
            copyLeaderObject.name = "New Leader";
            copyLeaderObject.years_in_service = 12;
        });

        xit("updates a leader on successful db query", async () => {
            // Arrange

            const mockLeaders = [
                { ...leaderObject, name: copyLeaderObject.name, years_in_service: copyLeaderObject.years_in_service }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockLeaders });

            // Act
            const leader = new Leader(leaderObject);
            expect(leader.name).toBe("John Doe");
            expect(leader.years_in_service).toBe(3);
            const updatedCountry = await leader.update(copyLeaderObject);

            // Assert
            expect(leader).toBeInstanceOf(Leader);
            expect(leader.name).toBe("New Leader");
            expect(leader.years_in_service).toBe(12);
            expect(leader.leader_id).toBe(1);
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(updatedCountry).toEqual({
                ...leaderObject,
                name: copyLeaderObject.name, 
                years_in_service: copyLeaderObject.years_in_service
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Arrange
            const mockResult = {
                    ...copyLeaderObject,
                    // fun_fact: leaderObject.fun_fact,
                    // map_image_url: leaderObject.map_image_url,
                    // leader_id: leaderObject.leader_id
            }

            // Act
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            const leader = new Leader(leaderObject);

            // Arrange
            await expect(leader.update(copyLeaderObject)).rejects.toThrow("Failed to update leader");
            // expect(db.query).toHaveBeenCalledWith(`UPDATE leader
            //                                 SET name = $1,
            //                                     capital = $2,
            //                                     population = $3,
            //                                     languages = $4,
            //                                     fun_fact = $5, 
            //                                     map_image_url = $6
            //                                     WHERE leader_id = $7 RETURNING *`, [
            //                                         mockResult.name, mockResult.capital, mockResult.population, mockResult.languages,
            //                                         mockResult.fun_fact, mockResult.map_image_url, mockResult.leader_id
            //                                     ]);
        });
    });


    xdescribe("destroy", () => {
        it("destroys a leader on successful db query", async () => {
            // Arrange
            const mockCountries = [ leaderObject ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockCountries });

            // Act
            const leader = new Leader(leaderObject);
            const deletedCountry = await leader.destroy();

            // Assert
            expect(leader).toBeInstanceOf(Leader);
            expect(leader.name).toBe("UK");
            expect(leader.capital).toBe(leader.capital);
            expect(leader.languages).toBe(leader.languages);
            expect(leader.leader_id).toBe(1);
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(deletedCountry).toEqual({
                ...leaderObject
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Act & Arrange
            jest.spyOn(db, "query").mockRejectedValue(new Error("Something wrong with the DB"));
            const leader = new Leader(leaderObject);
            await expect(leader.destroy()).rejects.toThrow("Something wrong with the DB")
        });
    });
});
