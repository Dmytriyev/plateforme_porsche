#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { generateSchemaFields, generateValidationFieldsForCreate, check, capitalize } from './functions.js'

const [,, modelName, ...fields] = process.argv;

const modelsDir = path.join(process.cwd(), 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
  console.log("📁 Directory 'models' created");
}

const validationsDir = path.join(process.cwd(), 'validations');

if (!fs.existsSync(validationsDir)) {
  fs.mkdirSync(validationsDir);
  console.log("📁 Directory 'validation' created");
}

const controllersDir = path.join(process.cwd(), 'controllers');

if (!fs.existsSync(controllersDir)) {
  fs.mkdirSync(controllersDir);
  console.log("📁 Directory 'controllers' created");
}

const routersDir = path.join(process.cwd(), 'routes');

if (!fs.existsSync(routersDir)) {
  fs.mkdirSync(routersDir);
  console.log("📁 Directory 'routes' created");
}

const middlewareDir = path.join(process.cwd(), 'middlewares');

if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir);
  console.log("📁 Directory 'middleware' created");
}

const templateModel = `import mongoose from 'mongoose';

const ${modelName}Schema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
${generateSchemaFields(fields)}
}, { timestamps: true });

export default mongoose.model('${capitalize(modelName)}', ${modelName}Schema);
`;

const templateValidation = `import joi from "joi";
export default function ${modelName}Validation(body){
    const ${modelName}Create = joi.object({
      name: joi.string().required(),
      alt: joi.string().required(),
    ${generateValidationFieldsForCreate(fields)}
    })

    return {
        ${modelName}Create: ${modelName}Create.validate(body),
    }
}
`;

const templateController = `
import ${capitalize(modelName)} from "../models/${modelName}.model.js"
import ${modelName}Validation from "../validations/${modelName}.validation.js"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const create${capitalize(modelName)} = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
            return res.status(400).json({message: "No data in the request"})
        }
        if(req.file){
            body.name = req.protocol+'://'+req.get("host")+'/uploads/'+req.file.filename
        }
        const {error} = ${modelName}Validation(body).${modelName}Create
        if(error){
            if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
            return res.status(401).json(error.details[0].message)
        }
        const ${modelName} = new ${capitalize(modelName)}(body)
        const new${capitalize(modelName)} = await ${modelName}.save()
        return res.status(201).json(new${capitalize(modelName)})        
    } catch (error) {
        console.log(error)
        if(req.file){fs.unlinkSync("./uploads/"+req.file.filename)}
        res.status(500).json({message: "Server error", error: error})
    }
}

const getAll${capitalize(modelName)}s = async(req, res) => {
    try {
        const ${modelName}s = await ${capitalize(modelName)}.find()
        return res.status(200).json(${modelName}s)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const get${capitalize(modelName)}ById = async(req,res) => {
    try {
        const ${modelName} = await ${capitalize(modelName)}.findById(req.params.id)
        if(!${modelName}){
            return res.status(404).json({message: "${modelName} doesn't exist"})
        }
        return res.status(200).json(${modelName})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const delete${capitalize(modelName)} = async(req, res) => {
    try {
        const ${modelName} = await ${capitalize(modelName)}.findById(req.params.id)
        if(!${modelName}){
            return res.status(404).json({message: "${modelName} doesn't exist"})
        }
        if(${modelName}.name){
            const oldPath = path.join(__dirname, '../uploads/', ${modelName}.name.split('/').at(-1))
            if(fs.existsSync(oldPath)) {fs.unlinkSync(oldPath)}
        }
        await ${modelName}.deleteOne()
        return res.status(200).json({message: "${modelName} has been deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

export { create${capitalize(modelName)}, getAll${capitalize(modelName)}s, get${capitalize(modelName)}ById, delete${capitalize(modelName)} }`

// Contenu du router
const templateRouter = `
import { Router } from "express";
import { create${capitalize(modelName)}, getAll${capitalize(modelName)}s, get${capitalize(modelName)}ById, delete${capitalize(modelName)} } from "../controllers/${modelName}.controller.js"
import { upload } from "../middlewares/multer.js"

const router = Router()

router.post('/new', upload.single('name'), create${capitalize(modelName)})
router.get('/all', getAll${capitalize(modelName)}s)
router.get('/:id', get${capitalize(modelName)}ById)
router.delete('/:id', delete${capitalize(modelName)})

export default router`

const templateMulter = `
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '../uploads')
if(!fs.existsSync(uploadDir)) {fs.mkdirSync(uploadDir, {recursive: true})}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const baseName = path.basename(file.originalname, ext)
        cb(null, baseName+'_'+Date.now()+ext)
    }
})

const fileFilter = (req, file, cb) => {
    // you can select here which mimetypes are allowed
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
    if(allowedMimeTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error("Type de fichier non autorisé"), false)
    }
}

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    // you can choose here the max size of the uploaded files and the allowed number of files
    limits: { 
        fileSize: 5 * 1024 * 1024,
        files: 5, 
    }
})`

const outputModelPath = path.join(modelsDir, `${modelName}.model.js`);
const outputValidationPath = path.join(validationsDir, `${modelName}.validation.js`);
const outputControllerPath = path.join(controllersDir, `${modelName}.controller.js`);
const outputRouterPath = path.join(routersDir, `${modelName}.route.js`);
const outputMulterPath = path.join(middlewareDir, `multer.js`);

check(outputModelPath, modelName, "model")
check(outputControllerPath, modelName, "controller")
check(outputRouterPath, modelName, "route")
check(outputValidationPath, modelName, "validation")
if (fs.existsSync(outputMulterPath)) {
  console.error(`❌ The file auth.js already exists in '/middlewares' !`);
  process.exit(1);
}

fs.writeFileSync(outputModelPath, templateModel);
console.log(`✅ Model '${modelName}' created with success in 'models/${modelName}.model.js'`);
fs.writeFileSync(outputValidationPath, templateValidation);
console.log(`✅ Validation '${modelName}' created with success in 'validation/${modelName}.validation.js'`);
fs.writeFileSync(outputControllerPath, templateController);
console.log(`✅ Controller '${modelName}' created with success in 'controllers/${modelName}.controller.js'`);
fs.writeFileSync(outputRouterPath, templateRouter);
console.log(`✅ Route '${modelName}' created with success in 'routes/${modelName}.route.js'\n`);
console.log(`Don't forget to add app.use('/${modelName}', ${modelName}Routes) in server.js\n`)
fs.writeFileSync(outputMulterPath, templateMulter);
console.log(`✅ Middleware 'multer.js' created with success in 'middleware/'\n`)
console.log("Don't forget to install multer")
