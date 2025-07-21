const mongoose = require("mongoose");

const duoSchema = mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tournament"
  },
  teamId: String,        // e.g., "Team1", "Team2"
  slotId: String,        // e.g., "1A", "1B"
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  gameName:String
});

module.exports = mongoose.model("duoSlot", duoSchema);