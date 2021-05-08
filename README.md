# Google Cloud Storage 


## Setup

Import the module with your bucket name.

``` typescript

import { GoogleCloudStorageModule } from '@nest-excalibur/google-cloud-storage/lib';

@Module({
    imports: [
        GoogleCloudStorageModule
            .register({bucketDefaultName: '<bucket-name>'}),
    ],
})
export class SomeModule {
}
```

> Don't forget to export your google-cloud credentials before start the server.

Inject the google-cloud-service in your controller

``` typescript
import { GoogleCloudStorageService } from '@nest-excalibur/google-cloud-storage/lib';

@Controller('some')
export class SomeController {

    constructor(
        private readonly _googleCloudStorageService: GoogleCloudStorageService,
    ) {
    }
}
```

Use the service to store a file

``` typescript
    @Post('upload-picture')
    @UseInterceptors(
        FileInterceptor('picture'),
    )
    async uploadPicture(
            @UploadedFile() pictureFile: UploadedFileMetadata,
    ){
       try {
          return  await this._googleCloudStorageService.upload(pictureFile);
       }catch (error) {
          throw new InternalServerErrorException('Error on Upload');
       }
    }
```

### GoogleCloudStorageFileInterceptor

You can use the `GoogleCloudStorageFileInterceptor` to store a file
using a specific folder/prefix name.

``` typescript
import { GoogleCloudStorageFileInterceptor } from '@nest-excalibur/google-cloud-storage/lib';
```

``` typescript
    @Post('upload-picture')
    @UseInterceptors(
        GoogleCloudStorageFileInterceptor(
            'picture', 
            undefined, 
            { 
              prefix: 'pictures'
            }
        )
    )
    async uploadPicture(
        @UploadedFile() pictureFile
    ){
            return  pictureFile;
    }
```