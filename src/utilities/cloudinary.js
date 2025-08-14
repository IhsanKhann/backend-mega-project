// here we make a function, that function is basically used to upload the file to the cloudinary server.
// flow: client/frontend -> fileUpload -> server temporary stored -> cloudinary store -> server delete the temporary file -> send the cloudinary url to the client/frontend
// file upload -> response is a url from cloudinary of image/video whatever

import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // to remove file from server we use fs. fs is basically used for file handling
import config from "../config/config.js";

// configure it as well here:
cloudinary.config({ 
        cloud_name: config.CLOUDINARY_CLOUD_NAME,
        api_key: config.CLOUDINARY_API_KEY,
        api_secret: config.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = async(fileURLToPath) => {
    try{
        if(!fileURLToPath) return null;

        // else: upon success
        const result = await cloudinary.uploader.upload(fileURLToPath,{
            resource_type:"auto",
        })

        console.log(result)
        // fs.unlinkSync(fileURLToPath); fix it later.
        // sends back a url
        return result ;
    }
    catch(error){
        console.log(error);
        fs.unlinkSync(fileURLToPath);
        throw error;
    }
}

export default uploadFileToCloudinary;


