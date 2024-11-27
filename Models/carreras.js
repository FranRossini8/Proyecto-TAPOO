const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carreraSchema = new Schema({
    fecha:{
        type:Date,
        requiered:true
    },
    numCarrera:{
        type:Number,
        requiered:true
    },
    caballos:[{
        caballoId:{type:ObjectId},
        nombre:{type:String},
        cuantoPaga:{type:Number}
    }]
},{timestamps:true}).set('toJSON',{
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
})

const carrera = mongoose.model('carreras',carreraSchema);
module.exports = carrera;