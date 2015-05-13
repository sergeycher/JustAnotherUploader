# JustAnotherUploader
Just another Javascript files uploader. No dependencies.
## Usage
    <script src="JAU.js"></script>
    <link rel="stylesheet" href="JAU.css">
-
    <input type="file" id="uploader" multiple name="files">
-
    var uploader = new JAUploader(document.getElementById('uploader'), options);
    
## options
### options.locale
    options.locale = "ru";
or

    options.locale = "en";
    
More localizations can be added in src/localization.js

### options.additionalData
{} by default. This object will be sent to server with each uploaded file.

### options.autoupload
It's true by default. Set to false if you want to see "Upload" button.

## API

### onUploadComplete(event, xhr)
### onUploadError(event, xhr)
### onFileAdd(jauFile)
