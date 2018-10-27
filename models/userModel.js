const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const userSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    userName: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        firstName: {type: String, required: true},
        lastName: {type: String}
    },
    email: {type: String, required: true},
    // profiles: [{
    //     type: mongoose.Schema.Types.ObjectId, ref: 'Profile'
    // }],
    created: {
        type: Date,
        default: Date.now
    }
}, {collection: 'User'});


// what this is doing, is creating a method .serialize that allows us 
//to control what data we're going to be responding with (which gets called in server.js)
userSchema.methods.serialize = function() {
    console.log('user:', this);
    return {
        id: this._id,
        userName: this.userName,
        fullName: this.fullName.firstName + " " + this.fullName.lastName,
        // firstName: this.fullName.firstName,
        // lastName: this.fullName.lastName,
        email: this.email,
        profiles: this.profiles
    };
};

const User = mongoose.model('User', userSchema, 'Users');



//*********How do I create a user with populated profiles and vice versa (creating profles to link to users)*********  */
// for instance, would I do like... mongoose.schema.User.username? inside of profiles?
// and inside of profiles - would I do mongoose.schema.Profile.id? 
// do I manually save them to that specific User/Profile
// and, when I'm creating a profile - how do I save that profile to an item in the array of Profiles underneath user?





module.exports = { User };
