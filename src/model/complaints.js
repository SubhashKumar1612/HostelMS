const mongoose = require('mongoose');

// Define the schema for complaints
const complaintSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Rooms Related', 'Food Related', 'Canteen', 'Fees', 'Other']
    },
    message: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model from the schema
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
