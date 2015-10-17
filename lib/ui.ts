/**
 * © Kris Herlaar <kris@theredhead.nl>
 */
module red {

	export function typeId(anObject: Object): string {
		var matches = /function (.{1,})\(/.exec(anObject['constructor'].toString());
		return (matches && matches.length > 1) ? matches[1] : '';
	}

	export class Notification {
		private _sender: Object;
		public get notificationKind(): string {
			return typeId(this);
		}
		public get sender() {
			return this._sender;
		}

		constructor(sender: Object) {
			this._sender = sender;
		}
	}
	export class PropertyChangeNotification extends Notification {
		private _propertyName: string;
		get propertyName(): string {
			return this._propertyName;
		}
		constructor(propertyName: string, sender: Object) {
			super(sender);
			this._propertyName = propertyName;
		}
	}
	export class PropertyWillChangeNotification extends PropertyChangeNotification {
	}
	export class PropertyDidChangeNotification extends PropertyChangeNotification {
	}

	export class NotificationRequest {
		private _notificationKind: string;
		private _target: Object;
		private _action: string;

		public get notificationKind(): string {
			return this._notificationKind;
		}

		public act(notification: Notification): void {
			this._target[this._action](notification.sender);
		}
		constructor(aNotificationKind: string, aTarget: Object, anAction: string) {
			this._notificationKind = aNotificationKind;
			this._target = aTarget
			this._action = anAction;
		}
	}

	export class Observable {
		private _observers: Array<NotificationRequest>;

		public registerObserver(notificationKind: string, target: Object, action: string) {
			this._observers.push(new NotificationRequest(notificationKind, target, action));
		}

		public notifyPropertyWillChange(propertyName: string) {
			this.notifyListeners(new PropertyWillChangeNotification(propertyName, this));
		}

		public notifyPropertyDidChange(propertyName: string) {
			this.notifyListeners(new PropertyDidChangeNotification(propertyName, this));
		}

		public notifyListeners(notification: Notification): void {
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
		public x: number;
		public y: number;

        public toString() : string {
            return 'Point('+this.x+', '+this.y+')';
        }

		constructor(x: number, y: number) {
			this.x = x;
			this.y = y;
		}
	}
	export class Size {
		public width: number;
		public height: number;

        public toString() : string {
            return 'Size('+this.width+', '+this.height+')';
        }

        constructor(width: number, height: number) {
			this.height = height;
			this.width = width;
		}
	}
	export class Rect {
		public origin: Point;
		public size: Size;

		public shrink(pixels: number): Rect {
			return RectMake(
				this.origin.x + pixels,
				this.origin.y + pixels,
				this.size.width - 2 * pixels,
				this.size.height - 2 * pixels);
		}

		public copy(): Rect {
			return RectMake(
				this.origin.x,
				this.origin.y,
				this.size.width,
				this.size.height);
		}
		public toClipString(): string {
			return 'rect(0px,' + (this.size.width).toFixed(0) + 'px,' + (this.size.height).toFixed(0) + 'px,0px)';
		}

		public adjustRectsToFitHorizontally(rects: Array<Rect>, margin: number = 0) {
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
		public adjustRectsToFitVertically(rects: Array<Rect>, margin: number = 0) {
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

		constructor(origin: Point, size: Size) {
			this.origin = origin;
			this.size = size;
		}
	}
	export function PointMake(x, y): Point {
		return new Point(x, y);
	}
	export function SizeMake(width, height): Size {
		return new Size(width, height);
	}
	export function RectMake(x, y, width, height): Rect {
		return new Rect(PointMake(x, y), SizeMake(width, height));
	}
	export function RectMakeZero(): Rect {
		return RectMake(0, 0, 0, 0);
	}

	export class UIElement {
		private _cursor: string;
		private _color: Color;
		private _backgroundColor: Color;
		private _backgroundImage: string;
        private _visible: boolean = true;

        public get visible() : boolean {
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

		public setCursor(crsr: string): void {
			this._cursor = crsr;
			this.applyFrame();
		}

		public setColor(color: Color) {
			this._color = color;
			this.applyFrame();
		}

		public setBackgroundColor(color: Color) {
			this._backgroundColor = color;
			this.applyFrame();
		}

		public setBackgroundImage(anImageUrl: string) {
			this._backgroundImage = anImageUrl;
			this.applyFrame();
		}

		private _clipsContent: boolean = true;
		public get clipsContent(): boolean {
			return this._clipsContent;
		}
		public set clipsContent(v: boolean) {
			this._clipsContent = v;
		}

        /**
         * treat as private.
         */
		public _frame: Rect;
		public get frame(): Rect {
			return this._frame;
		}
		public set frame(v: Rect) {
            if (this._frame != v) {
                var oldFrame = this._frame;
                this.willUpdateFrame(oldFrame, v);
                this._frame = v;
                this.didUpdateFrame(oldFrame, v);
                this.applyFrame();
            }
		}

        public willUpdateFrame(oldFrame:Rect, newFrame:Rect) : void {}
        public didUpdateFrame(oldFrame:Rect, newFrame:Rect) : void {}

		private _tag: string;
		public get tag(): string {
			return this._tag;
		}
		public set tag(v: string) {
			this._tag = v;
		}

		private _element: HTMLElement;
		public get element(): HTMLElement {
			return this._element;
		}
		private _tagName: string = 'div';
		public get tagName(): string {
			return this._tagName;
		}
		private _cssClasses: Array<string> = [];

		constructor(frame: Rect) {
			this.addCssClass('ui');
			this.addCssClass(typeId(this));
			this._frame = frame;
			this._element = document.createElement(this.tagName);
		}

		public applyFrame(): void {
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

			if (this.clipsContent)
				this._element.style.clip = this.frame.toClipString();
			else
				this._element.style.clip = null;

			if (this._cursor)
				this.element.style.cursor = this._cursor;
			if (this._backgroundColor)
				this.element.style.backgroundColor = this._backgroundColor.toString();
			if (this._backgroundImage)
				this.element.style.background = 'url(' + this._backgroundImage + ')';

		}

		public get cssCasses(): Array<string> {
			return this._cssClasses;
		}
		public hasCssClass(aClass: string) {
			return this._cssClasses.indexOf(aClass) > -1;
		}
		public addCssClass(aClass: string) {
			if (!this.hasCssClass(aClass)) {
				this._cssClasses.push(aClass);
			}
		}
		public removeCssClass(aClass: string) {
			if (!this.hasCssClass(aClass)) {
				this._cssClasses.splice(this._cssClasses.indexOf(aClass));
			}
		}
		public toggleCssClass(aClass: string) {
			if (!this.hasCssClass(aClass)) {
				this.removeCssClass(aClass);
			} else {
				this.addCssClass(aClass);
			}
		}
	}

	export class Color {
		private _r: number;
		private _g: number;
		private _b: number;
		private _alpha: number;

		private adjustToByte(i: number): number {
			var o = Math.ceil(i);

			if (o < 0) {
				return 0;
			} else if (o > 255) {
				return 255;
			}
			else return o;
		}

		private adjustAlpha(i: number): number {
			if (i < 0) {
				return 0;
			} else if (i > 1) {
				return 1;
			}
			else return i;
		}
		constructor(r: number, g: number, b: number, alpha: number = 1.0) {
			this._r = this.adjustToByte(r);
			this._g = this.adjustToByte(g);
			this._b = this.adjustToByte(b);
			this._alpha = this.adjustAlpha(alpha);
		}

		public toString(): string {
			var result = 'rgba(' + [
				this._r.toFixed(0),
				this._g.toFixed(0),
				this._b.toFixed(0),
				this._alpha
			].join(', ') + ')';
			return result;
		}
	}

	var colors = {
		red: new Color(255, 0, 0),
		green: new Color(0, 255, 0),
		blue: new Color(0, 0, 255),
		darkRed: new Color(127, 0, 0),
		darkGreen: new Color(0, 127, 0),
		darkBlue: new Color(0, 0, 127),
		black: new Color(0, 0, 0),
		white: new Color(255, 255, 255)
	};

	enum Autoresize
	{
		LockedTop		= 1,
		LockedLeft		= 2,
		LockedBottom	= 4,
		LockedRight		= 8,
		WidthSizable	= 16,
		HeightSizable	= 32
	}
    var viewId = 0;
	export class View extends UIElement {

        private _identifier:string;

        public get identifier() : string {
            return this._identifier;
        }

        public toString() : string {
            return this.identifier;
        }

		private _parentView: View;
		public get parentView(): View {
			return this._parentView;
		}
		public set parentView(aView: View) {
			this._parentView = aView;
		}

		private _autoresizingMask: number;
		public get autoresizingMask(): number {
			return this._autoresizingMask;
		}
		public set autoresizingMask(v: number) {
			if(this._autoresizingMask = v) {
				this._autoresizingMask = v
			}
		}

		private _autoresizesChildViews: string;
		public get autoresizesChildViews(): string {
			return this._autoresizesChildViews;
		}
		public set autoresizesChildViews(v: string) {
			this._autoresizesChildViews = v;
		}

		public resizeSubviewsWithOldSize(size: Size): void {
            //console.log(
            //    'resized ' + this.toString() +
            //    ' from size: ' + this.frame.size.toString() +
            //    ' to size: ' + size.toString()
            //);
		}

		public applyFrame(): void {
			super.applyFrame();
			for (var ix = 0; ix < this._subViews.length; ix++) {
				this._subViews[ix].applyFrame();
			}
		}

		private _isResizing: boolean;
		public get isResizing(): boolean {
			return this._isResizing;
		}
		public set isResizing(v: boolean) {
			this._isResizing = v;
		}


		private _isBeingDragged: boolean;
		public get isBeingDragged(): boolean {
			return this._isBeingDragged;
		}
		public set isBeingDragged(v: boolean) {
			this._isBeingDragged = v;
		}


		private _allowDragAndDrop: boolean;
		public get allowDragAndDrop(): boolean {
			return this._allowDragAndDrop;
		}
		public set allowDragAndDrop(v: boolean) {
			this._allowDragAndDrop = v;
		}

		private _subViews: Array<View> = [];

		public addSubView(aView: View): View {
			this._subViews.push(aView);
			aView._parentView = this;
			this.element.appendChild(aView.element);
			aView.draw();
			return aView;
		}
		public removeSubView(aView: View): View {
			this._subViews.splice(this._subViews.indexOf(aView));
			this.element.removeChild(aView.element);
			return aView;
		}

		public center(inRect: Rect = null): void {
			var parentFrame = inRect || this._parentView.frame,
				myFrame = this.frame,
				offsetX = parentFrame.size.width / 2 - myFrame.size.width / 2,
				offsetY = parentFrame.size.height / 2 - myFrame.size.height / 2;
			this.frame.origin = PointMake(offsetX, offsetY);
            this.applyFrame();
		}

		constructor(frame: Rect) {
			super(frame);
            this._identifier = typeId(this) + (viewId++).toString();
			this._isBeingDragged = false;
			this._isResizing = false;

			var me = this;
			this.element.addEventListener('mousedown', (e) => { me.mouseDown(e) });
			this.element.addEventListener('mouseup', (e) => { me.mouseUp(e) });
		}

		public mouseDown(e: MouseEvent): void { }
		public mouseUp(e: MouseEvent): void { }

		public draw(): void {
            this.applyFrame();
		}
	}

	export class Desktop extends View {
		constructor() {
			super(RectMake(0, 0, window.innerWidth, window.innerHeight));
			this.addCssClass(typeId(this));
			document.getElementsByTagName('body').item(0).appendChild(this.element);
		}
	}

	export class ViewDragManager {
		view: View;
		private offsetX;
		private offsetY;

		private mouseMoveHandler: any;
		private mouseUpHandler: any;

		private handleMouseMove(e: MouseEvent) {
			this.view.frame.origin = PointMake(e.x - this.offsetX, e.y - this.offsetY);
			this.view.applyFrame();
		}
		private handleMouseRelease(e: MouseEvent) {
			document.removeEventListener('mousemove', this.mouseMoveHandler, true);
			document.removeEventListener('mouseup', this.mouseUpHandler, true);
			this.view.isBeingDragged = false;
		}
		constructor(e: MouseEvent, view: View) {
			this.view = view;
			this.view.isBeingDragged = true;
			this.offsetX = e.x - view.frame.origin.x;
			this.offsetY = e.y - view.frame.origin.y;

			this.mouseMoveHandler = (e: MouseEvent) => { this.handleMouseMove(e); };
			this.mouseUpHandler = (e: MouseEvent) => { this.handleMouseRelease(e); };
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
		private view: View;
		private offsetX;
		private offsetY;
		private originalFrame: Rect;
		private resizeDirectionMask: number;
		private busy: boolean;
		private initialMouseEvent: MouseEvent;
		private mouseMoveHandler: any;
		private mouseUpHandler: any;

		private constrain(val: number, min: number, max: number): number {
			if (val < min || val)
				return min;
			if (val > max || val)
				return max;
			return val;
		}

		private handleMouseMove(e: MouseEvent) {
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
			this.view.applyFrame();
			this.busy = false;
		}

		private handleMouseRelease(e: MouseEvent) {
			document.removeEventListener('mousemove', this.mouseMoveHandler, true);
			document.removeEventListener('mouseup', this.mouseUpHandler, true);
			this.view.isResizing = false;
			this.view.isBeingDragged = false;
			this.view.applyFrame();
		}

		constructor(e: MouseEvent, view: View, directionMask: number) {
			this.busy = true;
			this.initialMouseEvent = e;
			this.view = view;
			this.view.isResizing = true;
			this.originalFrame = this.view.frame;
			this.resizeDirectionMask = directionMask;
			this.offsetX = e.offsetX;
			this.offsetY = e.offsetY;

			this.mouseMoveHandler = (e: MouseEvent) => { this.handleMouseMove(e); };
			this.mouseUpHandler = (e: MouseEvent) => { this.handleMouseRelease(e); };
			document.addEventListener('mousemove', this.mouseMoveHandler, true);
			document.addEventListener('mouseup', this.mouseUpHandler, true);
			this.busy = false;
		}
	}


	export class TitleBar extends View {
		public get forWindow(): Window {
			return <Window>this.parentView;
		}
	}

	export class WindowManager {
        private _front: Window;
		private _windows: Array<Window> = [];
		public get windows(): Array<Window> {
			return this._windows;
		}

        public addWindow(window: Window) {
            this._windows.push(window);
        }

		public orderFront(window: Window): void {
            var oldFront, newFront;

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
                container.removeChild(newFront.element);
                container.appendChild(newFront.element);

                newFront.addCssClass('front');
            }

            this._front = window;
		}
	}

    export class ContentView extends View { }

	export enum WindowToolType {
		Close,
		Minimize,
		Resize
	}
	export class WindowTool extends View {
		constructor(rect: Rect, type: WindowToolType) {
			super(rect);
			this.addCssClass(WindowToolType[type]);
			this.clipsContent = false;
		}
	}

	export class WindowSizeHandle extends View {
		constructor(rect: Rect) {
			super(rect);
			// this.setBackgroundColor(colors.red);
		}
	}

	export class UserResizableView extends View {

        private _minimumSize:Size;
        public get minimumSize() : Size {
            return this._minimumSize;
        }
        public set minimumSize(v:Size) {
            this._minimumSize = v;
        }

        private _maximumSize:Size;
        public get maximumSize() : Size {
            return this._maximumSize;
        }
        public set maximumSize(v:Size) {
            this._maximumSize = v;
        }

		private _isHorizontallySizable: boolean;
		public get isHorizontallySizable(): boolean {
			return this._isHorizontallySizable;
		}
		public set isHorizontallySizable(v: boolean) {
			this._isHorizontallySizable = v;
		}

		private _isVertictallySizable: boolean;
		public get isVertictallySizable(): boolean {
			return this._isVertictallySizable;
		}
		public set isVertictallySizable(v: boolean) {
			this._isVertictallySizable = v;
		}


		private _resizeBorderThickness: number;
		public get resizeBorderThickness(): number {
			return Math.round(this._resizeBorderThickness);
		}
		public set resizeBorderThickness(v: number) {
			this._resizeBorderThickness = v;
		}

		private _sizeHandleHorizontallyLeft: WindowSizeHandle;
		private _sizeHandleHorizontallyRight: WindowSizeHandle;
		private _sizeHandleVerticallyTop: WindowSizeHandle;
		private _sizeHandleVerticallyallyBottom: WindowSizeHandle;
		private _sizeHandleTopLeft: WindowSizeHandle;
		private _sizeHandleTopRight: WindowSizeHandle;
		private _sizeHandleBottomLeft: WindowSizeHandle;
		private _sizeHandleBottomRight: WindowSizeHandle;

		constructor(aRect: Rect) {
			super(aRect);
			this._resizeBorderThickness = 4;
			var thickness = this._resizeBorderThickness;
			this._sizeHandleTopLeft = this.addSubView(new WindowSizeHandle(
				RectMake(0, 0, thickness, thickness)));
			this._sizeHandleTopLeft.setCursor('nw-resize');

			this._sizeHandleTopRight = this.addSubView(new WindowSizeHandle(
				RectMake(aRect.size.width - thickness, 0, thickness, thickness)));
			this._sizeHandleTopRight.setCursor('ne-resize');

			this._sizeHandleBottomLeft = this.addSubView(new WindowSizeHandle(
				RectMake(0, aRect.size.height - thickness, thickness, thickness)));
			this._sizeHandleBottomLeft.setCursor('sw-resize');

			this._sizeHandleBottomRight = this.addSubView(new WindowSizeHandle(
				RectMake(aRect.size.width - thickness, aRect.size.height - thickness, thickness, thickness)));
			this._sizeHandleBottomRight.setCursor('se-resize');

			this._sizeHandleHorizontallyLeft = this.addSubView(new WindowSizeHandle(
				RectMake(0, thickness, thickness, aRect.size.height - (2 * thickness))));
			this._sizeHandleHorizontallyLeft.setCursor('w-resize');

			this._sizeHandleHorizontallyRight = this.addSubView(new WindowSizeHandle(
				RectMake(aRect.size.width - thickness, thickness, thickness, aRect.size.height - (2 * thickness))));
			this._sizeHandleHorizontallyRight.setCursor('e-resize');

			this._sizeHandleVerticallyTop = this.addSubView(new WindowSizeHandle(
				RectMake(thickness, 0, aRect.size.width - (2 * thickness), thickness)));
			this._sizeHandleVerticallyTop.setCursor('n-resize');

			this._sizeHandleVerticallyallyBottom = this.addSubView(new WindowSizeHandle(
				RectMake(thickness, aRect.size.height - thickness, aRect.size.width - (2 * thickness), thickness)));
			this._sizeHandleVerticallyallyBottom.setCursor('s-resize');
			
			// this.applyFrame();
			
			var theView = this;
			this._sizeHandleHorizontallyRight.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.East);
				}
			};
			this._sizeHandleHorizontallyLeft.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.West);
				}
			};
			this._sizeHandleVerticallyTop.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable) {
					new ViewResizeManager(e, theView, Resize.North);
				}
			};
			this._sizeHandleVerticallyallyBottom.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable) {
					new ViewResizeManager(e, theView, Resize.South);
				}
			};
			
			this._sizeHandleTopLeft.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.North | Resize.West);
				}
			};

			this._sizeHandleTopRight.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.North | Resize.East);
				}
			};

			this._sizeHandleBottomLeft.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.South | Resize.West);
				}
			};

			this._sizeHandleBottomRight.mouseDown = (e: MouseEvent) => {
				if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
					new ViewResizeManager(e, theView, Resize.South | Resize.East);
				}
			};
			
            this.isHorizontallySizable = true;
            this.isVertictallySizable = true;			
		}

        public willUpdateFrame(oldFrame:Rect, newFrame:Rect) : void {
            if (this.minimumSize && newFrame.size.width < this.minimumSize.width) {
                newFrame.size.width = this.minimumSize.width;
            }
            if (this.minimumSize && newFrame.size.height< this.minimumSize.height) {
                newFrame.size.height= this.minimumSize.height;
            }
            if (this.maximumSize && newFrame.size.width > this.maximumSize.width) {
                newFrame.size.width = this.maximumSize.width;
            }
            if (this.maximumSize && newFrame.size.height> this.maximumSize.height) {
                newFrame.size.height= this.maximumSize.height;
            }

            this.resizeSubviewsWithOldSize(oldFrame.size);
        }

		public applyFrame() {
			super.applyFrame();
			var thickness = this.resizeBorderThickness;
			this._sizeHandleTopLeft.frame = RectMake(0, 0, thickness, thickness);
			this._sizeHandleTopRight.frame = RectMake(this.frame.size.width - thickness, 0, thickness, thickness);
			this._sizeHandleBottomLeft.frame = RectMake(0, this.frame.size.height - thickness, thickness, thickness);
			this._sizeHandleBottomRight.frame = RectMake(this.frame.size.width - thickness, this.frame.size.height - thickness, thickness, thickness);
			this._sizeHandleHorizontallyLeft.frame = RectMake(0, thickness, thickness, this.frame.size.height - (2 * thickness));
			this._sizeHandleHorizontallyRight.frame = RectMake(this.frame.size.width - thickness, thickness, thickness, this.frame.size.height - (2 * thickness));
			this._sizeHandleVerticallyTop.frame = RectMake(thickness, 0, this.frame.size.width - (2 * thickness), thickness);
			this._sizeHandleVerticallyallyBottom.frame = RectMake(thickness, this.frame.size.height - thickness, this.frame.size.width - (2 * thickness), thickness);
		}
	}

	export class UserDraggableView extends UserResizableView {
		
		private _isDraggable : boolean;
		public get isDraggable() : boolean {
			return this._isDraggable && this._dragHandleView != null;
		}
		public set isDraggable(v : boolean) {
			this._isDraggable = v;
		}
		
		private _dragHandleView : View;
		public get dragHandleView() : View {
			return this._dragHandleView || this;
		}
		public set dragHandleView(v : View) {
			if (v != this._dragHandleView) {
				this._dragHandleView = v;
				
				if (this.isDraggable)
					this.dragHandleView.mouseDown = (e:MouseEvent) => {
						new ViewDragManager(e, this);
					};
				else
					this.dragHandleView.mouseDown = (e:MouseEvent) => {};
			}
		}
		
		constructor(aRect:Rect) {
			super(aRect);
		}
	}

	export class Window extends UserDraggableView {
		private _titleBar: View;
		private _contentView: View;
		private _windowManager: WindowManager;
        private _canBecomeKey: boolean;

		private _tools: View;
		private _closeTool: WindowTool;
		private _resizeTool: WindowTool;
		private _minimizeTool: WindowTool;

		public orderFront(): void {
			this._windowManager.orderFront(this);
		}

		constructor(aRect: Rect = null) {
			super(aRect = aRect || RectMake(0, 0, 329, 200));
			this.clipsContent = false;
			this._canBecomeKey = true;
			this._windowManager = application.windowManager;
            this._windowManager.windows.push(this);

			this._titleBar = new TitleBar(RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26));
			this.isDraggable = true;
			this.dragHandleView = this._titleBar;

			this.addSubView(this._titleBar);
			var m = this.resizeBorderThickness;
			this._contentView = this.addSubView(new ContentView(
				RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m)));

			this.allowDragAndDrop = true;
			this.applyFrame();

			this._tools = this._titleBar.addSubView(new View(RectMake(2, 2, 80, 20)));
			this._tools.addCssClass('WindowTools');

			var y = 4, s = 12, o = 8;
			this._resizeTool = this._tools.addSubView(new WindowTool(RectMake(o, y, s, s), WindowToolType.Resize));
			this._minimizeTool = this._tools.addSubView(new WindowTool(RectMake(o + (2 * s), y, s, s), WindowToolType.Minimize));
			this._closeTool = this._tools.addSubView(new WindowTool(RectMake(o + (4 * s), y, s, s), WindowToolType.Close));
		}

		public applyFrame(): void {
			super.applyFrame();
			this._titleBar.frame = RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26);
			var m = this.resizeBorderThickness;
			this._contentView.frame = RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m);
		}
		public mouseDown(e: MouseEvent): void {
			this.orderFront();
			
		}
		public mouseUp(e: MouseEvent): void {

		}
	}


	export interface IApplicationDelegate {
		applicationDidFinishLaunching?: Function
	}

	export class Application {
		private _windowManager: WindowManager;
		public get windowManager(): WindowManager {
			return this._windowManager;
		}

		private _delegate: IApplicationDelegate;
		public set delegate(delegate: IApplicationDelegate) {
			this._delegate = delegate;
		}
		private _desktop: Desktop;

		public get desktop(): Desktop {
			return this._desktop;
		}

		constructor(delegate: IApplicationDelegate = null) {
			this._delegate = delegate;
			this._windowManager = new WindowManager();
		}
		public initialize(): void {
			this._desktop = new Desktop();
		}
		public run(): void {
			this.initialize();
			if (this._delegate && this._delegate['applicationDidFinishLaunching']) {
				this._delegate.applicationDidFinishLaunching(this);
			}
		}
	}

	export var application = new Application();
}