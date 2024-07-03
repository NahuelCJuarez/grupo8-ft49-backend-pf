import { Injectable } from '@nestjs/common';
import { getStorage, ref, uploadBytes } from "firebase/storage";

@Injectable()
export class FirebaseService {
    async uploadFile(file): Promise<string>{
        const storage = getStorage();
        
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        
        const filePath = `${year}/${month}/${file.originalname}`;
        const storageRef = ref(storage, filePath);

        try {
            await uploadBytes(storageRef, file.buffer);
            console.log('Archivo subido a la nube');
            return 'Archivo subido exitosamente';
        } catch (error) {
            throw new Error(error);
        }
    }
}