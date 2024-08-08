var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const swapSchema = new mongoose.Schema(
    {
        tokenFrom: { type: String, required: true },
        tokenTo: { type: String, required: true },
        amountFrom: { type: Number, required: true },
        amountTo: { type: Number, required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        timestamps: { type: Date, default: Date.now() },
        fee: { type: Number, default: 0 }
    })


const Swap = new mongoose.model("Swap", swapSchema);
module.exports = Swap;