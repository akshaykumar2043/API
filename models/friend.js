const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
// createdAt: { type: Date, default: Date.now },
},{timestamps: true});
const friend = mongoose.model('friend', userSchema);

module.exports = friend;