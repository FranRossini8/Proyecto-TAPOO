const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const caballoSchema = new Schema({
    nombre:{
        type:String,
        requiered:true
    },
    carreraId:{
        type:ObjectId,
        requiered:true
    }
},{ timestamps:true }).set('toJSON',{
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
})

const Caballo = mongoose.model('caballos',caballoSchema);
module.exports = Caballo;