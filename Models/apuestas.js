const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apuestaSchema = new Schema({
    usuarioId:{
        type:ObjectId,
        requiered:true
    },
    fecha:{
        type:Date,
        requiered:true
    },
    nomCaballo:{
        type:String,
        requiered:true
    },
    dinApostado:{
        type:Number,
        requiered:true
    },
    numCarrera:{
        type:Number,
        requiered:true
    }
},{timestamps:true}).set('toJSON',{
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
})

const apuesta = mongoose.model('apuestas',apuestaSchema);
module.exports = apuesta;