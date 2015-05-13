var build = function(input) {
    input.style.width = '0'; //hide standart browse button
    this.input = input;
    var uploader = this;

    var body = newEl('div', "jauploader-body"),
        filesContainer = newEl('div', "jauploader-files"),
        dropzone = createDropzone.call(this), //newEl('div', "jauploader-dropzone"),
        dropzoneText = newEl('div', "jauploader-dropzone_text", LOC.DRAG_HERE[this.locale]),
        dropzoneHelper = newEl('div', "jauploader-dropzone_text-helper"),
        label = newEl('label'),
        browseButton = newEl('span', "jauploader-button", LOC.BROWSE[this.locale]),
        uploadButton = null,
        progressbar = newEl('div', "jauploader-progressbar"),
        footer = newEl('div', "jauploader-footer");

    if (!this.autoupload) {
        uploadButton = newEl('span', "jauploader-button", LOC.UPLOAD[this.locale]);
        
        uploadButton.addEventListener('click', function() {
            uploader.upload();
        });
    };

    this.filesContainer = filesContainer;
    this._progressbar = progressbar;

    input.parentElement.insertBefore(body, input);

    this.el = assembleElements(body, [dropzone, [dropzoneText, dropzoneHelper], filesContainer, progressbar, footer, [label, [input, browseButton], uploadButton]]);

    input.addEventListener('change', function(event) {
        uploader.addFiles(input.files);
    });

    input.JAU = this;
};

var createDropzone = function() {
    var uploader = this;
    var dropzone = newEl('div', "jauploader-dropzone");

    dropzone.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        dropzone.classList.add("hover");
    });

    dropzone.addEventListener('dragleave', function(event) {
        event.preventDefault();
        event.stopPropagation();
        dropzone.classList.remove("hover");
    });

    dropzone.addEventListener('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();

        dropzone.classList.remove("hover");

        uploader.addFiles(event.dataTransfer.files);
    });

    return dropzone;
};
