require("mongoose");
const Caballo = require("../Models/caballos");

const addCaballo = async(nombre, carreraId) => {
    let existCaballo = await Caballo.findOne({ nombre:nombre });
    console.log(existCaballo);

    if(!existCaballo){
        const cab = new Caballo(
            {
                nombre:nombre,
                carreraId:carreraId
            }
        );
        let caballo = await cab.save();
        console.log("caballo nuevo");
        console.log(caballo);
        return{caballo};
    }else{
        return false;
    }
}

const getAllCaballos = async(limit,offset) =>{
    const caballos = await Caballo.find({}).limit(limit).skip(offset);

    return caballos;
}

const getCaballo = async(id) => {
    const caballo = await Caballo.findById(id);

    return caballo;
}

const editCaballo = async (caballo) => {
    const result = Caballo.findByIdAndUpdate(caballo._id, caballo,{new:true});

    return result;
}

const deleteCaballo = async(id) => {
    const result = Caballo.findByIdAndDelete(id);

    return result;
}
    
module.exports = { addCaballo, getAllCaballos, getCaballo, editCaballo, deleteCaballo}

