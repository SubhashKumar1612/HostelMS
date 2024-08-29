const mongoose = require('mongoose');

const canteenRegistrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register', // Reference to Register model
        required: true
    },
    veg: {
        type: [String], // Array of strings for Veg items
        default: []
    },
    NonVeg: {
        type: [String], // Array of strings for Non-Veg items
        default: []
    },
    order: {
        type: String, // Order description
        default: ''
    }
});

const CanteenRegistration = mongoose.model('CanteenRegistration', canteenRegistrationSchema);

module.exports = CanteenRegistration;
