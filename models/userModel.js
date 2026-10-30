const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    gameName: String,
    username: {
        type: String,
    },
    email: String,
    password: String,
    role: {
        type: String,
        default: "user"
    },
    totalMatch: {
        type: Number,
        default: 0
    },
    totalKill: {
        type: Number,
        default: 0
    },
    totalBalance: {
        type: Number,
        default: 0
    },
    deposited: {
        type: Number,
        default: 0
    },
    winning: {
        type: Number,
        default: 0
    },
    monthlyWinning: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    earning: {
        type: Number,
        default: 0
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    isReferred: {
        type: Boolean,
        default: false
    },
    referralCode: String,
    totalReferral: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    isEighteenPlus: Boolean,
    isApplyCode: {
        type: Boolean,
        default: false
    },
    upi: Array,
    emailPermission: {
        type: Boolean,
        default: true
    },
    lastSpinTime: Date
});

module.exports = mongoose.model("user", userSchema);
