var ajax;
(function (ajax) {
    var RequestHeader = (function () {
        function RequestHeader(label, value) {
            this.label = label;
            this.value = value;
        }
        Object.defineProperty(RequestHeader.prototype, "label", {
            get: function () { return this._label; },
            set: function (v) { this._label = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RequestHeader.prototype, "value", {
            get: function () { return this._value; },
            set: function (v) { this._value = v; },
            enumerable: true,
            configurable: true
        });
        return RequestHeader;
    }());
    ajax.RequestHeader = RequestHeader;
    var Request = (function () {
        function Request(url) {
            this._xhr = null;
            this._endpoint = "./";
            this._method = "POST";
            this._postData = null;
            this._headers = [];
            this.endpoint = url;
            this.headers.push(new RequestHeader('X-Requested-With', 'red.ajax.Request'));
        }
        Object.defineProperty(Request.prototype, "xhr", {
            get: function () { return this._xhr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "endpoint", {
            get: function () { return this._endpoint; },
            set: function (v) { this._endpoint = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "method", {
            get: function () { return this._method; },
            set: function (v) { this._method = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "postData", {
            get: function () { return this._postData; },
            set: function (v) { this._postData = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "headers", {
            get: function () { return this._headers; },
            set: function (v) { this._headers = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "isPostRequest", {
            get: function () { return this.method == "POST"; },
            enumerable: true,
            configurable: true
        });
        Request.prototype.createXhr = function () {
            this._xhr = new XMLHttpRequest();
            // for(let i = 0; i < this.headers.length; i ++) {
            //     this._xhr.setRequestHeader(this.headers[i].label, this.headers[i].value);
            // }
        };
        Request.prototype.send = function (onSuccess, onError) {
            if (this.xhr == null) {
                this.createXhr();
                var me_1 = this;
                this.xhr.onreadystatechange = function () {
                    switch (me_1.xhr.readyState) {
                        case 1: break;
                        case 2: break;
                        case 3: break;
                        case 4:
                            var xhr = me_1.xhr;
                            if (xhr.status == 200) {
                                if (onSuccess)
                                    onSuccess.apply(me_1, [xhr]);
                            }
                            else {
                                if (onError)
                                    onError.apply(me_1, [xhr]);
                            }
                            break;
                    }
                };
            }
            var data = this.isPostRequest ? this.postData : null;
            this.xhr.open(this.method, this.endpoint);
            this.xhr.send(data);
            return this;
        };
        Request.post = function (url, onSuccess, onError) {
            var req = new Request(url);
            req.method = "POST";
            return req.send(onSuccess, onError);
        };
        Request.get = function (url, onSuccess, onError) {
            var req = new Request(url);
            req.method = "GET";
            return req.send(onSuccess, onError);
        };
        return Request;
    }());
    ajax.Request = Request;
})(ajax || (ajax = {}));
//# sourceMappingURL=ajax.js.map