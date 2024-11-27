require("mongoose");
const Apuesta = require("../Models/apuestas");
const Carrera = require("../Models/carreras");
const Usuario = require("../Models/user");

const addApuesta = async (usuarioId, nombreCaballo, numCarrera, montoApostado) => {
    
    const numCarreraInt = parseInt(numCarrera,10);
    const carrera = await Carrera.findOne({ numCarrera:numCarreraInt });
    if (!carrera) {
        throw new Error('Carrera no encontrada');
    }
    
    const ahora = new Date();
    const fechaCarrera = new Date(carrera.fecha);
    if (fechaCarrera < ahora) { 
        throw new Error('No se pueden realizar apuestas porque la carrera ya ha comenzado');
    }

    // Buscar el usuario
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }
 
    if (usuario.dinero < montoApostado) {
        console.log("if dinero");
        throw new Error('El usuario no tiene suficiente dinero para realizar la apuesta');
    }
    
    const nuevaApuesta = new Apuesta({
        usuarioId:usuarioId,
        fecha: ahora, 
        nomCaballo:nombreCaballo,
        dinApostado:montoApostado,
        numCarrera:numCarrera
    });

    // Guardar la apuesta en la base de datos
    let apuestaGuardada = await nuevaApuesta.save();
    console.log('Apuesta nueva guardada:', apuestaGuardada);
    
    usuario.dinero -= montoApostado;

    // Agregar la apuesta al arreglo de apuestas del usuario
    try{
        usuario.apuestas.push({
            fecha:apuestaGuardada.fecha,
            nomCaballo:apuestaGuardada.nomCaballo,
            dinApostado:apuestaGuardada.dinApostado,
            numCarrera:apuestaGuardada.numCarrera
        });
        await usuario.save();
    }catch(error){
        console.log(error);
    }

    console.log('Apuesta añadida al usuario');
    return { apuesta: apuestaGuardada };
};

module.exports = { addApuesta }