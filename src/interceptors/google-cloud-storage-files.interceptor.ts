import { CallHandler, ExecutionContext, Injectable, Logger, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable } from 'rxjs';
import { GoogleCloudStorageService } from '../google-cloud-storage.service';
import { GoogleCloudStoragePerRequestOptions } from '../interfaces';


export function GoogleCloudStorageFilesInterceptor(
  fieldName: string,
  localOptions?: MulterOptions,
  gcloudStorageOptions?: Partial<GoogleCloudStoragePerRequestOptions>,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    public interceptor: NestInterceptor;

    constructor(private readonly gcloudStorage: GoogleCloudStorageService) {
      this.interceptor = new (FilesInterceptor(fieldName, 20, localOptions))();
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      (await this.interceptor.intercept(context, next)) as Observable<any>;

      const request = context.switchToHttp().getRequest();

      const files = request[fieldName];

      if (!files.length) {
        Logger.error(
          `Can not intercept field "${fieldName}".`,
        );
        return;
      }

      for (const file of files) {
        file.storageUrl = await this.gcloudStorage.upload(file, gcloudStorageOptions);
      }

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}

/*
This file is a partial modification of the following project:
Full project source: https://github.com/Aginix/nestjs-gcloud-storage
Copyright 2021 by Sam Aginix (https://github.com/Aginix).
All rights reserved.
 */
