var CLASSES = {
    uploading: "jauploader-file-uploading",
    uploaded: "jauploader-file-uploaded",
    error: "jauploader-file-error"
};

var JAUFile = function(file, uploader) {
    this.originalFile = file;
    this.el = newEl('div', 'jauploader-file');
    this.uploader = uploader;
    this.attrs = {};
};

JAUFile.prototype = {
    upload: function() {
        var form = this._createForm();
        form.append('file[]', this.originalFile);

        this.uploader.XHR().open('POST', this.uploader.target, true);
        this.uploader.XHR().send(form);

        this.el.classList.add('uploading');
    },
    onUpload: function(responseData) {
        this._uploaded = true;
        this.attrs = responseData;
        this.render();
        this.el.classList.remove(CLASSES.uploading);
        this.el.classList.add(CLASSES.uploaded);
    },
    onError: function(responseData) {
        this._uploaded = false;
        this.attributes = responseData;
        this.el.classList.remove(CLASSES.uploading);
        this.el.classList.add(CLASSES.error);
    },
    render: function() {
        var jauFile = this,
            body = this.el,
            file = this.originalFile,
            close = newEl('div', 'jauploader-file-close'),
            thumb = newEl('img', 'jauploader-file-thumb'),
            name = newEl('span', 'jauploader-file-name', [file.name, file.size, file.type].join(' : '));

        if (this.attrs.url) {
            name = newEl('a', 'jauploader-file-name', [file.name, file.size, file.type].join(' : '));
            name.href = this.url();
        };

        if (file.type.indexOf('image/') === 0) {
            readFileToImg(file, thumb);
        };

        close.onclick = function(e) {
            body.remove();
            jauFile.uploader.removeFile(jauFile);
        };

        //FIXME: из-за обнуления содержимого элемента наблюдается "прыганье"
        body.innerHTML = '';
        assembleElements(body, [thumb, name, close]);

        return this;
    },
    //override it to return actual link to download file, e.g. "return '/?fileid='+this.attrs.id;"
    url: function() {
        return this.attrs.url;
    },
    _createForm: function() {
        var form = new FormData();

        each(this.uploader.additionalData, function(value, key) {
            form.append(key, value);
        });

        return form;
    }
};

var readFileToImg = function(file, imgEl) {
    var fr = new FileReader();
    fr.onload = (function(img) {
        return function(e) {
            img.src = e.target.result;
        };
    })(imgEl);

    fr.readAsDataURL(file);
};
