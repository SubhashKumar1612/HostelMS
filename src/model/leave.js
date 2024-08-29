const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    leaveDate: {
        type: Date,
        required: true,
    },
    leaveTo: {
        type: String,
        required: true,
    },
    leaveReason: {
        type: String,
        required: true,
    },
    userId: { // This should match the field name used in your POST route
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register', // Make sure this matches the name of your user model
        required: true
    }
}, {
    timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
