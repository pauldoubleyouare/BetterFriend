const mongoose = require('mongoose');
const { User } = require('./userModel');
const garfield = require('./userModel');
mongoose.Promise = global.Promise;

const wishListSchema = mongoose.Schema({
    wishItem: String,
    created: {
        type: Date,
        default: Date.now
    }
});

const profileSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fullName: {
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
    wishList: [{wishListSchema}],
    created: {
        type: Date,
        default: Date.now
    }
});

profileSchema.methods.serialize = function() {
    return {
        // userName: User.email,
        fullName: this.fullName.firstName + " " + this.fullName.lastName,
        relationship: this.relationship,
        email: this.email,
        birthday: this.birthday,
        address: this.address,
        phone: this.phone
    }
}

let Profile = mongoose.model('Profile', profileSchema, 'Profiles');
let WishList = mongoose.model('WishList', wishListSchema);

//<==========Creating a fake profile, attached to a user ========>
// let mom = new Profile({
//     fullName: {
//         firstName: "Momfield",
//         lastName: "Garfield"
//     } ,
//     relationship: "Mother",
//     userName: garfield._id 
// });

// mom.save(err => {
//     if (err) {
//         console.log(err);
//     }
// });

module.exports = { Profile };
