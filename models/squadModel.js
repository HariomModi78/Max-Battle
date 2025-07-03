const mongoose = require("mongoose");

const squadSchema = mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tournament"
  },
  teamId: String,       // e.g., "Team3"
  slotId: String,       // e.g., "3A", "3B", "3C", "3D"
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  gameName:String
});

module.exports = mongoose.model("squadSlot", squadSchema);