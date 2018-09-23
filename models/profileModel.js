const mongoose = require('mongoose');
const { User } = require('./userModel');
mongoose.Promise = global.Promise;

const wishListSchema = mongoose.Schema({
    wishItem: String,
    created: {
        type: Date,
        default: Date.now
    }
});

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
    wishList: [wishListSchema],
    created: {
        type: Date,
        default: Date.now
    }
});




let Profile = mongoose.model('Profile', profileSchema);
let WishList = mongoose.model('WishList', wishListSchema);

module.exports = { Profile };
