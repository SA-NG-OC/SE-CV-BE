// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'nest_uploads',
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Không nhận được kết quả trả về từ Cloudinary'));
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadDocument(file: Express.Multer.File): Promise<any> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: 'se_cv_resumes',
                    resource_type: 'image',
                    format: 'pdf',
                    pages: true,
                    type: 'upload',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
            upload.end(file.buffer);
        });
    }
}