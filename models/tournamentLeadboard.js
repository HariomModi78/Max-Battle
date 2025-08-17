const mongoose = require("mongoose");

const tournamentLeadboardSchema = mongoose.Schema({
    tournamentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tournament",
        require:true
    },
    player:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            kills:Number,
            gameName:String
        }
    ]
})

module.exports = mongoose.model("tournamentLeadboard",tournamentLeadboardSchema);