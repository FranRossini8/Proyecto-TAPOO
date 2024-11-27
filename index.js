require('dotenv').config();
const express = require("express");
const app = express();
app.use(express.json());
const uri = process.env.DB_URL;
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const cors = require("cors");

const user = require("../Proyecto-TAPOO/Controllers/user");
const caballo = require("../Proyecto-TAPOO/Controllers/caballos");
const carrera = require("../Proyecto-TAPOO/Controllers/carreras");
const apuesta = require("../Proyecto-TAPOO/Controllers/apuestas");
const auth = require("../Proyecto-TAPOO/Controllers/auth");
const authenticateToken = require("../Proyecto-TAPOO/Middleware/authenticateToken");
const { error } = require('console');

mongoose.connect(uri, {})
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB Atlas:', err);
    });

app.post("/",(req,res) => {
    res.send("Llamada post");
})
      
app.listen(PORT,()=>{
    console.log(`servidor corriendo ${PORT}`);
})
  
module.exports = app;

//CREAR USUARIO
app.post("/user",async(req,res)=>{
    let email = req.body.email;
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let password = req.body.password;
    let dinero = req.body.dinero;

    try{
        const result = await user.addUser(email,nombre,apellido,password,dinero);
        if(result){
            res.status(200).send("Usuario creado!!");
        }else{
            res.status(404).send("Error, ya existe el usuario que quieres crear");
        }
    }catch(error){
        console.log(error);
        res.status(500).send("Ocurrio un error");
    }
});

//OBTENER TODOS LOS USERS
app.get("/user",cors(),async(req,res) => {
    try{
        const result = await user.getAllUser();
        res.status(200).send(result)
    }catch(error){
        res.status(500).send("Ocurrio un error al obtener todos los usuarios");
    }
});

//OBTENER UN USUARIO
app.get("/user/:id",cors(),async(req,res) => {
    let id = req.params.id;
    try{
        usuario = await user.getUser(id);
        res.status(200).send(usuario);
    }catch(error){
        res.status(500).send("Error al buscar el usuario");
    }
});

//MODIFICAR UN USUARIO
app.put("/user/:id",async(req,res) => {
    let id = req.params.id;
    const usr = {_id: id, ...req.body};

    try{
        const result = await user.editUser(usr);
        if(result){
            res.status(200).json(result);
        }else{
            res.status(404).send("El usuario ingresado por parametro no existe");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
});

//Eliminar un usuario
app.delete("/user/:id",async(req,res) => {
    try{
        const result = await user.deleteUser(req.params.id);
        if(result){
            res.status(200).send("Se ha eliminado el usuario correctamente");
        }else{
            res.status(404).send("No se ha encontrado el usuario ingresado por parametro");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error mientras se intento borrar el usuario");
    }
})

//CREAR CABALLO
app.post("/caballo",async(req,res) => {
    let nombre = req.body.nombre;
    
    try{
        try{
            const result = await caballo.addCaballo(nombre);
            if(result){
                res.status(200).send("Caballo creado!!");
            }else{
                res.status(404).send("Error, ya existe el caballo que quieres crear");
            }
        }catch(error){
            console.log(error);
            res.status(500).send("Ocurrio un error");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error creando los caballos");
    }
})

//GET TODOS LOS CABALLOS
app.get("/caballo",cors(),async(req,res) => {
    try{
        const result = await caballo.getAllCaballos();
        res.status(200).send(result);
    }catch(error){
        res.status(500).send("Error al obtener todos los caballos");
    }
})

//GET DE UN CABALLO
app.get("/caballo/:id",cors(),async(req,res) => {
    let id = req.params.id;
    try{
        cab = await caballo.getCaballo(id);
        res.status(200).send(cab);
    }catch(error){
        res.status(500).send("Error al buscar el caballo");
    }

})

//MODIFICAR UN CABALLO
app.put("/caballo/:id",async(req,res) => {
    let id = req.params.id;
    const cbl = {_id: id, ...req.body};

    try{
        const result = await caballo.editCaballo(cbl);
        
        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send("No se ha encontrado el caballo");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
})

//ELIMINAR UN CABALLO
app.delete("/caballo/:id", async(req,res) => {
    try{
        const result = caballo.deleteCaballo(req.params.id);
        if(result){
            res.status(200).send("Se ha eliminado el caballo correctamente");
        }else{
            res.status(404).send("No se encontro el caballo ha eliminar");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
})

//CREAR UNA CARRERA
app.post("/carrera", async(req,res) => {
    let fecha = req.body.fecha;
    try{
        const result = carrera.addCarreras(fecha);
        if(result){
            res.status(200).send("Carrera creada!!");
        }
    }catch(error){
        res.status(500).send(error);
    }
})

//GET TODAS LAS CARRERAS
app.get("/carrera", cors(), async(req,res) => {
    try{
        const result = await carrera.getAllCarreras();
        
        res.status(200).send(result);
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
})

//GET DE UNA CARRERA
app.get("/carrera/:numCarrera",cors(), async(req,res) => {
    let numCarrera = req.params.numCarrera;

    try{
        car = await carrera.getCarrera(numCarrera);
        res.status(200).send(car);
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
})

//ELIMINAR UNA CARRERA
app.delete("/carrera/:numCarrera", async(req,res) => {
    try{
        const result = await carrera.deleteCarrera(req.params.numCarrera);
        if(result){
            res.status(200).send("Se ha eliminado la carrera correctamente");
        }else{
            res.status(404).send("No se ha encontrado la carrera ha eliminar");
            console.log("status404");
        }
    }catch(error){
        res.status(500).send("Ha ocurrido un error");
    }
})

//CREAR APUESTA
app.post("/apuesta", authenticateToken, async(req,res) => {
    let dinApostado = req.body.dinApostado;
    let nomCaballo = req.body.nomCaballo;
    let numCarrera = req.body.numCarrera;
    try{
        let usuarioId = req.user.id;
        const result = await apuesta.addApuesta(usuarioId, nomCaballo, numCarrera, dinApostado);
        if(result){
            res.status(200).json(result);
        }else{
            res.status(404).json(error);
        }
    }catch(error){
        res.status(500).send(error);
    }
})

//CABALLO GANADOR
app.post('/procesar-carrera', async (req, res) => {
    const numCarrera = req.body.numCarrera;
    try {
        const resultado = await carrera.procesarCarrera(numCarrera);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//INICAR SESION
app.post("/login",cors(),auth.logearse);

//APUESTAS DEL USUARIO
app.get("/apueUser", authenticateToken, user.getApuestas);