import {
    BadGatewayException,
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    mixin,
    NestInterceptor,
    Type
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {MulterOptions} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import {Observable} from 'rxjs';

import {GoogleCloudStoragePerRequestOptions} from '../interfaces';
import {GoogleCloudStorageService} from '../google-cloud-storage.service';



export function GoogleCloudStorageFileInterceptor(
    fieldName: string,
    localOptions?: MulterOptions,
    googleClodudStorageOptions?: Partial<GoogleCloudStoragePerRequestOptions>,
): Type<NestInterceptor> {

    @Injectable()
    class GoogleCloudStorageFileInterceptorMixin implements NestInterceptor {

        public interceptor: NestInterceptor;

        constructor(
            private readonly _googleCloudStorageService: GoogleCloudStorageService,
        ) {
            this.interceptor = new (FileInterceptor(fieldName, localOptions))();
        }

        async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
            const localInterceptor = (await this.interceptor.intercept(context, next)) as Observable<any>;
            const request = context.switchToHttp().getRequest();
            // console.log('request', request.file);
            const file = request.file;

            if (!file || (file && file.fieldname !== fieldName)) {
                Logger.error(
                    'Error on intercept file: ',
                    `File with fieldName: "${fieldName}" not found`,
                );
                throw new BadGatewayException({
                        message: `Error on intercept file:
                    File with fieldName: "${fieldName}" not found`
                    },
                );
            }
            file.storageUrl = await this._googleCloudStorageService.upload(file, googleClodudStorageOptions);
            return next.handle();
        }
    }

    return mixin(GoogleCloudStorageFileInterceptorMixin);
}

/*
This file is a partial modification of the following project:
Full project source: https://github.com/Aginix/nestjs-gcloud-storage
Copyright 2021 by Sam Aginix (https://github.com/Aginix).
All rights reserved.
 */