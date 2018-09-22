const mongoose = require('mongoose');
const { User } = require('./userModel');
mongoose.Promise = global.Promise;

const profileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
    email: String,
    relationship: String,
    birthday: Date,
    address: {
        streetName: String,
        city: String,
        state: String,
        zipcode: Number
    },
    phone: String,
    wishList: [
        {
            wishItem: String,
            created: {
                type: Date,
                default: Date.now
            }
        }
    ],
    created: {
        type: Date,
        default: Date.now
    }
});

let Profile = mongoose.model('Profile', profileSchema);



module.exports = { Profile };
