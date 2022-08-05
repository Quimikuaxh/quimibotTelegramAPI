import mongoose from "mongoose";
import {MoveSchema} from "./move";

const editionSchema = new mongoose.Schema({
    edition: String,
    moves: [MoveSchema]
});

export {editionSchema as EditionSchema}