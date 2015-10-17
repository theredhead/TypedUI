declare module red {
    function typeId(anObject: Object): string;
    class Notification {
        private _sender;
        public notificationKind : string;
        public sender : Object;
        constructor(sender: Object);
    }
    class PropertyChangeNotification extends Notification {
        private _propertyName;
        public propertyName : string;
        constructor(propertyName: string, sender: Object);
    }
    class PropertyWillChangeNotification extends PropertyChangeNotification {
    }
    class PropertyDidChangeNotification extends PropertyChangeNotification {
    }
    class NotificationRequest {
        private _notificationKind;
        private _target;
        private _action;
        public notificationKind : string;
        public act(notification: Notification): void;
        constructor(aNotificationKind: string, aTarget: Object, anAction: string);
    }
    class Observable {
        private _observers;
        public registerObserver(notificationKind: string, target: Object, action: string): void;
        public notifyPropertyWillChange(propertyName: string): void;
        public notifyPropertyDidChange(propertyName: string): void;
        public notifyListeners(notification: Notification): void;
        constructor();
    }
    class Point {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class Size {
        public width: number;
        public height: number;
        constructor(width: number, height: number);
    }
    class Rect {
        public origin: Point;
        public size: Size;
        public shrink(pixels: number): Rect;
        public copy(): Rect;
        public toClipString(): string;
        public adjustRectsToFitHorizontally(rects: Rect[], margin?: number): void;
        public adjustRectsToFitVertically(rects: Rect[], margin?: number): void;
        constructor(origin: Point, size: Size);
    }
    function PointMake(x: any, y: any): Point;
    function SizeMake(width: any, height: any): Size;
    function RectMake(x: any, y: any, width: any, height: any): Rect;
    function RectMakeZero(): Rect;
    class UIElement {
        private _cursor;
        private _color;
        private _backgroundColor;
        private _backgroundImage;
        public setCursor(crsr: string): void;
        public setColor(color: Color): void;
        public setBackgroundColor(color: Color): void;
        public setBackgroundImage(anImageUrl: string): void;
        private _clipsContent;
        public clipsContent : boolean;
        private _frame;
        public frame : Rect;
        private _tag;
        public tag : string;
        private _element;
        public element : HTMLElement;
        private _tagName;
        public tagName : string;
        private _cssClasses;
        constructor(frame: Rect);
        public applyFrame(): void;
        public cssCasses : string[];
        public hasCssClass(aClass: string): boolean;
        public addCssClass(aClass: string): void;
        public removeCssClass(aClass: string): void;
        public toggleCssClass(aClass: string): void;
    }
    class Color {
        private _r;
        private _g;
        private _b;
        private _alpha;
        private adjustToByte(i);
        private adjustAlpha(i);
        constructor(r: number, g: number, b: number, alpha?: number);
        public toString(): string;
    }
    class View extends UIElement {
        private _parentView;
        public parentView : View;
        private _autoresizingMask;
        public autoresizingMask : boolean;
        private _autoresizesChildViews;
        public autoresizesChildViews : string;
        private _adjustToParentRect(rect);
        public resizeInRect(rect: Rect): void;
        public applyFrame(): void;
        private _isResizing;
        public isResizing : boolean;
        private _isBeingDragged;
        public isBeingDragged : boolean;
        private _allowDragAndDrop;
        public allowDragAndDrop : boolean;
        private _subViews;
        public addSubView(aView: View): View;
        public removeSubView(aView: View): View;
        public center(inRect?: Rect): void;
        constructor(frame: Rect);
        public mouseDown(e: MouseEvent): void;
        public mouseUp(e: MouseEvent): void;
        public draw(): void;
    }
    class Desktop extends View {
        constructor();
    }
    class ViewDragManager {
        public view: View;
        private offsetX;
        private offsetY;
        private mouseMoveHandler;
        private mouseUpHandler;
        private handleMouseMove(e);
        private handleMouseRelease(e);
        constructor(e: MouseEvent, view: View);
    }
    class ViewResizeManager {
        private view;
        private offsetX;
        private offsetY;
        private originalFrame;
        private resizeDirectionMask;
        private busy;
        private initialMouseEvent;
        private mouseMoveHandler;
        private mouseUpHandler;
        private constrain(val, min, max);
        private handleMouseMove(e);
        private handleMouseRelease(e);
        constructor(e: MouseEvent, view: View, directionMask: number);
    }
    class TitleBar extends View {
        public forWindow : Window;
    }
    class WindowManager {
        private _front;
        private _windows;
        public windows : Window[];
        public addWindow(window: Window): void;
        public orderFront(window: Window): void;
    }
    class ContentView extends View {
    }
    enum WindowToolType {
        Close = 0,
        Minimize = 1,
        Resize = 2,
    }
    class WindowTool extends View {
        constructor(rect: Rect, type: WindowToolType);
    }
    class WindowSizeHandle extends View {
        constructor(rect: Rect);
    }
    class UserResizableView extends View {
        private _minimumSize;
        public minimumSize : Rect;
        private _maximumSize;
        public maximumSize : Rect;
        private _isHorizontallySizable;
        public isHorizontallySizable : boolean;
        private _isVertictallySizable;
        public isVertictallySizable : boolean;
        private _resizeBorderThickness;
        public resizeBorderThickness : number;
        private _sizeHandleHorizontallyLeft;
        private _sizeHandleHorizontallyRight;
        private _sizeHandleVerticallyTop;
        private _sizeHandleVerticallyallyBottom;
        private _sizeHandleTopLeft;
        private _sizeHandleTopRight;
        private _sizeHandleBottomLeft;
        private _sizeHandleBottomRight;
        constructor(aRect: Rect);
        public applyFrame(): void;
    }
    class UserDraggableView extends UserResizableView {
        private _isDraggable;
        public isDraggable : boolean;
        private _dragHandleView;
        public dragHandleView : View;
        constructor(aRect: Rect);
    }
    class Window extends UserDraggableView {
        private _titleBar;
        private _contentView;
        private _windowManager;
        private _canBecomeKey;
        private _tools;
        private _closeTool;
        private _resizeTool;
        private _minimizeTool;
        public orderFront(): void;
        constructor(aRect?: Rect);
        public applyFrame(): void;
        public mouseDown(e: MouseEvent): void;
        public mouseUp(e: MouseEvent): void;
    }
    interface IApplicationDelegate {
        applicationDidFinishLaunching?: Function;
    }
    class Application {
        private _windowManager;
        public windowManager : WindowManager;
        private _delegate;
        public delegate : IApplicationDelegate;
        private _desktop;
        public desktop : Desktop;
        constructor(delegate?: IApplicationDelegate);
        public initialize(): void;
        public run(): void;
    }
    var application: Application;
}
