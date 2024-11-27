const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    nombre:{
        type:String,
        requiered:true
    },
    apellido:{
        type:String,
        requiered:true
    },
    password:{
        type:String,
        requiered:true
    },
    dinero:{
        type:Number,
        requiered:true
    },
    apuestas:[{
        fecha:{type:Date},
        nomCaballo:{type:String},
        dinApostado:{type:Number},
        numCarrera:{type:Number}
    }]
},{ timestamps:true }).set('toJSON',{
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
})

const User = mongoose.model('user',userSchema);
module.exports = User;
