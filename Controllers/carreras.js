require("mongoose");
const Carreras = require("../Models/carreras");
const Caballo = require('../Models/caballos');
const Apuesta = require("../Models/apuestas");
const Usuario = require("../Models/user");

const addCarreras = async (fecha) => {
        // Obtener el número de carrera incremental
        const ultimaCarrera = await Carreras.findOne().sort({ numCarrera: -1 });
        const numCarrera = ultimaCarrera ? ultimaCarrera.numCarrera + 1 : 1;

        // Seleccionar hasta 7 caballos de forma aleatoria
        const caballosExistentes = await Caballo.find(); // Obtiene todos los caballos
        if (caballosExistentes.length < 7) {
            console.log("No hay caballos suficientes para crear la carrera");
            return false;
        }
        const caballosSeleccionados = caballosExistentes
            .sort(() => 0.5 - Math.random()) // Mezcla aleatoriamente
            .slice(0, 7) // Selecciona los primeros 7 caballos

            .map((caballo) => ({
                caballoId: caballo._id,
                nombre: caballo.nombre,
                cuantoPaga: parseFloat((Math.random() * (5 - 2) + 2).toFixed(2)), // Genera un valor aleatorio entre 2 y 5
            }));

        // Crear la nueva carrera
        const nuevaCarrera = new Carreras({
            fecha:fecha, // Fecha actual
            numCarrera, // Número incremental
            caballos: caballosSeleccionados,
        });

        let carrera = await nuevaCarrera.save();
        console.log("Carrera nueva");
        console.log(carrera);
        return{carrera};
};

const getAllCarreras = async(limit,offset) => {
    const carreras = await Carreras.find({}).limit(limit).skip(offset);

    return carreras;
}

const getCarrera = async(numCarrera) => {
    const result = await Carreras.findOne({ numCarrera:numCarrera});

    return result;
}

const deleteCarrera = async(numCarrera) => {
    const result = await Carreras.findOneAndDelete({ numCarrera:numCarrera});

    return result;
}

const procesarCarrera = async (numCarrera) => {
    // Buscar la carrera en la base de datos
    const carrera = await Carreras.findOne({ numCarrera });
    if (!carrera) {
        throw new Error("Carrera no encontrada");
    }

    const ahora = new Date();
    const fechaCarrera = new Date(carrera.fecha);

    if (fechaCarrera > ahora) {
        throw new Error("La carrera no ha finalizado aún");
    }

    // Seleccionar un caballo ganador de manera aleatoria
    const caballos = carrera.caballos;
    if (!caballos || caballos.length === 0) {
        throw new Error("No hay caballos registrados para esta carrera");
    }

    const caballoGanador = caballos[Math.floor(Math.random() * caballos.length)];
    console.log(`El caballo ganador es: ${caballoGanador.nombre}`);

    // Buscar todas las apuestas de esta carrera
    const apuestas = await Apuesta.find({ numCarrera });

    if (!apuestas || apuestas.length === 0) {
        console.log("No hay apuestas para esta carrera");
        return { ganador: caballoGanador.nombre, mensaje: "Sin apuestas" };
    }

    // Procesar pagos
    const usuariosGanadores = [];
    for (const apuesta of apuestas) {
        if (apuesta.nomCaballo === caballoGanador.nombre) {
            // Buscar al usuario que realizó la apuesta
            const usuario = await Usuario.findById(apuesta.usuarioId);
            if (!usuario) {
                console.error(`Usuario no encontrado para la apuesta ID: ${apuesta._id}`);
                continue;
            }

            // Calcular pago y actualizar el saldo del usuario
            const pago = apuesta.dinApostado * caballoGanador.cuantoPaga;
            usuario.dinero += pago;

            usuariosGanadores.push({
                usuario: `${usuario.nombre} ${usuario.apellido} (${usuario.email})`,
                apuesta: apuesta.dinApostado,
                pago: pago.toFixed(2),
            });

            // Guardar los cambios en el usuario
            await usuario.save();
        }
    }

    // Resultado final
    if (usuariosGanadores.length === 0) {
        console.log("No hay ganadores para esta carrera");
        return { ganador: caballoGanador.nombre, mensaje: "Sin ganadores" };
    } else {
        console.log("Ganadores procesados:", usuariosGanadores);
        return { ganador: caballoGanador.nombre, ganadores: usuariosGanadores };
    }
};


module.exports = { addCarreras, getAllCarreras, getCarrera, deleteCarrera, procesarCarrera}