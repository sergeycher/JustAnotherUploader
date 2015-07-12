var JAU = function (input, options) {
    if (!input) return;
    if (input.JAU) return;

    options || (options = {});

    this.locale = options.locale || 'ru';
    this.additionalData = options.additionalData || {};
    this.autoupload = !(options.autoupload === false);

    this.files = [];
    this.target = options.target || '';

    build.call(this, input);
    this._setProgressBarValue(0);
};

JAU.prototype = {
    upload: function () {
        var file;
        this._setProgressBarValue(0);
        if (file = this._currentFile = this.files.pop()) {
            file.upload();
        }
    },
    addFiles: function (files) {
        var self = this;
        each(files, function (file) {
            self._addFile(file);
        });
        this.renderFiles();
        if (this.autoupload) {
            this.upload();
        }
    },
    removeFile: function (file) {
        var pos = this.files.indexOf(file);
        if (pos >= 0) {
            this.files.splice(pos, 1);
        }
    },
    reset: function () {
        this.files.splice(0, this.files.length);
        this.renderFiles();
    },
    renderFiles: function () {
        this.filesContainer.innerHTML = '';
        each(this.files, function (jauFile) {
            this.filesContainer.appendChild(jauFile.render().el);
        }, this);
    },
    onUploadComplete: function (event, xhr) {

    },
    onUploadError: function (event, xhr) {

    },
    onFileAdd: function (jauFile) {

    },
    XHR: function () {
        var uploader = this;
        if (!this._xhr) {
            var xhr = this._xhr = new XMLHttpRequest();

            xhr.upload.onprogress = function (event) {
                uploader._onUploadProgress(event, xhr);
            };

            xhr.onreadystatechange = function (event) {
                if (event.target.readyState == 4) {
                    if (event.target.status == 200) {
                        uploader._onUploadComplete(event, xhr);
                    } else {
                        uploader.onUploadError(event, xhr);
                    }
                }
            };
        }
        return this._xhr;
    },
    _onUploadComplete: function (event, xhr) {
        this._setProgressBarValue(100);

        try {
            var data = JSON.parse(xhr.response);
        } catch (e) {
            data = null;
            console.log(e);
        }

        if (data) {
            this._currentFile.onUpload(data);
        } else {
            this._currentFile.onError(data);
        }

        this.onUploadComplete(event, xhr);
        this.upload();
    },
    _onUploadProgress: function (event, xhr) {
        if (event.lengthComputable) {
            var progress = (event.loaded / event.total) * 100;
            this._setProgressBarValue(progress);
        } else {
            console.log('length not computable');
        }
    },
    _addFile: function (file) {
        var jauFile = new JAUFile(file, this);
        this.files.push(jauFile);
        this.onFileAdd(jauFile);
    },
    _setProgressBarValue: function (value) {
        value = value > 100 ? 100 : value;
        value = value < 0 ? 0 : value;
        this._progressbar.style.width = value + '%';
    }
};

window.JAUploader = JAU;
