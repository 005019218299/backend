const mongoose = require('mongoose');


const UserDetailsSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    confirmPassword: String,
    balance: Number,
    currentCode: String,
    sdtNumber: Number,



},
    {
        collection: "UserInfo"
    }
);
mongoose.model("UserInfo", UserDetailsSchema);