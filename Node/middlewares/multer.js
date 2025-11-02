
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
})