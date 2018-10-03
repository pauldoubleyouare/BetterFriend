const mongoose = require('mongoose');
const { Profile } = require('./profileModel');


mongoose.Promise = global.Promise;


const userSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    userName: {
        type: String, 
        required: true,
    },
    fullName: {
        firstName: {type: String, required: true},
        lastName: {type: String}
    },
    email: {type: String, required: true},
    profiles: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Profile'
    }],
    created: {
        type: Date,
        default: Date.now
    }
}, {collection: 'User'});


// what this is doing, is creating a method .serialize that allows us 
//to control what data we're going to be responding with (which gets called in server.js)
userSchema.methods.serialize = function() {
    return {
        id: this._id,
        userName: this.userName,
        fullName: this.fullName.firstName + " " + this.fullName.lastName,
        // firstName: this.fullName.firstName,
        // lastName: this.fullName.lastName,
        email: this.email
    };
};

const User = mongoose.model('User', userSchema, 'Users');



// <=======Creating a fake user=========>
// let garfield = new User({
//     userName: "garfield",
//     fullName: {
//         firstName: "Gar",
//         lastName: "Field"
//     },
//     email: "gar@field.com"
// });

// garfield.save(err => {
//     if (err) {
//         console.log(err)
//     }
// });



module.exports = { User };
// module.exports = garfield;
