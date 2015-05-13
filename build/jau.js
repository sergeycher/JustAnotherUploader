(function(window) {
var nativeForEach = Array.prototype.forEach,
    nativeKeys = Object.keys;

var breaker = {};

var isArray = Array.isArray || function(obj) {
    //copypasted from underscore.js
    return toString.call(obj) == '[object Array]';
};

var isObject = function(obj) {
    return obj === Object(obj);
};

var has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
};

var keys = function(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj)
        if (has(obj, key)) keys.push(key);
    return keys;
};

var each = function(obj, iterator, context) {
    //copypasted from underscore.js
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var k = keys(obj);
        for (var i = 0, length = k.length; i < length; i++) {
            if (iterator.call(context, obj[k[i]], k[i], obj) === breaker) return;
        }
    }
    return obj;
};

var newEl = function(tagname, className, innerHTML) {
    var el = document.createElement(tagname);
    if (className) {
        el.className = className;
    }
    if (innerHTML) {
        el.innerHTML = innerHTML;
    }
    return el;
};

var assembleElements = function(parent, hierarchy) {
    var current,
        previous = parent;

    each(hierarchy, function(current) {
        if (current) {
            if (isArray(current)) {
                assembleElements(previous, current);
            } else {
                parent.appendChild(current);
                previous = current;
            }
        }
    });

    return parent;
};

    var LOC = {
        DRAG_HERE: {
            ru: 'Перетащите файлы сюда',
            en: 'Drag files here'
        },
        BROWSE: {
            ru: 'Выбрать файлы',
            en: 'Browse files'
        },
        UPLOAD: {
            ru: 'Загрузить',
            en: 'Upload'
        }
    };

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

var JAU = function(input, options) {
    if (!input) return;
    if (input.JAU) return;

    options || (options = {});

    this.locale = options.locale || 'ru';
    this.files = [];
    this.target = 'http://localhost:1337';

    this.additionalData = options.additionalData || {};
    this.autoupload = !(options.autoupload === false);

    build.call(this, input);
    this._setProgressBarValue(0);
};

JAU.prototype = {
    upload: function() {
        var file;
        this._setProgressBarValue(0);
        if (file = this._currentFile = this.files.pop()) {
            file.upload();
        }
    },
    addFiles: function(files) {
        var self = this;
        each(files, function(file) {
            self._addFile(file);
        });
        this.renderFiles();
        if (this.autoupload) {
            this.upload();
        }
    },
    removeFile: function(file) {
        var pos = this.files.indexOf(file);
        if (pos >= 0) {
            this.files.splice(pos, 1);
        }
    },
    reset: function() {
        this.files.splice(0, this.files.length);
        this.renderFiles();
    },
    renderFiles: function() {
        this.filesContainer.innerHTML = '';
        each(this.files, function(jauFile) {
            this.filesContainer.appendChild(jauFile.render().el);
        }, this);
    },
    onUploadComplete: function(event, xhr) {

    },
    onUploadError: function(event, xhr) {

    },
    onFileAdd: function(jauFile) {

    },
    XHR: function() {
        var uploader = this;
        if (!this._xhr) {
            var xhr = this._xhr = new XMLHttpRequest();

            xhr.upload.onprogress = function(event) {
                uploader._onUploadProgress(event, xhr);
            };

            xhr.onreadystatechange = function(event) {
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
    _onUploadComplete: function(event, xhr) {
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
    _onUploadProgress: function(event, xhr) {
        if (event.lengthComputable) {
            var progress = (event.loaded / event.total) * 100;
            this._setProgressBarValue(progress);
        } else {
            console.log('length not computable');
        }
    },
    _addFile: function(file) {
        var jauFile = new JAUFile(file, this);
        this.files.push(jauFile);
        this.onFileAdd(jauFile);
    },
    _setProgressBarValue: function(value) {
        value = value > 100 ? 100 : value;
        value = value < 0 ? 0 : value;
        this._progressbar.style.width = value + '%';
    }
};

window.JAUploader = JAU;

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

})(this);
