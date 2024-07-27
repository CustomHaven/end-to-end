const db = require("../db/connect");

class leader {
    constructor({ leader_id, name, years_in_service, country_id }) {
        this.leader_id = leader_id;
        this.name = name;
        this.years_in_service = years_in_service;
        this.country_id = country_id;
    }

    static async getAll() {
        const response = await db.query("SELECT name FROM leader;");
        if (response.rows.length === 0) {
            throw new Error("No leaders available");
        }
        return response.rows.map(c => new leader(c))
    }

    static async getOneByLeaderName(leaderName) {
        const response = await db.query("SELECT * FROM leader WHERE LOWER(name) = LOWER($1);", [leaderName]);
        if (response.rows.length != 1) {
            throw new Error("Unable to locate leader");
        }
        return new leader(response.rows[0]);
    }

    static async create(data) {
        const { name, years_in_service, country_id } = data;
        const existingleader = await db.query("SELECT name FROM leader WHERE LOWER(name) = LOWER($1);", [name]);
        if (existingleader.rows.length ===  0) {
            let response = await db.query(`INSERT INTO leader (name, years_in_service, country_id) 
                                            VALUES ($1, $2, $3) RETURNING *`, [name, years_in_service, country_id]);
            
            return new leader(response.rows[0]);
        } else {
            throw new Error("A leader with this name already exists");
        }
    }

    async update(data) {
        for (const [key, value] of Object.entries(this)) {
            if (key in data && key !== this.leader_id && key !== this.country_id && key !== this.name) {
                this[key] = data[key];
            }
        }

        const response = await db.query(`UPDATE leader
                                            SET name = $1,
                                                years_in_service = $2,
                                                country_id = $3
                                                WHERE leader_id = $4 RETURNING *`,
                                        [this.name, this.years_in_service, this.country_id, this.leader_id]);
            

        if (response.rows[0]) {
            return new leader(response.rows[0]);
        } else {
            throw new Error("Failed to update leader");
        }

    }

    async destroy() {
        const response = await db.query("DELETE FROM leader WHERE name = $1 RETURNING *;", [this.name]);
        return new leader(response.rows[0]);
    }
}


module.exports = leader;