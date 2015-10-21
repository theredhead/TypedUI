/**
* © Kris Herlaar <kris@theredhead.nl>
*/
declare module red {
    var settings: {
        debug: boolean;
        displayRectInfo: boolean;
    };
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
        private prep(n);
        private _x;
        public x : number;
        private _y;
        public y : number;
        public toString(): string;
        constructor(x: number, y: number);
        public distanceTo(other: Point): Point;
    }
    class Size {
        private prep(n);
        private _width;
        public width : number;
        private _height;
        public height : number;
        public toString(): string;
        constructor(width: number, height: number);
    }
    class Rect {
        public origin: Point;
        public size: Size;
        public center : Point;
        public shrink(pixels: number): Rect;
        public copy(): Rect;
        public toString(): string;
        public isEquivalentTToRect(otherRect: Rect): boolean;
        public intersects(other: Rect): boolean;
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
        private _visible;
        public visible : boolean;
        public setCursor(crsr: string): void;
        public setColor(color: Color): void;
        public setBackgroundColor(color: Color): void;
        public setBackgroundImage(anImageUrl: string): void;
        private _clipsContent;
        public clipsContent : boolean;
        /**
        * treat as private.
        */
        public _frame: Rect;
        public frame : Rect;
        public willUpdateFrame(oldFrame: Rect, newFrame: Rect): void;
        public didUpdateFrame(oldFrame: Rect, newFrame: Rect): void;
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
    var colors: {
        white: Color;
        lightGray: Color;
        gray: Color;
        darkGray: Color;
        black: Color;
        red: Color;
        green: Color;
        blue: Color;
        darkRed: Color;
        darkGreen: Color;
        darkBlue: Color;
    };
    enum AutoresizingMask {
        LockedTop = 1,
        LockedLeft = 2,
        LockedBottom = 4,
        LockedRight = 8,
        WidthSizable = 16,
        HeightSizable = 32,
    }
    class View extends UIElement {
        private _identifier;
        private _minimumSize;
        public minimumSize : Size;
        private _maximumSize;
        public maximumSize : Size;
        public identifier : string;
        public toString(): string;
        private _parentView;
        public parentView : View;
        private _autoresizingMask;
        public autoresizingMask : number;
        private _autoresizesSubviews;
        public autoresizesSubviews : boolean;
        public willUpdateFrame(oldFrame: Rect, newFrame: Rect): void;
        public didUpdateFrame(oldFrame: Rect, newFrame: Rect): void;
        public resizeSubviews(oldSize: Size, newSize: Size): void;
        public applyFrame(): void;
        private _isResizing;
        public isResizing : boolean;
        private _isBeingDragged;
        public isBeingDragged : boolean;
        private _allowDragAndDrop;
        public allowDragAndDrop : boolean;
        private _subViews;
        public subViews : View[];
        public addSubview(aView: View): View;
        public removeSubview(aView: View): View;
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
        private _tools;
        private _closeTool;
        private _resizeTool;
        private _minimizeTool;
        public closeTool : WindowTool;
        public minimizeTool : WindowTool;
        public resizeTool : WindowTool;
        public title : string;
        private _titleView;
        public forWindow : Window;
        constructor(aRect: Rect);
        public applyFrame(): void;
        public makeTitleViewRect(): Rect;
    }
    class WindowManager {
        private _front;
        private _container;
        public View: any;
        private _windows;
        public windows : Window[];
        public addWindow(window: Window): void;
        public orderFront(window: Window): void;
        constructor(container: View);
    }
    class ContentView extends View {
        constructor(aRect: Rect);
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
    enum WindowCloseReason {
        UserAction = 0,
    }
    enum WindowMinimizeReason {
        UserAction = 0,
    }
    class Window extends UserDraggableView {
        public title : string;
        private _title;
        private _titleBar;
        private _contentView;
        public contentView : View;
        private _windowManager;
        private _canBecomeKey;
        private _closeTool;
        private _resizeTool;
        private _minimizeTool;
        private unminimizedElement;
        public orderFront(): void;
        public init(): void;
        constructor(aRect?: Rect);
        public close(reason?: WindowCloseReason): void;
        public windowShouldClose(reason: WindowCloseReason): boolean;
        public windowWillClose(): void;
        public windowDidClose(): void;
        public minimize(reason?: WindowMinimizeReason): void;
        public windowShouldMinimize(reason: WindowMinimizeReason): boolean;
        public windowWillMinimize(): void;
        public windowDidMinimize(): void;
        public unminimize(reason?: WindowMinimizeReason): void;
        public windowShouldUnMinimize(reason: WindowMinimizeReason): boolean;
        public windowWillUnMinimize(): void;
        public windowDidUnMinimize(): void;
        public setupWindow(): void;
        public applyFrame(): void;
        public mouseDown(e: MouseEvent): void;
        public mouseUp(e: MouseEvent): void;
        public keyDown(e: KeyboardEvent): void;
        public keyUp(e: KeyboardEvent): void;
    }
    class AboutWindow extends Window {
        constructor();
        public setupWindow(): void;
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
        private aboutWindow;
        public about(): void;
    }
    class ScrollViewContentView extends View {
        private scrollLeft;
        private scrollTop;
        public scrolled(e: Event): void;
        constructor(aRect: Rect);
        public applyFrame(): void;
    }
    /**
    * Provides a view that can scroll
    */
    class ScrollView extends View {
        public scrollsVertically : boolean;
        private _scrollsVertically;
        public scrollsHorizontally : boolean;
        private _scrollsHorizontally;
        private _contentView;
        public contentView : View;
        private _scrollMode;
        public scrollMode : string;
        constructor(aRect: Rect);
        public applyFrame(): void;
    }
    class TextField extends View {
        public text : string;
    }
    class PushButton extends View {
        public action: any;
        private textField;
        public label : string;
        constructor(aRect: Rect);
        public makeLabelFrame(): Rect;
        public applyFrame(): void;
    }
    enum StackViewOrientation {
        Horizontal = 0,
        Vertical = 1,
    }
    class StackView extends View {
        private _margin;
        public margin : number;
        private _orientation;
        public orientation : StackViewOrientation;
        public addSubView(view: View): void;
        public removeSubView(view: View): void;
        public applyStacking(): void;
        public applyFrame(): void;
    }
    var application: any;
}
