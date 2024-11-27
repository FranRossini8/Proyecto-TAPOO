require("mongoose");
const User = require("../Models/user");

const addUser = async (email,nombre,apellido,password,dinero) => {
    let existUser = await User.findOne({ nombre:nombre });
    console.log(existUser);
    
    if(!existUser){
        const cryptoPass = require('crypto')
        .createHash('sha256')
        .update(password)
        .digest('hex');

        const usr = new User(
            {
                email:email,
                nombre:nombre,
                apellido:apellido,
                password:cryptoPass,
                dinero:dinero,
                apuestas:[]
            }
        );

        let user = await usr.save();
        console.log("nuevo usuario");
        console.log(user);
        return {user};
}else{
    return false;
}
}

const getAllUser = async(limit,offset) => {

    const users = await User.find({}).limit(limit).skip(offset);

    return users;
}

const getUser = async(id) => {
    const user = await User.findById(id);

    return user;
}

const getUserByEmail = async(email,req,res) => {

    const user = await User.findOne({ email:email });

    return user;
}


const editUser = async(user) => {
    const result = await User.findByIdAndUpdate(user._id,user,{new:true});

    return result;
}

const deleteUser = async(id) => {
    const result = await User.findOneAndDelete(id);

    return result;
}

const getApuestas = async(req, res) => {
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"});
        }
        let apuestas = [];
        for(let apuesta of user.apuestas){
            apuestas.push(apuesta);
        }
        return res.json({apuestas:apuestas});
    }catch(error){
        res.status(500).json({message:"Error del servidor"});
    }
}

module.exports = {addUser, getUser, getAllUser, editUser, deleteUser, getUserByEmail, getApuestas}