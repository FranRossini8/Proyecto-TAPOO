const jwt = require('jsonwebtoken');
const User = require('../Controllers/user');

exports.logearse = async(req, res) => {
    const user = await User.getUserByEmail(req.body.email, req, res);

    if(user == null){
        return res.status(400).json({ message:'No se encontro el usuario'});
    }
    try{
        const cryptoPass = require('crypto')
        .createHash('sha256')
        .update(req.body.password)
        .digest('hex');
        if(cryptoPass === user.password){
            const token = jwt.sign({user:user,id:user._id},process.env.JWT_SECRET);
            res.json({token:token});
        }else{
            res.json({message:'Contraseña incorrecta'});
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
};

