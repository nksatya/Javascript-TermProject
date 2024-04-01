// Assignment done by:
//      Satya Nilamegam Kumaran - C0886405
//      Mani Rathna Reddy Bellamkonda - C0887487
//      Karthik Saride - C0886429
//      Ravi Varman Ravichandran - C0885920
// This js file has the schema of user and car entities.

const mongoose = require('mongoose');

// Define User schema for MongoDB
const UserSchema = new mongoose.Schema({
    email: String, //Email field
    username: String, // Username field
    password: String, // Password field
    role: { type: String, enum: ['salesperson', 'admin'], default: 'salesperson' } // Role field with default value 'student'
});

const CarSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: String,
    price: String,
    color: String,
    vin: Number,
    variant: String,
    engineCapacity: String,
    gasType: String,
    isAutomatic: Boolean
});


const User = mongoose.model('User', UserSchema); // Create a User model
const Car = mongoose.model('Car', CarSchema); // Create a Car model

module.exports = { User, Car }