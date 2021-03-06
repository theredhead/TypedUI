/**
 * © Kris Herlaar <kris@theredhead.nl>
 */
module red {
    export var settings = {
        debug: true,
        displayRectInfo: false
    };

    export function typeId(anObject:Object):string {
        var matches = /function (.{1,})\(/.exec(anObject['constructor'].toString());
        return (matches && matches.length > 1) ? matches[1] : '';
    }

    export class Notification {
        private _sender:Object;

        public get notificationKind():string {
            return typeId(this);
        }

        public get sender() {
            return this._sender;
        }

        constructor(sender:Object) {
            this._sender = sender;
        }
    }

    export class PropertyChangeNotification extends Notification {
        private _propertyName:string;
        get propertyName():string {
            return this._propertyName;
        }

        constructor(propertyName:string, sender:Object) {
            super(sender);
            this._propertyName = propertyName;
        }
    }

    export class PropertyWillChangeNotification extends PropertyChangeNotification {
    }

    export class PropertyDidChangeNotification extends PropertyChangeNotification {
    }

    export class NotificationRequest {
        private _notificationKind:string;
        private _target:Object;
        private _action:string;

        public get notificationKind():string {
            return this._notificationKind;
        }

        public act(notification:Notification):void {
            this._target[this._action](notification.sender);
        }

        constructor(aNotificationKind:string, aTarget:Object, anAction:string) {
            this._notificationKind = aNotificationKind;
            this._target = aTarget
            this._action = anAction;
        }
    }

    export class Observable {
        private _observers:Array<NotificationRequest>;

        public registerObserver(notificationKind:string, target:Object, action:string) {
            this._observers.push(new NotificationRequest(notificationKind, target, action));
        }

        public notifyPropertyWillChange(propertyName:string) {
            this.notifyListeners(new PropertyWillChangeNotification(propertyName, this));
        }

        public notifyPropertyDidChange(propertyName:string) {
            this.notifyListeners(new PropertyDidChangeNotification(propertyName, this));
        }

        public notifyListeners(notification:Notification):void {
            if (this._observers && this._observers.length) {
                for (var ix = 0; ix < this._observers.length; ix++) {
                    if (typeId(this._observers[ix]) === notification.notificationKind) {
                        this._observers[ix].act(notification);
                    }
                }
            }
        }

        constructor() {
            this._observers = [];
        }
    }

    export class Point {
        private prep(n:number):number {
            return n;
        }

        private _x:number;
        public get x():number {
            return this._x;
        }

        public set x(v:number) {
            this._x = this.prep(v);
        }

        private _y:number;
        public get y():number {
            return this._y;
        }

        public set y(v:number) {
            this._y = this.prep(v);
        }

        public toString():string {
            return 'Point(' + this.x + ', ' + this.y + ')';
        }

        constructor(x:number, y:number) {
            this.x = x;
            this.y = y;
        }

        public distanceTo(other:Point) {
            return new Point((this.x - other.x), (this.y - other.y));
        }
    }
    export class Size {
        private prep(n:number):number {
            return n;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        public set width(v:number) {
            this._width = this.prep(v);
        }

        private _height:number;
        public get height():number {
            return this._height;
        }

        public set height(v:number) {
            this._height = this.prep(v);
        }

        public toString():string {
            return 'Size(' + this.width + ', ' + this.height + ')';
        }

        constructor(width:number, height:number) {
            this.height = height;
            this.width = width;
        }
    }
    export class Rect {
        public origin:Point;
        public size:Size;

        public get center() {
            return new Point(this.origin.x + (this.size.width / 2), this.origin.y + (this.size.height / 2));
        }

        public centeredInRect(r:Rect) {

        }

        public shrink(pixels:number):Rect {
            return RectMake(
                this.origin.x + pixels,
                this.origin.y + pixels,
                this.size.width - 2 * pixels,
                this.size.height - 2 * pixels);
        }

        public copy():Rect {
            return RectMake(
                this.origin.x,
                this.origin.y,
                this.size.width,
                this.size.height);
        }

        public sizeOnlyCopy() : Rect {
            return RectMake(0, 0, this.size.width, this.size.height);
        }

        public toString():string {
            return [this.origin.x, this.origin.y, this.size.width, this.size.height].join(', ');
        }

        public isEquivalentTToRect(otherRect:Rect) {
            return this.toString() == otherRect.toString();
        }

        public intersects(other:Rect) {
            var delta = this.center.distanceTo(other.center),
                dx = Math.abs(delta.x),
                dy = Math.abs(delta.y);
            return dx < ((this.size.width/2) || dx < (other.size.width/2))
                && dy < ((this.size.height/2) || dy < (other.size.height/2));
        }

        public toClipString():string {
            return 'rect(0px,' + (this.size.width).toFixed(0) + 'px,' + (this.size.height).toFixed(0) + 'px,0px)';
        }

        public adjustRectsToFitHorizontally(rects:Array<Rect>, margin:number = 0) {
            var availableWidth = this.size.width,
                singleRectWidth = (availableWidth - ((1 + rects.length) * margin)) / rects.length,
                singleRectHeight = this.size.height - (2 * margin);

            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.y = margin;
                rects[ix].origin.x = ((ix + 1) * margin) + (ix * singleRectWidth);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        }

        public adjustRectsToFitVertically(rects:Array<Rect>, margin:number = 0) {
            var availableHeight = this.size.height,
                singleRectHeight = (availableHeight - ((1 + rects.length) * margin)) / rects.length,
                singleRectWidth = this.size.width - (2 * margin);

            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.x = margin;
                rects[ix].origin.y = ((ix + 1) * margin) + (ix * singleRectHeight);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        }


        public get isNegativeRect() : boolean {
            return this.width < 0 || this.height < 0;
        }

        constructor(origin:Point, size:Size) {
            this.origin = origin;
            this.size = size;
        }
    }

    export function DetermineTextSize(text:string, font:string) : Size {
        let canvas = DetermineTextSize.canvas || (DetermineTextSize.canvas = document.createElement("canvas"));
        let context = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        return SizeMake(metrics.width, metrics.height);
    }

    export function PointMake(x, y):Point {
        return new Point(x, y);
    }
    export function SizeMake(width, height):Size {
        return new Size(width, height);
    }
    export function RectMake(x, y, width, height):Rect {
        return new Rect(PointMake(x, y), SizeMake(width, height));
    }

    export function RectInset(r:Rect, p:number):Rect {
        return new Rect(PointMake(r.origin.x+p, r.origin.y+p), SizeMake(r.size.width-(2*p), r.size.height-(2*p)));
    }

    export function RectOutset(r:Rect, p:number):Rect {
        return new Rect(PointMake(r.origin.x-p, r.origin.y-p), SizeMake(r.size.width+(2*p), r.size.height+(2*p)));
    }


    export function RectMakeZero(s:Size=null):Rect {
        if (s == null)
            return RectMake(0, 0, 0, 0);
        else
            return new Rect(new Point(0, 0), s);
    }

    export class UIElement {
        private _cursor:string;
        private _color:Color;
        private _backgroundColor:Color;
        private _backgroundImage:string;
        private _visible:boolean = true;

        public get visible():boolean {
            return this._visible;
        }

        public set visible(v:boolean) {
            if (this._visible != v) {
                this._visible = v;
                this.element.style.visibility = this._visible
                    ? 'visible'
                    : 'hidden';
            }
        }

        public setCursor(crsr:string):void {
            this._cursor = crsr;
            this.applyFrame();
        }

        public setColor(color:Color) {
            this._color = color;
            this.applyFrame();
        }

        public setBackgroundColor(color:Color) {
            this._backgroundColor = color;
            this.applyFrame();
        }

        public setBackgroundImage(anImageUrl:string) {
            this._backgroundImage = anImageUrl;
            this.applyFrame();
        }

        private _clipsContent:boolean = true;
        public get clipsContent():boolean {
            return this._clipsContent;
        }

        public set clipsContent(v:boolean) {
            this._clipsContent = v;
        }

        /**
         * treat as private.
         */
        public _frame:Rect;
        public get frame():Rect {
            return this._frame;
        }

        public set frame(v:Rect) {
            if (!this._frame.isEquivalentTToRect(v)) {
                var oldFrame = this._frame;
                this.willUpdateFrame(oldFrame, v);
                this._frame = v;
                this.didUpdateFrame(oldFrame, v);
                this.applyFrame();
            }
        }

        public willUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
        }

        public didUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
        }

        private _tag:string;
        public get tag():string {
            return this._tag;
        }

        public set tag(v:string) {
            this._tag = v;
        }

        private _element:HTMLElement;
        public get element():HTMLElement {
            return this._element;
        }

        private _tagName:string = 'div';
        public get tagName():string {
            return this._tagName;
        }

        private _cssClasses:Array<string> = [];

        constructor(frame:Rect) {
            this.addCssClass('ui');
            this.addCssClass(typeId(this));
            this._frame = frame;
            this._element = document.createElement(this.tagName);
            //this.applyFrame();
        }

        public applyFrame():void {
            this._element.style.position = 'absolute';
            this._element.style.display = 'block';
            this._element.style.top = this.frame.origin.y + 'px';
            this._element.style.left = this.frame.origin.x + 'px';
            this._element.style.height = this.frame.size.height + 'px';
            this._element.style.width = this.frame.size.width + 'px';

            if (this._cssClasses.length > 0)
                this._element.setAttribute('class', this.cssCasses.join(' '));
            else
                this._element.removeAttribute('class');

            if (this._cursor)
                this.element.style.cursor = this._cursor;
            if (this._backgroundColor)
                this.element.style.backgroundColor = this._backgroundColor.toString();
            if (this._backgroundImage)
                this.element.style.background = 'url(' + this._backgroundImage + ')';

            if (settings.debug && settings.displayRectInfo)
                this.element.title = this.frame.toString();

            if (this.clipsContent)
                this._element.style.clip = this.frame.toClipString();
            else
                this._element.style.clip = null;
        }

        public get cssCasses():Array<string> {
            return this._cssClasses;
        }

        public hasCssClass(aClass:string) {
            return this._cssClasses.indexOf(aClass) > -1;
        }

        public addCssClass(aClass:string) {
            if (!this.hasCssClass(aClass)) {
                this._cssClasses.push(aClass);
            }
        }

        public removeCssClass(aClass:string) {
            if (!this.hasCssClass(aClass)) {
                console.log('before removeClass:', this.cssCasses);
                this._cssClasses.splice(this._cssClasses.indexOf(aClass));
                console.log('after removeClass:', this.cssCasses);
            }
        }

        public toggleCssClass(aClass:string) {
            if (!this.hasCssClass(aClass)) {
                this.removeCssClass(aClass);
            } else {
                this.addCssClass(aClass);
            }
        }
    }

    export class Color {
        private _r:number;
        private _g:number;
        private _b:number;
        private _alpha:number;

        private adjustToByte(i:number):number {
            var o = Math.ceil(i);

            if (o < 0) {
                return 0;
            } else if (o > 255) {
                return 255;
            }
            else return o;
        }

        private adjustAlpha(i:number):number {
            if (i < 0) {
                return 0;
            } else if (i > 1) {
                return 1;
            }
            else return i;
        }

        constructor(r:number, g:number, b:number, alpha:number = 1.0) {
            this._r = this.adjustToByte(r);
            this._g = this.adjustToByte(g);
            this._b = this.adjustToByte(b);
            this._alpha = this.adjustAlpha(alpha);
        }

        public toString():string {
            var result = 'rgba(' + [
                    this._r.toFixed(0),
                    this._g.toFixed(0),
                    this._b.toFixed(0),
                    this._alpha
                ].join(', ') + ')';
            return result;
        }
    }

    export var colors = {
        white: new Color(255, 255, 255),
        lightGray: new Color(196, 196, 196),
        gray: new Color(127, 127, 127),
        darkGray: new Color(64, 64, 64),
        black: new Color(0, 0, 0),
        red: new Color(255, 0, 0),
        green: new Color(0, 255, 0),
        blue: new Color(0, 0, 255),
        darkRed: new Color(127, 0, 0),
        darkGreen: new Color(0, 127, 0),
        darkBlue: new Color(0, 0, 127)
    };

    function resizeProportionally(r:Rect, oldSize:Size, newSize:Size):Rect {
        var fn = (lengthA, lengthB, distanceA) => {
            return (distanceA * lengthB) / lengthA;
        };
        var x = fn(oldSize.width, newSize.width, r.origin.x),
            y = fn(oldSize.height, newSize.height, r.origin.y),
            w = fn(oldSize.width, newSize.width, r.size.width),
            h = fn(oldSize.height, newSize.height, r.size.height);
        return RectMake(x, y, w, h);
    }

    export enum AutoresizingMask
    {
        LockedTop = 1,
        LockedLeft = 2,
        LockedBottom = 4,
        LockedRight = 8,
        WidthSizable = 16,
        HeightSizable = 32,
    }

    export let ResizeWithParent = AutoresizingMask.HeightSizable | AutoresizingMask.WidthSizable | AutoresizingMask.LockedLeft | AutoresizingMask.LockedRight | AutoresizingMask.LockedTop | AutoresizingMask.LockedBottom;

    var viewId = 0;
    export class View extends UIElement
    {
        public get frame():Rect {
            return this._frame;
        }

        public set frame(v:Rect) {
            if (!this._frame.isEquivalentTToRect(v) && ! v.isNegativeRect) {
                let oldFrame = this._frame;
                this.willUpdateFrame(oldFrame, v);
                this._frame = v;
                this.applyFrame();
                this.didUpdateFrame(oldFrame, v);
            }
        }

        public get minimumWidth() : number {
            if (this.minimumSize) {
                return this.minimumSize.width;
            }
            return 0;
        }
        public get minimumHeight() : number {
            if (this.minimumSize) {
                return this.minimumSize.height;
            }
            return 0;
        }
        public get maximumWidth() : number {
            if (this.maximumSize) {
                return this.maximumSize.width;
            }
            return window.innerWidth;
        }
        public get maximumHeight() : number {
            if (this.maximumSize) {
                return this.maximumSize.height;
            }
            return window.innerHeight;
        }

        private _identifier:string;
        private _minimumSize:Size;
        public get minimumSize():Size {
            return this._minimumSize;
        }

        public set minimumSize(v:Size) {
            this._minimumSize = v;
        }

        private _maximumSize:Size;
        public get maximumSize():Size {
            return this._maximumSize;
        }

        public set maximumSize(v:Size) {
            this._maximumSize = v;
        }

        public get identifier():string {
            return this._identifier;
        }

        public set identifier(v:string) {
            this._identifier = v;
        }

        public toString():string {
            return this.identifier;
        }

        private _parentView:View;
        public get parentView():View {
            return this._parentView;
        }

        public set parentView(aView:View) {
            this._parentView = aView;
        }

        private _autoresizingMask:number = AutoresizingMask.LockedTop | AutoresizingMask.LockedLeft;
        public get autoresizingMask():number {
            return this._autoresizingMask;
        }

        public set autoresizingMask(v:number) {
            if (this._autoresizingMask = v) {
                this._autoresizingMask = v
            }
        }

        private _autoresizesSubviews:boolean = true;
        public get autoresizesSubviews():boolean {
            return this._autoresizesSubviews;
        }

        public set autoresizesSubviews(v:boolean) {
            this._autoresizesSubviews = v;
        }


        public willUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
            if (this.minimumSize && newFrame.size.width < this.minimumSize.width) {
                newFrame.size.width = this.minimumSize.width;
            }
            if (this.minimumSize && newFrame.size.height < this.minimumSize.height) {
                newFrame.size.height = this.minimumSize.height;
            }
            if (this.maximumSize && newFrame.size.width > this.maximumSize.width) {
                newFrame.size.width = this.maximumSize.width;
            }
            if (this.maximumSize && newFrame.size.height > this.maximumSize.height) {
                newFrame.size.height = this.maximumSize.height;
            }

            this.resizeSubviews(oldFrame.size, newFrame.size);
        }

        public didUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
            // console.log(this.identifier + ' updated frame from ' + oldFrame + ' to ' + newFrame);
        }

        public resizeSubviews(oldSize:Size, newSize:Size):void {
            if (oldSize != null) {
                if (this.autoresizesSubviews) {
                    var oldRect = RectMake(0, 0, oldSize.width, oldSize.height);
                    for (var ix = 0; ix < this._subViews.length; ix++) {
                        var sub = this._subViews[ix],
                            frame = sub.frame.copy(),
                            rect = resizeProportionally(sub.frame, oldSize, newSize);

                        if ((sub.autoresizingMask & AutoresizingMask.LockedLeft) == AutoresizingMask.LockedLeft) {
                            rect.origin.x = sub.frame.origin.x;
                        }
                        if ((sub.autoresizingMask & AutoresizingMask.LockedTop) == AutoresizingMask.LockedTop) {
                            rect.origin.y = sub.frame.origin.y;
                        }
                        if ((sub.autoresizingMask & AutoresizingMask.LockedRight) == AutoresizingMask.LockedRight) {
                            var distanceFromOldRight = oldSize.width - (frame.size.width + frame.origin.x);
                            rect.size.width = newSize.width - rect.origin.x - distanceFromOldRight;
                        }
                        if ((sub.autoresizingMask & AutoresizingMask.LockedBottom) == AutoresizingMask.LockedBottom) {
                            var distanceFromOldBottom = oldSize.height - (frame.size.height + frame.origin.y);
                            rect.size.height = newSize.height - rect.origin.y - distanceFromOldBottom;
                        }

                        //((s,r) => {window.setTimeout(() => {s.frame = r;}, 1);})(sub, rect);
                        sub.frame = rect;
                    }
                }
                // else
                    // console.log(this.identifier + ' does not resize subViews');
            }
        }

        public applyFrame():void {
            for (let ix = 0; ix < this._subViews.length; ix++) {
                let view = this._subViews[ix];
                view.applyFrame();
            }
            super.applyFrame();
        }

        private _isResizing:boolean;
        public get isResizing():boolean {
            return this._isResizing;
        }

        public set isResizing(v:boolean) {
            this._isResizing = v;
        }


        private _isBeingDragged:boolean;
        public get isBeingDragged():boolean {
            return this._isBeingDragged;
        }

        public set isBeingDragged(v:boolean) {
            this._isBeingDragged = v;
        }


        private _allowDragAndDrop:boolean;
        public get allowDragAndDrop():boolean {
            return this._allowDragAndDrop;
        }

        public set allowDragAndDrop(v:boolean) {
            this._allowDragAndDrop = v;
        }

        private _subViews:Array<View> = [];
        public get subViews() : Array<View> {
            return this._subViews;
        }

        public addSubview(aView:View):View {
            this._subViews.push(aView);
            aView._parentView = this;
            this.element.appendChild(aView.element);
            return aView;
        }

        public removeSubview(aView:View):View {
            this._subViews.splice(this._subViews.indexOf(aView));
            if (this.element.contains(aView.element)) {
                this.element.removeChild(aView.element);
            }
            return aView;
        }

        public center(inRect:Rect = null):void {
            var parentFrame = inRect || this._parentView.frame,
                myFrame = this.frame,
                offsetX = parentFrame.size.width / 2 - myFrame.size.width / 2,
                offsetY = parentFrame.size.height / 2 - myFrame.size.height / 2;
            this.frame.origin = PointMake(offsetX, offsetY);
            this.applyFrame();
        }

        constructor(frame:Rect) {
            super(frame);

            let typeName = typeId(this);
            this._identifier = '_' + (viewId++).toString();
            this.addCssClass(typeName);
            this.element.setAttribute('id', this._identifier);
            this._isBeingDragged = false;
            this._isResizing = false;

            var me = this;
            this.element.addEventListener('mousedown', (e) => {
                me.mouseDown(e)
            });
            this.element.addEventListener('mouseup', (e) => {
                me.mouseUp(e)
            });
        }

        public mouseDown(e:MouseEvent):void {
        }

        public mouseUp(e:MouseEvent):void {
        }

        public draw():void {
            this.applyFrame();
            //this.applyFrame();
        }
    }

    export class Desktop extends View {
        constructor() {
            super(RectMake(0, 0, window.innerWidth, window.innerHeight));
            this.clipsContent = true;
            this.addCssClass(typeId(this));
            document.getElementsByTagName('body').item(0).appendChild(this.element);
            this.applyFrame();
        }
    }

    export class ViewDragManager {
        view:View;
        private offsetX;
        private offsetY;

        private mouseMoveHandler:any;
        private mouseUpHandler:any;

        private handleMouseMove(e:MouseEvent) {
            this.view.frame.origin = PointMake(e.x - this.offsetX, e.y - this.offsetY);
            this.view.applyFrame();
        }

        private handleMouseRelease(e:MouseEvent) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isBeingDragged = false;
            this.view.applyFrame();
        }

        constructor(e:MouseEvent, view:View) {
            this.view = view;
            this.view.isBeingDragged = true;
            this.offsetX = e.x - view.frame.origin.x;
            this.offsetY = e.y - view.frame.origin.y;

            this.mouseMoveHandler = (e:MouseEvent) => {
                this.handleMouseMove(e);
            };
            this.mouseUpHandler = (e:MouseEvent) => {
                this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
        }
    }

    enum Resize {
        North = 1,
        East = 2,
        South = 4,
        West = 8
    }

    export class ViewResizeManager {
        private view:View;
        private offsetX;
        private offsetY;
        private originalFrame:Rect;
        private resizeDirectionMask:number;
        private busy:boolean;
        private initialMouseEvent:MouseEvent;
        private mouseMoveHandler:any;
        private mouseUpHandler:any;

        private constrain(val:number, min:number, max:number):number {
            if (min && val < min)
                return min;
            if (max && val > max)
                return max;
            return val;
        }

        private handleMouseMove(e:MouseEvent) {
            if (this.busy) return;
            this.busy = true;
            e.preventDefault();
            var dir = this.resizeDirectionMask,
                frame = this.originalFrame.copy(),
                diffX = Math.round(this.initialMouseEvent.x - e.x),
                diffY = Math.round(this.initialMouseEvent.y - e.y);

            if ((dir & Resize.East) == Resize.East) {
                frame.size.width = Math.round(this.originalFrame.size.width - diffX);
            }
            if ((dir & Resize.West) == Resize.West) {
                frame.origin.x = Math.round(this.originalFrame.origin.x - diffX);
                frame.size.width = Math.round(this.originalFrame.size.width + diffX);
            }
            if ((dir & Resize.South) == Resize.South) {
                frame.size.height = Math.round(this.originalFrame.size.height - diffY);
            }
            if ((dir & Resize.North) == Resize.North) {
                frame.origin.y = Math.round(this.originalFrame.origin.y - diffY);
                frame.size.height = Math.round(this.originalFrame.size.height + diffY);
            }

            this.view.frame = frame;
            this.busy = false;
        }

        private handleMouseRelease(e:MouseEvent) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isResizing = false;
            this.view.isBeingDragged = false;
            this.view.applyFrame();
        }

        constructor(e:MouseEvent, view:View, directionMask:number) {
            this.busy = true;
            this.initialMouseEvent = e;
            this.view = view;
            this.view.isResizing = true;
            this.originalFrame = this.view.frame;
            this.resizeDirectionMask = directionMask;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;

            this.mouseMoveHandler = (e:MouseEvent) => {
                this.handleMouseMove(e);
            };
            this.mouseUpHandler = (e:MouseEvent) => {
                this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
            this.busy = false;
        }
    }

    export class TitleView extends View {
    }
    export class TitleBar extends View {

        private _tools:View;
        private _closeTool:WindowTool;
        private _resizeTool:WindowTool;
        private _minimizeTool:WindowTool;

        public get closeTool():red.WindowTool {
            return this._closeTool;
        }
        public get minimizeTool():red.WindowTool {
            return this._minimizeTool;
        }
        public get resizeTool():red.WindowTool {
            return this._resizeTool;
        }

        public get title():string {
            return this._titleView.element.innerText;
        }
        public set title(value:string) {
            this._titleView.element.innerText = value;
            this.applyFrame();
        }
        private _titleView:View;

        public get forWindow():Window {
            return <Window>this.parentView;
        }
        constructor(aRect:Rect) {
            super(aRect);
            this.autoresizesSubviews = false;
            this._titleView = new TitleView(this.makeTitleViewRect());
            this._titleView.element.style.overflow = 'ellipsis';
            this._titleView.clipsContent = true;
            this.addSubview(this._titleView);

            this._tools = this.addSubview(new View(RectMake(2, 2, 80, 20)));
            this._tools.addCssClass('WindowTools');
            this._tools.applyFrame();

            var y = 4, s = 12, o = 8;
            this._closeTool = this._tools.addSubview(new WindowTool(RectMake(o, y, s, s), WindowToolType.Close));
            this._minimizeTool = this._tools.addSubview(new WindowTool(RectMake(o + (2 * s), y, s, s), WindowToolType.Minimize));
            this._resizeTool = this._tools.addSubview(new WindowTool(RectMake(o + (4 * s), y, s, s), WindowToolType.Resize));
            this.applyFrame();
        }
        applyFrame() : void {
            this._titleView.frame = this.makeTitleViewRect();
            this._titleView.applyFrame();
            super.applyFrame();
        }

        public makeTitleViewRect() : Rect {
            return RectMake(80, 4, this.frame.size.width - 80, 20);
        }
    }

    export class WindowManager {
        private _front:Window;
        private _container;View;
        private _windows:Array<Window> = [];
        public get windows():Array<Window> {
            return this._windows;
        }

        public addWindow(window:Window) {
            if (window == null) {
                throw new Error('Window cannot be null.');
            }
            if (window.element == null) {
                throw new Error('Window hasn\'t created its element yet.');
            }

            this._windows.push(window);
            window.parentView = this._container;
            //window._windowManager = this._container;

            if (window.element.parentNode == null) {
                this._container.element.appendChild(window.element);
            } else {
                window.element.parentNode.removeChild(window.element);
                this._container.element.appendChild(window.element);
            }
        }

        public orderFront(window:Window):void {
            var oldFront, newFront;

            if (window == null) {
                throw new Error('Cannot add null window');
            }
            if (window.element == null) {
                throw new Error('Cannot add window that hasn\'t created its element yet.');
            }
            if (window.element.parentNode == null) {
                this._container.element.appendChild(window.element);
            }

            window.visible = true;

            if (window === this._front) return;

            for (var ix = 0; ix < this._windows.length; ix++) {
                if (this._windows[ix] === window) {
                    newFront = this._windows[ix];
                    continue;
                }
                else if (this._windows[ix] === this._front) {
                    oldFront = this._windows[ix];
                    continue;
                }
            }
            if (oldFront) {
                oldFront.removeCssClass('front');
            }
            if (newFront) {
                var container = newFront.element.parentNode;
                if (container) {
                    container.removeChild(newFront.element);
                    container.appendChild(newFront.element);
                    newFront.applyFrame();
                }
                newFront.addCssClass('front');
            }

            this._front = window;
        }

        constructor(container:View) {
            this._container = container;
        }
    }

    export class ContentView extends View {

        constructor(aRect:Rect) {
            super(aRect);
            this.autoresizesSubviews = true;

            // console.log('Created a ContentView');
        }
    }

    export enum WindowToolType {
        Close,
        Minimize,
        Resize
    }

    export class WindowTool extends View {
        constructor(rect:Rect, type:WindowToolType) {
            super(rect);
            this.addCssClass(WindowToolType[type]);
            this.clipsContent = false;
        }
    }

    export class WindowSizeHandle extends View {
        constructor(rect:Rect) {
            super(rect);
            // this.setBackgroundColor(colors.red);
        }
    }

    export class UserResizableView extends View {

        private _isHorizontallySizable:boolean;
        public get isHorizontallySizable():boolean {
            return this._isHorizontallySizable;
        }

        public set isHorizontallySizable(v:boolean) {
            this._isHorizontallySizable = v;
        }

        private _isVertictallySizable:boolean;
        public get isVertictallySizable():boolean {
            return this._isVertictallySizable;
        }

        public set isVertictallySizable(v:boolean) {
            this._isVertictallySizable = v;
        }


        private _resizeBorderThickness:number;
        public get resizeBorderThickness():number {
            return Math.round(this._resizeBorderThickness);
        }

        public set resizeBorderThickness(v:number) {
            this._resizeBorderThickness = v;
        }

        private _sizeHandleHorizontallyLeft:WindowSizeHandle;
        private _sizeHandleHorizontallyRight:WindowSizeHandle;
        private _sizeHandleVerticallyTop:WindowSizeHandle;
        private _sizeHandleVerticallyallyBottom:WindowSizeHandle;
        private _sizeHandleTopLeft:WindowSizeHandle;
        private _sizeHandleTopRight:WindowSizeHandle;
        private _sizeHandleBottomLeft:WindowSizeHandle;
        private _sizeHandleBottomRight:WindowSizeHandle;

        constructor(aRect:Rect) {
            super(aRect);
            this._resizeBorderThickness = 4;
            var thickness = this._resizeBorderThickness;
            this._sizeHandleTopLeft = this.addSubview(new WindowSizeHandle(
                RectMake(0, 0, thickness, thickness)));
            this._sizeHandleTopLeft.setCursor('nw-resize');

            this._sizeHandleTopRight = this.addSubview(new WindowSizeHandle(
                RectMake(aRect.size.width - thickness, 0, thickness, thickness)));
            this._sizeHandleTopRight.setCursor('ne-resize');

            this._sizeHandleBottomLeft = this.addSubview(new WindowSizeHandle(
                RectMake(0, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomLeft.setCursor('sw-resize');

            this._sizeHandleBottomRight = this.addSubview(new WindowSizeHandle(
                RectMake(aRect.size.width - thickness, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomRight.setCursor('se-resize');

            this._sizeHandleHorizontallyLeft = this.addSubview(new WindowSizeHandle(
                RectMake(0, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyLeft.setCursor('w-resize');

            this._sizeHandleHorizontallyRight = this.addSubview(new WindowSizeHandle(
                RectMake(aRect.size.width - thickness, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyRight.setCursor('e-resize');

            this._sizeHandleVerticallyTop = this.addSubview(new WindowSizeHandle(
                RectMake(thickness, 0, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyTop.setCursor('n-resize');

            this._sizeHandleVerticallyallyBottom = this.addSubview(new WindowSizeHandle(
                RectMake(thickness, aRect.size.height - thickness, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyallyBottom.setCursor('s-resize');

            // this.applyFrame();

            var theView = this;
            this._sizeHandleHorizontallyRight.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.East);
                }
            };
            this._sizeHandleHorizontallyLeft.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.West);
                }
            };
            this._sizeHandleVerticallyTop.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, Resize.North);
                }
            };
            this._sizeHandleVerticallyallyBottom.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, Resize.South);
                }
            };

            this._sizeHandleTopLeft.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.North | Resize.West);
                }
            };
            this._sizeHandleTopRight.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.North | Resize.East);
                }
            };
            this._sizeHandleBottomLeft.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.South | Resize.West);
                }
            };
            this._sizeHandleBottomRight.mouseDown = (e:MouseEvent) => {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.South | Resize.East);
                }
            };

            this.isHorizontallySizable = true;
            this.isVertictallySizable = true;
        }

        public applyFrame() {
            let thickness = this.resizeBorderThickness;
            this._sizeHandleTopLeft.frame = RectMake(0, 0, thickness, thickness);
            this._sizeHandleTopRight.frame = RectMake(this.frame.size.width - thickness, 0, thickness, thickness);
            this._sizeHandleBottomLeft.frame = RectMake(0, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleBottomRight.frame = RectMake(this.frame.size.width - thickness, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleHorizontallyLeft.frame = RectMake(0, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleHorizontallyRight.frame = RectMake(this.frame.size.width - thickness, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleVerticallyTop.frame = RectMake(thickness, 0, this.frame.size.width - (2 * thickness), thickness);
            this._sizeHandleVerticallyallyBottom.frame = RectMake(thickness, this.frame.size.height - thickness, this.frame.size.width - (2 * thickness), thickness);
            super.applyFrame();
        }
    }

    export class UserDraggableView extends UserResizableView {

        private _isDraggable:boolean;
        public get isDraggable():boolean {
            return this._isDraggable && this._dragHandleView != null;
        }
        public set isDraggable(v:boolean) {
            this._isDraggable = v;
        }

        private _dragHandleView:View;
        public get dragHandleView():View {
            return this._dragHandleView || this;
        }
        public set dragHandleView(v:View) {
            if (v != this._dragHandleView) {
                this._dragHandleView = v;

                if (this.isDraggable)
                    this.dragHandleView.mouseDown = (e:MouseEvent) => {
                        new ViewDragManager(e, this);
                    };
                else
                    this.dragHandleView.mouseDown = (e:MouseEvent) => {
                    };
            }
        }

        constructor(aRect:Rect) {
            super(aRect);
        }
    }

    export enum WindowCloseReason {
        UserAction
    }

    export enum WindowMinimizeReason {
        UserAction
    }

        export function WindowWithSize(s: Size) : Window
    {
        let win: Window = new Window(RectMakeZero());

        win.frame.size = s;
        win.applyFrame();

        return win;
    }

    export class Window extends UserDraggableView {

        private _delegate : any;

        public get delegate() : any {
            return this._delegate;
        }
        public set delegate(d:any) : void {
            this._delegate = d;
        }

        public get title():string {
            return this._titleBar.title;
        }

        public set title(value:string) {
            this._titleBar.title = value;
        }

        private _title:string;

        private _titleBar:TitleBar;
        private _contentView:View;
        public get contentView():View {
            return this._contentView;
        }

        private _windowManager:WindowManager;
        private _canBecomeKey:boolean;

        private _closeTool:WindowTool;
        private _resizeTool:WindowTool;
        private _minimizeTool:WindowTool;

        private unminimizedElement:HTMLElement;

        public orderFront():void {
            this.visible = false;
            this._windowManager.orderFront(this);
        }

        public init() : void {
            this.addCssClass('Window');
            this.minimumSize = SizeMake(64, 64);
            this.clipsContent = false;
            this._canBecomeKey = true;

            this._titleBar = new TitleBar(RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26));
            this.isDraggable = true;
            this.dragHandleView = this._titleBar;
            this.addSubview(this._titleBar);
            var m = this.resizeBorderThickness;
            this._contentView = this.addSubview(new ContentView(
                RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m)));
            this.allowDragAndDrop = true;
        }

        constructor(aRect:Rect = null) {
            super(aRect = aRect || RectMake(0, 0, 329, 200));
            this.init();
            this._windowManager = application.windowManager;
            this._windowManager.addWindow(this);



            var me = this;
            this._titleBar.closeTool.mouseUp = () => {
                me.close(WindowCloseReason.UserAction)
            };
            this._titleBar.minimizeTool.mouseUp = () => {
                me.minimize(WindowMinimizeReason.UserAction)
            };

            this.setupWindow();
            this.unminimizedElement = this.element;
            this.applyFrame();
        }

        public close(reason:WindowCloseReason = WindowCloseReason.UserAction):void {
            if (this.windowShouldClose(reason)) {
                this.windowWillClose();
                this.parentView.removeSubview(this);
                this.windowDidClose();
            }
        }

        public windowShouldClose(reason:WindowCloseReason):boolean {
            if (this.delegate) {
                let fn =  this.delegate.windowShouldClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        }

        public windowWillClose() {
            if (this.delegate) {
                let fn =  this.delegate.windowDidClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        }

        public windowDidClose() {
            if (this.delegate) {
                let fn =  this.delegate.windowDidClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        }

        public minimize(reason:WindowMinimizeReason = WindowMinimizeReason.UserAction):void {
            if (this.windowShouldMinimize(reason)) {
                this.windowWillMinimize();
                // this.parentView.removeSubview(this);

                this.visible = false;

                this.windowDidMinimize();
            }
        }

        public windowShouldMinimize(reason:WindowMinimizeReason):boolean {
            if (this.delegate) {
                let fn =  this.delegate.windowShouldMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        }

        public windowWillMinimize() {
            if (this.delegate) {
                let fn =  this.delegate.windowWillMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        }

        public windowDidMinimize() {
            if (this.delegate) {
                let fn =  this.delegate.windowDidMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        }

        public unminimize(reason:WindowMinimizeReason = WindowMinimizeReason.UserAction):void {
            if (this.windowShouldUnMinimize(reason)) {
                this.windowWillUnMinimize();
                //this.parentView.removeSubview(this);
                this.windowDidUnMinimize();
            }
        }

        public windowShouldUnMinimize(reason:WindowMinimizeReason):boolean {
            if (this.delegate) {
                let fn =  this.delegate.windowShouldUnMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        }

        public windowWillUnMinimize() {
            if (this.delegate) {
                let fn =  this.delegate.windowWillUnMinimize;
                if (typeof fn == "function") {
                    fn.call(this.delegate, this);
                }
            }
        }

        public windowDidUnMinimize() {
            if (this.delegate) {
                let fn =  this.delegate.windowDidUnMinimize;
                if (typeof fn == "function") {
                    fn.call(this.delegate, this);
                }
            }
        }

        public setupWindow():void {

        }

        public applyFrame():void {
            super.applyFrame();
            this._titleBar.frame = RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26);
            let m = this.resizeBorderThickness;
            this._contentView.frame = RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m);
        }

        public mouseDown(e:MouseEvent):void {
            this.orderFront();
        }

        public mouseUp(e:MouseEvent):void {

        }

        public keyDown(e:KeyboardEvent) {

        }
        public keyUp(e:KeyboardEvent) {

        }
    }

    export class AboutWindow extends Window {
        constructor() {
            super(RectMake(0, 0, 380, 300));
            this.title = 'About this software…';
        }

        public setupWindow():void {
            var margin = 8, logoSize = 128;
            this.minimumSize = SizeMake(203, 300);
            this.maximumSize = SizeMake(800, 600);
            var logo = this.contentView.addSubview(new View(RectMake(margin, margin, logoSize, logoSize)));
            logo.addCssClass('Logo');
            logo.addCssClass('theredhead');
            logo.autoresizingMask = AutoresizingMask.LockedLeft | AutoresizingMask.LockedTop;
            logo.maximumSize = SizeMake(128, 128);

            var about = this.contentView.addSubview(new View(RectMake(
                (2 * margin) + logo.frame.size.width, margin,
                this.contentView.frame.size.width - (3 * margin) - logo.frame.size.width,
                this.contentView.frame.size.height - (2 * margin)
            )));

            about.autoresizingMask = AutoresizingMask.LockedRight | AutoresizingMask.LockedTop | AutoresizingMask.LockedBottom;
            about.element.style.padding = '0 8px';
            about.element.innerHTML =
                '<p>This software is built with TypedUI, an easy to use typescript frontend development framework built with no external dependencies, intended for desktop replacement web applications.</p>';
        }
    }

    export interface IApplicationDelegate {
        applicationDidFinishLaunching?: Function
    }

    export class Application {
        private _windowManager:WindowManager;
        public get windowManager():WindowManager {
            return this._windowManager;
        }

        private _delegate:IApplicationDelegate;
        public set delegate(delegate:IApplicationDelegate) {
            this._delegate = delegate;
        }

        private _desktop:Desktop;

        public get desktop():Desktop {
            return this._desktop;
        }

        constructor(delegate:IApplicationDelegate = null) {
            this._delegate = delegate;
            this._desktop = new Desktop();
            this._windowManager = new WindowManager(this._desktop);
        }

        public initialize():void {
            this._desktop.element.addEventListener('dblclick', (e:MouseEvent) => {
                if (e.metaKey) {
                    e.preventDefault();
                    this.about();
                }
            }, true);
        }

        public run():void {
            this.initialize();
            if (this._delegate && this._delegate['applicationDidFinishLaunching']) {
                this._delegate.applicationDidFinishLaunching(this);
            }
        }

        private aboutWindow:AboutWindow;

        public about():void {
            if (this.aboutWindow == null) {
                this.aboutWindow = new AboutWindow();
            }
            this.desktop.addSubview(this.aboutWindow);
            this.aboutWindow.center();
            this.aboutWindow.visible = true;
        }
    }

    export class ScrollViewContentView extends View {
        private scrollLeft:number;
        private scrollTop:number;

        public scrolled(e:Event) {
            this.scrollLeft = this.element.scrollLeft;
            this.scrollTop = this.element.scrollTop;
        }
        constructor(aRect:Rect) {
            super(aRect);
            var me = this;
            this.scrollTop = 0;
            this.scrollLeft = 0;
            this.element.addEventListener('scroll', (e:Event) => {me.scrolled(e);}, true);
            this.autoresizesSubviews = false;
        }

        public applyFrame() : void {
            this.element.scrollLeft = this.scrollLeft;
            this.element.scrollTop = this.scrollTop;
            super.applyFrame();
        }
    }
    /**
     * Provides a view that can scroll
     */
    export class ScrollView extends View {
        public get scrollsVertically():boolean {
            return this._scrollsVertically;
        }

        private _scrollsVertically : boolean = true;
        public set scrollsVertically(value:boolean) {
            this._scrollsVertically = value;
            this.applyFrame();
        }
        public get scrollsHorizontally():boolean {
            return this._scrollsHorizontally;
        }

        private _scrollsHorizontally : boolean = true;
        public set scrollsHorizontally(value:boolean) {
            this._scrollsHorizontally = value;
            this.applyFrame();
        }
        private _contentView : View;
        public get contentView() : View {
            return this._contentView;
        }

        private _scrollMode:string = 'auto';
        public get scrollMode():string {
            return this._scrollMode;
        }

        public set scrollMode(value:string) {
            if (['scroll', 'auto'].indexOf(value.toLowerCase())) {
                throw new Error('scrollMode must be either "scroll" or "auto". not "'+value+'".');
            }
            this._scrollMode = value.toLowerCase();
            this.applyFrame();
        }

        public constructor(aRect:red.Rect) {
            super(aRect);
            this._contentView = new ScrollViewContentView(RectMake(0, 0, this.frame.size.width, this.frame.size.height));
            this.contentView.autoresizesSubviews = false;
            this.autoresizesSubviews = false;

            this.addSubview(this._contentView);
        }

        public applyFrame() : void {
            super.applyFrame();

            this.contentView.frame = RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            this.contentView.element.style.overflowX = this.scrollsHorizontally ? this.scrollMode : 'clip';
            this.contentView.element.style.overflowX = this.scrollsVertically ? this.scrollMode : 'clip';
            this.clipsContent = true;
            this.contentView.clipsContent = false;
        }
    }

    export class TextField extends View {
        public get text() : string {
            return this.element.innerText;
        }
        public set text(v:string) {
            this.element.innerText = v;
        }
    }

    export class PushButton extends View {
        public action:any;

        private textField:TextField;

        public get label() : string {
            return this.textField.text;
        }
        public set label(v:string) {
            this.textField.text = v;
        }

        constructor(aRect:Rect) {
            super(aRect);
            this.action = () => {};
            this.textField = new TextField(this.makeLabelFrame());
            this.addSubview(this.textField);
            this.element.addEventListener('click', () => {this.action();}, true);
        }

        public makeLabelFrame() : Rect {
            return red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
        }

        public applyFrame() : void {
            this.textField.frame = this.makeLabelFrame();
            this.textField.element.style.textAlign  = 'center';
            super.applyFrame();
        }
    }

    export enum StackViewOrientation {
        Horizontal,
        Vertical
    }

    export class StackView extends View {
        private _margin: number = 1;
        public get margin():number {
            return this._margin;
        }
        public set margin(value:number) {
            this._margin = value;
        }

        private _orientation:StackViewOrientation = StackViewOrientation.Vertical;
        public get orientation():red.StackViewOrientation {
            return this._orientation;
        }
        public set orientation(value:red.StackViewOrientation) {
            this._orientation = value;
        }

        public addSubView(view:View) {
            super.addSubview(view);
            this.applyStacking();
        }
        public removeSubView(view:View) {
            super.removeSubview(view);
            this.applyStacking();
        }

        public applyStacking() : void {
            var subViews = this.subViews,
                rects : Array<Rect> = [],
                ix = 0;

            for (ix = 0; ix < subViews.length; ix ++) {
                rects.push(subViews[ix].frame);
            }
            switch (this.orientation)
            {
                case StackViewOrientation.Vertical:
                    this.frame.adjustRectsToFitVertically(rects, this.margin);
                    break;

                case StackViewOrientation.Horizontal:
                    this.frame.adjustRectsToFitHorizontally(rects, this.margin);
                    break;
            }

            for (ix = 0; ix < subViews.length; ix ++) {
                subViews[ix].applyFrame();
            }
        }

        public applyFrame() : void {
            this.applyStacking();
        }
    }

    export enum SplitViewOrientation {
        Horizontal,
        Vertical
    }

    export class SplitViewSplitBar extends View {
        constructor(aRect:Rect) {
            super(aRect);
            this.addCssClass('SplitViewSplitBar');
        }
    }

    export class SplitViewAdjustManager {
        private view:SplitView;
        private offsetPosition:number;

        private mouseMoveHandler:any;
        private mouseUpHandler:any;

        private handleMouseMove(e:MouseEvent) {

            if (this.view.orientation == SplitViewOrientation.Horizontal)  {
                let draggedToPosition = e.x - this.offsetPosition - (this.view.splitterSize / 2);
                if (draggedToPosition <= this.view.frame.size.width)
                    this.view.splitterPosition = draggedToPosition;
            }  else  {
                let draggedToPosition = e.y - this.offsetPosition - (this.view.splitterSize / 2);
                if (draggedToPosition <= this.view.frame.size.height)
                    this.view.splitterPosition = draggedToPosition;
            }

            e.preventDefault();
            this.view.applyFrame();
        }

        private handleMouseRelease(e:MouseEvent) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isBeingResized = false;
            this.view.applyFrame();
        }

        constructor(e:MouseEvent, view:SplitView) {
            this.view = view;
            this.view.isBeingResized = true;
            // this.view.splitterPosition = this.view.splitterPosition+1;
            // this.view.splitterPosition = this.view.splitterPosition-1;

            //this.offsetPosition =
            //    (view.orientation == SplitViewOrientation.Horizontal ? (e.x - view.frame.origin.x + view.splitterPosition) : (e.y - view.frame.origin.y + view.splitterPosition));

            if (this.view.orientation == SplitViewOrientation.Horizontal)  {
                this.offsetPosition = e.x - /*view.frame.origin.x +*/ this.view.splitterPosition - (this.view.splitterSize / 2);
            } else {
                this.offsetPosition = e.y - /*view.frame.origin.y +*/ this.view.splitterPosition - (this.view.splitterSize / 2);
            }

            this.mouseMoveHandler = (e:MouseEvent) => {
                this.handleMouseMove(e);
            };
            this.mouseUpHandler = (e:MouseEvent) => {
                this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
        }
    }

    export class SplitView extends View {
        private _isBeingResized:boolean = false;
        public get isBeingResized():boolean {
            return this._isBeingResized;
        }
        public set isBeingResized(value:boolean) {
            this._isBeingResized = value;
        }

        private _orientation:SplitViewOrientation = SplitViewOrientation.Horizontal;
        public get orientation():SplitViewOrientation {
            return this._orientation;
        }
        public set orientation(value:SplitViewOrientation) {
            if (this._orientation != value) {
                this._orientation = value;
                this.applyFrame();
            }
        }

        private _positionFromEnd:Boolean = false;
        public get isPositionedFromEnd():Boolean {
            return this._positionFromEnd;
        }
        public set positionFromEnd(value:Boolean) {
            this._positionFromEnd = value;
        }


        private _splitterSize:number = 8;
        public get splitterSize():number {
            return this._splitterSize;
        }
        public set splitterSize(value:number) {
            if (this._splitterSize != value) {
                this._splitterSize = value;
                this.applyFrame();
            }
        }

        private _splitterPosition:number = -1;
        public get splitterPosition():number {
            if (this._splitterPosition == -1) {
                return this.orientation == SplitViewOrientation.Horizontal
                    ? this.frame.size.height / 2
                    : this.frame.size.width / 2;
            }
            return this._splitterPosition;
        }

        public set splitterPosition(value:number) {
            if (value < 0) value = 0;
            if (value > this.frame.size.width) value = this.frame.size.width;

            if (this._splitterPosition != value) {
                this._splitterPosition = value;
                this.applyFrame();
            }
        }

        public get splitterPositionPercentage():number {
            let position = this.splitterPosition;
            let available = (this.orientation == SplitViewOrientation.Horizontal)
                ? this.frame.size.width
                : this.frame.size.height;

            return (100 / available) * position;
        }

        public set splitterPositionPercentage(v:number) {
            let available = (this.orientation == SplitViewOrientation.Horizontal)
                ? this.frame.size.width
                : this.frame.size.height;

            this.splitterPosition = (available / 100) * v;
        }

        private _splitterView:SplitViewSplitBar;
        public get splitterView():red.View {
            return this._splitterView;
        }
        public set splitterView(value:red.View) {
            this._splitterView = value;
        }

        private _contentView1:View;
        public get contentView1():red.View {
            return this._contentView1;
        }
        public set contentView1(value:red.View) {
            this._contentView1 = value;
        }

        private _contentView2:View;
        public get contentView2():red.View {
            return this._contentView2;
        }
        public set contentView2(value:red.View) {
            this._contentView2 = value;
        }

        constructor(aRect:Rect) {
            super(aRect);
            this.autoresizesSubviews = true;
            this.contentView1 = new ContentView(RectMakeZero());
            this.contentView2 = new ContentView(RectMakeZero());

            this.splitterView = new SplitViewSplitBar(RectMakeZero());
            this.splitterView.setBackgroundColor(colors.lightGray);

            this.addCssClass('SplitView');
            this.splitterView.mouseDown = (e:MouseEvent) => {
                if (!this.isBeingResized) {
                    new SplitViewAdjustManager(e, this);
                }
            };

            // this.splitterView.setBackgroundColor(colors.darkBlue);

            this.addSubview(this.contentView1);
            this.addSubview(this.contentView2);
            this.addSubview(this.splitterView);

            // this.contentView1.setBackgroundColor(red.colors.red);
            // this.contentView2.setBackgroundColor(red.colors.green);

            this.init();
            this.splitterView.clipsContent = false;
            this.contentView1.clipsContent = true;
            this.contentView2.clipsContent = true;
            this.clipsContent = false;
            this.applyFrame();
        }


        public init():void {
            if (this.parentView && this.frame.size != this.parentView.frame.size) {
               this.frame = this.parentView.frame.sizeOnlyCopy();
            }
        }

        public applyFrame():void {
            if (this.orientation == SplitViewOrientation.Horizontal) {
                this.applyFrameHorizontal();
                this.splitterView.removeCssClass('Vertical');
                this.splitterView.addCssClass('Horizontal');
            } else {
                this.applyFrameVertical();
                this.splitterView.removeCssClass('Horizontal');
                this.splitterView.addCssClass('Vertical');
            }

            super.applyFrame();
        }

        private applyFrameHorizontal():void {
            let pos = this._splitterPosition = this._splitterPosition == -1
                ? this.frame.size.width / 2
                : this._splitterPosition;

            this.splitterView.frame = RectMake(pos - (this.splitterSize / 2), 0, this.splitterSize, this.frame.size.height);
            this.contentView1.frame = RectMake(0, 0, this.splitterView.frame.origin.x, this.frame.size.height);
            this.contentView2.frame = RectMake(
                this.splitterView.frame.origin.x + this.splitterView.frame.size.width, 0,
                this.frame.size.width - (this.splitterView.frame.origin.x + this.splitterView.frame.size.width),
                this.frame.size.height);
        }

        private applyFrameVertical():void {
            let pos = this._splitterPosition = this._splitterPosition == -1
                ? this.frame.size.height / 2
                : this._splitterPosition;

            this.splitterView.frame = RectMake(0, pos - (this.splitterSize / 2), this.frame.size.width, this.splitterSize);
            this.contentView1.frame = RectMake(0, 0, this.frame.size.width, this.splitterPosition - (this.splitterSize / 2));
            this.contentView2.frame = RectMake(
                0, this.splitterView.frame.origin.y + this.splitterSize, this.frame.size.width,
                this.frame.size.height - (this.splitterView.frame.origin.y + this.splitterSize));
        }

        public didUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
            if (! this.isBeingResized && this.isPositionedFromEnd) {
                var offset;
                if (this.orientation == SplitViewOrientation.Horizontal) {
                    offset = oldFrame.size.width - this.splitterPosition;
                    this.splitterPosition = newFrame.size.width - offset;
                    if (this.splitterPosition < 0)
                        this.splitterPosition = 0;
                    else if (this.splitterPosition > newFrame.size.width)
                        this.splitterPosition =  newFrame.size.width;
                } else {
                    offset = oldFrame.size.height - this.splitterPosition;
                    this.splitterPosition = newFrame.size.height- offset;
                    if (this.splitterPosition < 0)
                        this.splitterPosition = 0;
                    else if (this.splitterPosition > newFrame.size.height)
                        this.splitterPosition =  newFrame.size.height;
                }
            }
            super.didUpdateFrame(oldFrame, newFrame);
        }
    }

    export class HorizontalSplitView extends SplitView
    {
        public init() : void {
            this.orientation = SplitViewOrientation.Horizontal;
        }
    }
    export class VerticalSplitView extends SplitView
    {
        public init() : void {
            this.orientation = SplitViewOrientation.Vertical;
        }
    }

    export class TextEditor extends View
    {
        private _editor : any;
        private _ace : HTMLElement;

        private _delegate : any;

        public get delegate() : any {
            return this._delegate;
        }
        public set delegate(d:any) : void {
            this._delegate = d;
        }

        public get mode() : string {
            return this._editor.getSession().getMode();

        }
        public set mode(v : string) : void{
            this._editor.getSession().setMode(v);
        }


        public get stringValue() : string {
            return this._editor.getValue();
        }

        public set stringValue(v:string){
            return this._editor.setValue(v);
        }

        public constructor(rect:Rect) {
            super(rect);
            var me = this;
            this._ace = document.createElement('div');
            this.element.appendChild(this._ace);
            this._editor = ace.edit(this._ace);

            this._editor.getSession().on('change', function(e) {
                me.onStringValueDidChange(e);
            });
        }

        public didUpdateFrame(oldFrame:Rect, newFrame:Rect):void {
            window.dispatchEvent(new Event('resize')); // force ace to update
        }


        public onStringValueDidChange(e:any) {
            // console.log('onStringValueDidChange', e, this.stringValue);

            if (this.delegate) {
                let fn = this.delegate.stringValueDidChange;
                if (typeof fn == 'function')
                    fn.call(this.delegate, this);
            }
        }

        public applyFrame() : void {
            this._ace.style.position = 'absolute';
            this._ace.style.display = 'block';
            this._ace.style.top = this.frame.origin.y + 'px';
            this._ace.style.left = this.frame.origin.x + 'px';
            this._ace.style.height = this.frame.size.height + 'px';
            this._ace.style.width = this.frame.size.width + 'px';

            super.applyFrame();
        }
    }



    export class TabContainer extends View
    {
        private _tabs : Array<Tab> = [];
        public get tabs() : Array<Tab> { return this._tabs; }

        private _buttonBar : TabButtonBar;

        constructor(r:Rect) {
            super(r);
            this._buttonBar = new TabButtonBar(RectMakeZero(SizeMake(r.size.width, 24)));
            this._buttonBar.setBackgroundColor(colors.green);

            this.applyFrame();
        }

        public applyFrame() : void {
            this._buttonBar.frame = RectMakeZero(SizeMake(this.frame.size.width, 24));

            super.applyFrame();
        }
    }

    export class TabButtonBar extends View
    {
        private _tabs : Array<Tab> = [];
        public get tabs() : Array<Tab> { return this._tabs; }

        public applyFrame() : void
        {


            super.applyFrame();
        }
    }


    export class Tab
    {
        private _label : string;
        public get label() : string { return this._label; }
        public set label(v:string) : void { this._label = v; }

        private _contentView : View;
        public get contentView() : View { return this._contentView; }
        public set contentView(v:View) : void { this._contentView = v; }

        constructor(lbl: string, cntView:View) {
            this.label = label;
            this.contentView = cntView;
        }
    }


    export var application;
    document.addEventListener('DOMContentLoaded', ()=>{
        application = new Application();
    }, true);
}