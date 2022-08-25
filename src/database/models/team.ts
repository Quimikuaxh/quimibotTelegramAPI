import mongoose from "mongoose";
import {TeamSchema} from "../schemas/team";

const TeamModel = mongoose.model("pokemon", TeamSchema);

export {TeamModel}