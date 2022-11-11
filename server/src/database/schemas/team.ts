import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    user: String,
    team: String,
    parsedTeam: [Object],
    pokepaste: String
})

export {teamSchema as TeamSchema}