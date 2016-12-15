module ajax
{
    export class RequestHeader
    {
        private _label : string;
        public get label() : string { return this._label; }
        public set label(v : string) : void { this._label = v; }

        private _value : string;
        public get value() : string { return this._value; }
        public set value(v : string) : void { this._value = v; }

        public constructor(label:string, value:string) {
            this.label = label;
            this.value = value;
        }

    }
    export class Request
    {
        private _xhr : XMLHttpRequest = null;
        public get xhr() : XMLHttpRequest { return this._xhr; }

        private _endpoint : string = "./";
        public get endpoint() : string { return this._endpoint; }
        public set endpoint(v : string) : void { this._endpoint = v; }

        private _method : string = "POST";
        public get method() : string { return this._method; }
        public set method(v : string) : void { this._method = v; }

        private _postData : string = null;
        public get postData() : string { return this._postData; }
        public set postData(v : string) : void { this._postData = v; }

        private _headers : Array<RequestHeader> = [];
        public get headers() : Array<RequestHeader> { return this._headers; }
        public set headers(v : Array<RequestHeader>) : void { this._headers = v; }

        public get isPostRequest() : boolean {return this.method == "POST";}

        constructor(url : string) {
            this.endpoint = url;
            this.headers.push(new RequestHeader('X-Requested-With', 'red.ajax.Request'));
        }

        private createXhr() : void {
            this._xhr = new XMLHttpRequest();
            // for(let i = 0; i < this.headers.length; i ++) {
            //     this._xhr.setRequestHeader(this.headers[i].label, this.headers[i].value);
            // }
        }

        public send(onSuccess:Function, onError:Function) : Request {
            if (this.xhr == null) {
                this.createXhr();
                let me : Request = this;
                this.xhr.onreadystatechange = function() : void {
                    switch (me.xhr.readyState) {
                        case 1 : break;
                        case 2 : break;
                        case 3 : break;
                        case 4 :
                            let xhr = me.xhr;
                            if (xhr.status == 200) {
                                if (onSuccess)
                                    onSuccess.apply(me, [xhr]);
                            }
                            else {
                                if (onError)
                                    onError.apply(me, [xhr]);
                            }
                            break;
                    }
                }
            }

            let data : string = this.isPostRequest ? this.postData : null;
            this.xhr.open(this.method, this.endpoint);
            this.xhr.send(data);
            return this;
        }

        static post(url:string, onSuccess:Function, onError:Function) : Request {
            let req = new Request(url);
            req.method = "POST";
            return req.send(onSuccess,onError);
        }

        static get(url:string, onSuccess:Function, onError:Function) : Request {
            let req = new Request(url);
            req.method = "GET";
            return req.send(onSuccess,onError);
        }
    }
}