"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.postUsuarioRouter = void 0;
const express = __importStar(require("express"));
const usuario_1 = require("../../models/usuario");
exports.postUsuarioRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//Router para crear un usuario nuevo en la base de datos
exports.postUsuarioRouter.post('/register', async (req, res) => {
    bcrypt.hash(req.body.contraseña, 10, function (err, hash) {
        req.body.contraseña = hash;
        const usuario = new usuario_1.Usuario(req.body);
        usuario.equipo = ["", "", "", "", "", ""];
        try {
            usuario.save();
            res.status(201).send(usuario);
        }
        catch (error) {
            res.status(400).send(error);
        }
    });
});
//Router para logearse en la aplicacion, devuelve el token de autentificacion, nombre,id y equipo
exports.postUsuarioRouter.post('/login', async (req, res) => {
    bcrypt.hash(req.body.contraseña, 10, async function (err, hash) {
        const filter = { nombre: req.body.nombre.toString() };
        try {
            const usuario = await usuario_1.Usuario.find(filter);
            if (usuario.length !== 0) {
                bcrypt.compare(req.body.contraseña, usuario[0].contraseña, (err, data) => {
                    if (err)
                        throw err;
                    if (data) {
                        const token = jwt.sign(JSON.stringify(usuario), 'stil');
                        return res.status(200).json({ token, id: usuario[0]._id, nombre: usuario[0].nombre, equipo: usuario[0].equipo });
                    }
                    else {
                        return res.status(401).json({ msg: "Invalid credencial" });
                    }
                });
            }
            else {
                return res.status(404).json({ msg: "Usuario incorrecto" });
            }
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
});
//Funcion para verificar el token de autentificacion
function verifyToken(req, res, next) {
    if (!req.headers.authorization)
        return res.status(401).json('No autorizado');
    const token = req.headers.authorization.substr(7);
    if (token !== '') {
        const content = jwt.verify(token, 'stil');
        req.data = content;
        next();
    }
    else {
        res.status(401).json('Token vacio');
    }
}
exports.verifyToken = verifyToken;
