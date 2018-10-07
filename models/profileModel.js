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
    // _id: mongoose.Schema.Types.ObjectId,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    birthday: String,
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
}, { collection: 'Profile' });

profileSchema.methods.serialize = function() {
    return {
        owner: this.owner,
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



let jerry = new User({
        _id: new mongoose.Types.ObjectId(),
        userName: "jseinfeld",
        fullName: {
            firstName: "Jerry",
            lastName: "Seinfeld"
        },
        email: "jerry@seinfeld.com"
});
    
// jerry.save(err => {
//         if (err) console.log(err);

//         let jerrysDad = new Profile({
//             owner: jerry._id,
//             fullName: {
//                 firstName: "Morty",
//                 lastName: "Seinfeld"
//             },
//             relationship: "Dad",
//             birthday: "June 9th 1924",
//             address: "234 W 2nd Ave, NY, NY 10303"
//         });

//         jerrysDad.save(err => {
//             if (err) console.log(err);
//         });
//     });





module.exports = { Profile };
