const mongoose = require('mongoose');

const sportRegistrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clubs: {
        type: [String],
        enum: ['Kho-Kho', 'Kabaddi', 'Football', 'Cricket'],
        required: true,
    },
}, {
    timestamps: true
});

const SportRegistration = mongoose.model('SportRegistration', sportRegistrationSchema);

module.exports = SportRegistration;
