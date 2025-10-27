
import Photo_accesoire from "../models/photo_accesoire.model.js"
import photo_accesoireValidation from "../validations/photo_accesoire.validation.js"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createPhoto_accesoire = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
            return res.status(400).json({message: "No data in the request"})
        }
        if(req.file){
            body.name = req.protocol+'://'+req.get("host")+'/uploads/'+req.file.filename
        }
        const {error} = photo_accesoireValidation(body).photo_accesoireCreate
        if(error){
            if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
            return res.status(401).json(error.details[0].message)
        }
        const photo_accesoire = new Photo_accesoire(body)
        const newPhoto_accesoire = await photo_accesoire.save()
        return res.status(201).json(newPhoto_accesoire)        
    } catch (error) {
        console.log(error)
        if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getAllPhoto_accesoires = async(req, res) => {
    try {
        const photo_accesoires = await Photo_accesoire.find()
        return res.status(200).json(photo_accesoires)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getPhoto_accesoireById = async(req,res) => {
    try {
        const photo_accesoire = await Photo_accesoire.findById(req.params.id)
        if(!photo_accesoire){
            return res.status(404).json({message: "photo_accessoire n'existe pas"})
        }
        return res.status(200).json(photo_accesoire)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const deletePhoto_accesoire = async(req, res) => {
    try {
        const photo_accesoire = await Photo_accesoire.findById(req.params.id)
        if(!photo_accesoire){
            return res.status(404).json({message: "photo_accessoire n'existe pas"})
        }
        if(photo_accesoire.name){
            const oldPath = path.join(__dirname, '../uploads/', photo_accesoire.name.split('/').at(-1))
            if(fs.existsSync(oldPath)) {fs.unlinkSync(oldPath)}
        }
        await photo_accesoire.deleteOne()
        return res.status(200).json({message: "photo_accesoire has been deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

export { createPhoto_accesoire, getAllPhoto_accesoires, getPhoto_accesoireById, deletePhoto_accesoire }