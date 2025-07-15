const mongoose = require("mongoose");

const soloSchema = mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tournament"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  slotNumber: Number,
  gameName:String
});

module.exports = mongoose.model("soloSlot", soloSchema);