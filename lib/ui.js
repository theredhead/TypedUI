var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* © Kris Herlaar <kris@theredhead.nl>
*/
var red;
(function (red) {
    function typeId(anObject) {
        var matches = /function (.{1,})\(/.exec(anObject['constructor'].toString());
        return (matches && matches.length > 1) ? matches[1] : '';
    }
    red.typeId = typeId;

    var Notification = (function () {
        function Notification(sender) {
            this._sender = sender;
        }
        Object.defineProperty(Notification.prototype, "notificationKind", {
            get: function () {
                return typeId(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Notification.prototype, "sender", {
            get: function () {
                return this._sender;
            },
            enumerable: true,
            configurable: true
        });
        return Notification;
    })();
    red.Notification = Notification;
    var PropertyChangeNotification = (function (_super) {
        __extends(PropertyChangeNotification, _super);
        function PropertyChangeNotification(propertyName, sender) {
            _super.call(this, sender);
            this._propertyName = propertyName;
        }
        Object.defineProperty(PropertyChangeNotification.prototype, "propertyName", {
            get: function () {
                return this._propertyName;
            },
            enumerable: true,
            configurable: true
        });
        return PropertyChangeNotification;
    })(Notification);
    red.PropertyChangeNotification = PropertyChangeNotification;
    var PropertyWillChangeNotification = (function (_super) {
        __extends(PropertyWillChangeNotification, _super);
        function PropertyWillChangeNotification() {
            _super.apply(this, arguments);
        }
        return PropertyWillChangeNotification;
    })(PropertyChangeNotification);
    red.PropertyWillChangeNotification = PropertyWillChangeNotification;
    var PropertyDidChangeNotification = (function (_super) {
        __extends(PropertyDidChangeNotification, _super);
        function PropertyDidChangeNotification() {
            _super.apply(this, arguments);
        }
        return PropertyDidChangeNotification;
    })(PropertyChangeNotification);
    red.PropertyDidChangeNotification = PropertyDidChangeNotification;

    var NotificationRequest = (function () {
        function NotificationRequest(aNotificationKind, aTarget, anAction) {
            this._notificationKind = aNotificationKind;
            this._target = aTarget;
            this._action = anAction;
        }
        Object.defineProperty(NotificationRequest.prototype, "notificationKind", {
            get: function () {
                return this._notificationKind;
            },
            enumerable: true,
            configurable: true
        });

        NotificationRequest.prototype.act = function (notification) {
            this._target[this._action](notification.sender);
        };
        return NotificationRequest;
    })();
    red.NotificationRequest = NotificationRequest;

    var Observable = (function () {
        function Observable() {
            this._observers = [];
        }
        Observable.prototype.registerObserver = function (notificationKind, target, action) {
            this._observers.push(new NotificationRequest(notificationKind, target, action));
        };

        Observable.prototype.notifyPropertyWillChange = function (propertyName) {
            this.notifyListeners(new PropertyWillChangeNotification(propertyName, this));
        };

        Observable.prototype.notifyPropertyDidChange = function (propertyName) {
            this.notifyListeners(new PropertyDidChangeNotification(propertyName, this));
        };

        Observable.prototype.notifyListeners = function (notification) {
            if (this._observers && this._observers.length) {
                for (var ix = 0; ix < this._observers.length; ix++) {
                    if (typeId(this._observers[ix]) === notification.notificationKind) {
                        this._observers[ix].act(notification);
                    }
                }
            }
        };
        return Observable;
    })();
    red.Observable = Observable;

    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.toString = function () {
            return 'Point(' + this.x + ', ' + this.y + ')';
        };
        return Point;
    })();
    red.Point = Point;
    var Size = (function () {
        function Size(width, height) {
            this.height = height;
            this.width = width;
        }
        Size.prototype.toString = function () {
            return 'Size(' + this.width + ', ' + this.height + ')';
        };
        return Size;
    })();
    red.Size = Size;
    var Rect = (function () {
        function Rect(origin, size) {
            this.origin = origin;
            this.size = size;
        }
        Rect.prototype.shrink = function (pixels) {
            return RectMake(this.origin.x + pixels, this.origin.y + pixels, this.size.width - 2 * pixels, this.size.height - 2 * pixels);
        };

        Rect.prototype.copy = function () {
            return RectMake(this.origin.x, this.origin.y, this.size.width, this.size.height);
        };
        Rect.prototype.toClipString = function () {
            return 'rect(0px,' + (this.size.width).toFixed(0) + 'px,' + (this.size.height).toFixed(0) + 'px,0px)';
        };

        Rect.prototype.adjustRectsToFitHorizontally = function (rects, margin) {
            if (typeof margin === "undefined") { margin = 0; }
            var availableWidth = this.size.width, singleRectWidth = (availableWidth - ((1 + rects.length) * margin)) / rects.length, singleRectHeight = this.size.height - (2 * margin);

            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.y = margin;
                rects[ix].origin.x = ((ix + 1) * margin) + (ix * singleRectWidth);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        };
        Rect.prototype.adjustRectsToFitVertically = function (rects, margin) {
            if (typeof margin === "undefined") { margin = 0; }
            var availableHeight = this.size.height, singleRectHeight = (availableHeight - ((1 + rects.length) * margin)) / rects.length, singleRectWidth = this.size.width - (2 * margin);

            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.x = margin;
                rects[ix].origin.y = ((ix + 1) * margin) + (ix * singleRectHeight);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        };
        return Rect;
    })();
    red.Rect = Rect;
    function PointMake(x, y) {
        return new Point(x, y);
    }
    red.PointMake = PointMake;
    function SizeMake(width, height) {
        return new Size(width, height);
    }
    red.SizeMake = SizeMake;
    function RectMake(x, y, width, height) {
        return new Rect(PointMake(x, y), SizeMake(width, height));
    }
    red.RectMake = RectMake;
    function RectMakeZero() {
        return RectMake(0, 0, 0, 0);
    }
    red.RectMakeZero = RectMakeZero;

    var UIElement = (function () {
        function UIElement(frame) {
            this._visible = true;
            this._clipsContent = true;
            this._tagName = 'div';
            this._cssClasses = [];
            this.addCssClass('ui');
            this.addCssClass(typeId(this));
            this._frame = frame;
            this._element = document.createElement(this.tagName);
        }
        Object.defineProperty(UIElement.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (v) {
                if (this._visible != v) {
                    this._visible = v;
                    this.element.style.visibility = this._visible ? 'visible' : 'hidden';
                }
            },
            enumerable: true,
            configurable: true
        });

        UIElement.prototype.setCursor = function (crsr) {
            this._cursor = crsr;
            this.applyFrame();
        };

        UIElement.prototype.setColor = function (color) {
            this._color = color;
            this.applyFrame();
        };

        UIElement.prototype.setBackgroundColor = function (color) {
            this._backgroundColor = color;
            this.applyFrame();
        };

        UIElement.prototype.setBackgroundImage = function (anImageUrl) {
            this._backgroundImage = anImageUrl;
            this.applyFrame();
        };

        Object.defineProperty(UIElement.prototype, "clipsContent", {
            get: function () {
                return this._clipsContent;
            },
            set: function (v) {
                this._clipsContent = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UIElement.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (v) {
                if (this._frame != v) {
                    var oldFrame = this._frame;
                    this.willUpdateFrame(oldFrame, v);
                    this._frame = v;
                    this.didUpdateFrame(oldFrame, v);
                    this.applyFrame();
                }
            },
            enumerable: true,
            configurable: true
        });

        UIElement.prototype.willUpdateFrame = function (oldFrame, newFrame) {
        };
        UIElement.prototype.didUpdateFrame = function (oldFrame, newFrame) {
        };

        Object.defineProperty(UIElement.prototype, "tag", {
            get: function () {
                return this._tag;
            },
            set: function (v) {
                this._tag = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UIElement.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UIElement.prototype, "tagName", {
            get: function () {
                return this._tagName;
            },
            enumerable: true,
            configurable: true
        });

        UIElement.prototype.applyFrame = function () {
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
        };

        Object.defineProperty(UIElement.prototype, "cssCasses", {
            get: function () {
                return this._cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        UIElement.prototype.hasCssClass = function (aClass) {
            return this._cssClasses.indexOf(aClass) > -1;
        };
        UIElement.prototype.addCssClass = function (aClass) {
            if (!this.hasCssClass(aClass)) {
                this._cssClasses.push(aClass);
            }
        };
        UIElement.prototype.removeCssClass = function (aClass) {
            if (!this.hasCssClass(aClass)) {
                this._cssClasses.splice(this._cssClasses.indexOf(aClass));
            }
        };
        UIElement.prototype.toggleCssClass = function (aClass) {
            if (!this.hasCssClass(aClass)) {
                this.removeCssClass(aClass);
            } else {
                this.addCssClass(aClass);
            }
        };
        return UIElement;
    })();
    red.UIElement = UIElement;

    var Color = (function () {
        function Color(r, g, b, alpha) {
            if (typeof alpha === "undefined") { alpha = 1.0; }
            this._r = this.adjustToByte(r);
            this._g = this.adjustToByte(g);
            this._b = this.adjustToByte(b);
            this._alpha = this.adjustAlpha(alpha);
        }
        Color.prototype.adjustToByte = function (i) {
            var o = Math.ceil(i);

            if (o < 0) {
                return 0;
            } else if (o > 255) {
                return 255;
            } else
                return o;
        };

        Color.prototype.adjustAlpha = function (i) {
            if (i < 0) {
                return 0;
            } else if (i > 1) {
                return 1;
            } else
                return i;
        };

        Color.prototype.toString = function () {
            var result = 'rgba(' + [
                this._r.toFixed(0),
                this._g.toFixed(0),
                this._b.toFixed(0),
                this._alpha
            ].join(', ') + ')';
            return result;
        };
        return Color;
    })();
    red.Color = Color;

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

    var Autoresize;
    (function (Autoresize) {
        Autoresize[Autoresize["LockedTop"] = 1] = "LockedTop";
        Autoresize[Autoresize["LockedLeft"] = 2] = "LockedLeft";
        Autoresize[Autoresize["LockedBottom"] = 4] = "LockedBottom";
        Autoresize[Autoresize["LockedRight"] = 8] = "LockedRight";
        Autoresize[Autoresize["WidthSizable"] = 16] = "WidthSizable";
        Autoresize[Autoresize["HeightSizable"] = 32] = "HeightSizable";
    })(Autoresize || (Autoresize = {}));
    var viewId = 0;
    var View = (function (_super) {
        __extends(View, _super);
        function View(frame) {
            _super.call(this, frame);
            this._subViews = [];
            this._identifier = typeId(this) + (viewId++).toString();
            this._isBeingDragged = false;
            this._isResizing = false;

            var me = this;
            this.element.addEventListener('mousedown', function (e) {
                me.mouseDown(e);
            });
            this.element.addEventListener('mouseup', function (e) {
                me.mouseUp(e);
            });
        }
        Object.defineProperty(View.prototype, "identifier", {
            get: function () {
                return this._identifier;
            },
            enumerable: true,
            configurable: true
        });

        View.prototype.toString = function () {
            return this.identifier;
        };

        Object.defineProperty(View.prototype, "parentView", {
            get: function () {
                return this._parentView;
            },
            set: function (aView) {
                this._parentView = aView;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(View.prototype, "autoresizingMask", {
            get: function () {
                return this._autoresizingMask;
            },
            set: function (v) {
                if (this._autoresizingMask = v) {
                    this._autoresizingMask = v;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(View.prototype, "autoresizesChildViews", {
            get: function () {
                return this._autoresizesChildViews;
            },
            set: function (v) {
                this._autoresizesChildViews = v;
            },
            enumerable: true,
            configurable: true
        });

        View.prototype.resizeSubviewsWithOldSize = function (size) {
            //console.log(
            //    'resized ' + this.toString() +
            //    ' from size: ' + this.frame.size.toString() +
            //    ' to size: ' + size.toString()
            //);
        };

        View.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            for (var ix = 0; ix < this._subViews.length; ix++) {
                this._subViews[ix].applyFrame();
            }
        };

        Object.defineProperty(View.prototype, "isResizing", {
            get: function () {
                return this._isResizing;
            },
            set: function (v) {
                this._isResizing = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(View.prototype, "isBeingDragged", {
            get: function () {
                return this._isBeingDragged;
            },
            set: function (v) {
                this._isBeingDragged = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(View.prototype, "allowDragAndDrop", {
            get: function () {
                return this._allowDragAndDrop;
            },
            set: function (v) {
                this._allowDragAndDrop = v;
            },
            enumerable: true,
            configurable: true
        });

        View.prototype.addSubView = function (aView) {
            this._subViews.push(aView);
            aView._parentView = this;
            this.element.appendChild(aView.element);
            aView.draw();
            return aView;
        };
        View.prototype.removeSubView = function (aView) {
            this._subViews.splice(this._subViews.indexOf(aView));
            this.element.removeChild(aView.element);
            return aView;
        };

        View.prototype.center = function (inRect) {
            if (typeof inRect === "undefined") { inRect = null; }
            var parentFrame = inRect || this._parentView.frame, myFrame = this.frame, offsetX = parentFrame.size.width / 2 - myFrame.size.width / 2, offsetY = parentFrame.size.height / 2 - myFrame.size.height / 2;
            this.frame.origin = PointMake(offsetX, offsetY);
            this.applyFrame();
        };

        View.prototype.mouseDown = function (e) {
        };
        View.prototype.mouseUp = function (e) {
        };

        View.prototype.draw = function () {
            this.applyFrame();
        };
        return View;
    })(UIElement);
    red.View = View;

    var Desktop = (function (_super) {
        __extends(Desktop, _super);
        function Desktop() {
            _super.call(this, RectMake(0, 0, window.innerWidth, window.innerHeight));
            this.addCssClass(typeId(this));
            document.getElementsByTagName('body').item(0).appendChild(this.element);
        }
        return Desktop;
    })(View);
    red.Desktop = Desktop;

    var ViewDragManager = (function () {
        function ViewDragManager(e, view) {
            var _this = this;
            this.view = view;
            this.view.isBeingDragged = true;
            this.offsetX = e.x - view.frame.origin.x;
            this.offsetY = e.y - view.frame.origin.y;

            this.mouseMoveHandler = function (e) {
                _this.handleMouseMove(e);
            };
            this.mouseUpHandler = function (e) {
                _this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
        }
        ViewDragManager.prototype.handleMouseMove = function (e) {
            this.view.frame.origin = PointMake(e.x - this.offsetX, e.y - this.offsetY);
            this.view.applyFrame();
        };
        ViewDragManager.prototype.handleMouseRelease = function (e) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isBeingDragged = false;
        };
        return ViewDragManager;
    })();
    red.ViewDragManager = ViewDragManager;

    var Resize;
    (function (Resize) {
        Resize[Resize["North"] = 1] = "North";
        Resize[Resize["East"] = 2] = "East";
        Resize[Resize["South"] = 4] = "South";
        Resize[Resize["West"] = 8] = "West";
    })(Resize || (Resize = {}));

    var ViewResizeManager = (function () {
        function ViewResizeManager(e, view, directionMask) {
            var _this = this;
            this.busy = true;
            this.initialMouseEvent = e;
            this.view = view;
            this.view.isResizing = true;
            this.originalFrame = this.view.frame;
            this.resizeDirectionMask = directionMask;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;

            this.mouseMoveHandler = function (e) {
                _this.handleMouseMove(e);
            };
            this.mouseUpHandler = function (e) {
                _this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
            this.busy = false;
        }
        ViewResizeManager.prototype.constrain = function (val, min, max) {
            if (val < min || val)
                return min;
            if (val > max || val)
                return max;
            return val;
        };

        ViewResizeManager.prototype.handleMouseMove = function (e) {
            if (this.busy)
                return;
            this.busy = true;
            e.preventDefault();
            var dir = this.resizeDirectionMask, frame = this.originalFrame.copy(), diffX = Math.round(this.initialMouseEvent.x - e.x), diffY = Math.round(this.initialMouseEvent.y - e.y);

            if ((dir & 2 /* East */) == 2 /* East */) {
                frame.size.width = Math.round(this.originalFrame.size.width - diffX);
            }
            if ((dir & 8 /* West */) == 8 /* West */) {
                frame.origin.x = Math.round(this.originalFrame.origin.x - diffX);
                frame.size.width = Math.round(this.originalFrame.size.width + diffX);
            }
            if ((dir & 4 /* South */) == 4 /* South */) {
                frame.size.height = Math.round(this.originalFrame.size.height - diffY);
            }
            if ((dir & 1 /* North */) == 1 /* North */) {
                frame.origin.y = Math.round(this.originalFrame.origin.y - diffY);
                frame.size.height = Math.round(this.originalFrame.size.height + diffY);
            }

            this.view.frame = frame;
            this.view.applyFrame();
            this.busy = false;
        };

        ViewResizeManager.prototype.handleMouseRelease = function (e) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isResizing = false;
            this.view.isBeingDragged = false;
            this.view.applyFrame();
        };
        return ViewResizeManager;
    })();
    red.ViewResizeManager = ViewResizeManager;

    var TitleBar = (function (_super) {
        __extends(TitleBar, _super);
        function TitleBar() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(TitleBar.prototype, "forWindow", {
            get: function () {
                return this.parentView;
            },
            enumerable: true,
            configurable: true
        });
        return TitleBar;
    })(View);
    red.TitleBar = TitleBar;

    var WindowManager = (function () {
        function WindowManager() {
            this._windows = [];
        }
        Object.defineProperty(WindowManager.prototype, "windows", {
            get: function () {
                return this._windows;
            },
            enumerable: true,
            configurable: true
        });

        WindowManager.prototype.addWindow = function (window) {
            this._windows.push(window);
        };

        WindowManager.prototype.orderFront = function (window) {
            var oldFront, newFront;

            if (window === this._front)
                return;

            for (var ix = 0; ix < this._windows.length; ix++) {
                if (this._windows[ix] === window) {
                    newFront = this._windows[ix];
                    continue;
                } else if (this._windows[ix] === this._front) {
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
        };
        return WindowManager;
    })();
    red.WindowManager = WindowManager;

    var ContentView = (function (_super) {
        __extends(ContentView, _super);
        function ContentView() {
            _super.apply(this, arguments);
        }
        return ContentView;
    })(View);
    red.ContentView = ContentView;

    (function (WindowToolType) {
        WindowToolType[WindowToolType["Close"] = 0] = "Close";
        WindowToolType[WindowToolType["Minimize"] = 1] = "Minimize";
        WindowToolType[WindowToolType["Resize"] = 2] = "Resize";
    })(red.WindowToolType || (red.WindowToolType = {}));
    var WindowToolType = red.WindowToolType;
    var WindowTool = (function (_super) {
        __extends(WindowTool, _super);
        function WindowTool(rect, type) {
            _super.call(this, rect);
            this.addCssClass(WindowToolType[type]);
            this.clipsContent = false;
        }
        return WindowTool;
    })(View);
    red.WindowTool = WindowTool;

    var WindowSizeHandle = (function (_super) {
        __extends(WindowSizeHandle, _super);
        function WindowSizeHandle(rect) {
            _super.call(this, rect);
            // this.setBackgroundColor(colors.red);
        }
        return WindowSizeHandle;
    })(View);
    red.WindowSizeHandle = WindowSizeHandle;

    var UserResizableView = (function (_super) {
        __extends(UserResizableView, _super);
        function UserResizableView(aRect) {
            _super.call(this, aRect);
            this._resizeBorderThickness = 4;
            var thickness = this._resizeBorderThickness;
            this._sizeHandleTopLeft = this.addSubView(new WindowSizeHandle(RectMake(0, 0, thickness, thickness)));
            this._sizeHandleTopLeft.setCursor('nw-resize');

            this._sizeHandleTopRight = this.addSubView(new WindowSizeHandle(RectMake(aRect.size.width - thickness, 0, thickness, thickness)));
            this._sizeHandleTopRight.setCursor('ne-resize');

            this._sizeHandleBottomLeft = this.addSubView(new WindowSizeHandle(RectMake(0, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomLeft.setCursor('sw-resize');

            this._sizeHandleBottomRight = this.addSubView(new WindowSizeHandle(RectMake(aRect.size.width - thickness, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomRight.setCursor('se-resize');

            this._sizeHandleHorizontallyLeft = this.addSubView(new WindowSizeHandle(RectMake(0, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyLeft.setCursor('w-resize');

            this._sizeHandleHorizontallyRight = this.addSubView(new WindowSizeHandle(RectMake(aRect.size.width - thickness, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyRight.setCursor('e-resize');

            this._sizeHandleVerticallyTop = this.addSubView(new WindowSizeHandle(RectMake(thickness, 0, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyTop.setCursor('n-resize');

            this._sizeHandleVerticallyallyBottom = this.addSubView(new WindowSizeHandle(RectMake(thickness, aRect.size.height - thickness, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyallyBottom.setCursor('s-resize');

            // this.applyFrame();
            var theView = this;
            this._sizeHandleHorizontallyRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 2 /* East */);
                }
            };
            this._sizeHandleHorizontallyLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 8 /* West */);
                }
            };
            this._sizeHandleVerticallyTop.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, 1 /* North */);
                }
            };
            this._sizeHandleVerticallyallyBottom.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, 4 /* South */);
                }
            };

            this._sizeHandleTopLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 1 /* North */ | 8 /* West */);
                }
            };

            this._sizeHandleTopRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 1 /* North */ | 2 /* East */);
                }
            };

            this._sizeHandleBottomLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 4 /* South */ | 8 /* West */);
                }
            };

            this._sizeHandleBottomRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, 4 /* South */ | 2 /* East */);
                }
            };

            this.isHorizontallySizable = true;
            this.isVertictallySizable = true;
        }
        Object.defineProperty(UserResizableView.prototype, "minimumSize", {
            get: function () {
                return this._minimumSize;
            },
            set: function (v) {
                this._minimumSize = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UserResizableView.prototype, "maximumSize", {
            get: function () {
                return this._maximumSize;
            },
            set: function (v) {
                this._maximumSize = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UserResizableView.prototype, "isHorizontallySizable", {
            get: function () {
                return this._isHorizontallySizable;
            },
            set: function (v) {
                this._isHorizontallySizable = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UserResizableView.prototype, "isVertictallySizable", {
            get: function () {
                return this._isVertictallySizable;
            },
            set: function (v) {
                this._isVertictallySizable = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UserResizableView.prototype, "resizeBorderThickness", {
            get: function () {
                return Math.round(this._resizeBorderThickness);
            },
            set: function (v) {
                this._resizeBorderThickness = v;
            },
            enumerable: true,
            configurable: true
        });

        UserResizableView.prototype.willUpdateFrame = function (oldFrame, newFrame) {
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

            this.resizeSubviewsWithOldSize(oldFrame.size);
        };

        UserResizableView.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            var thickness = this.resizeBorderThickness;
            this._sizeHandleTopLeft.frame = RectMake(0, 0, thickness, thickness);
            this._sizeHandleTopRight.frame = RectMake(this.frame.size.width - thickness, 0, thickness, thickness);
            this._sizeHandleBottomLeft.frame = RectMake(0, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleBottomRight.frame = RectMake(this.frame.size.width - thickness, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleHorizontallyLeft.frame = RectMake(0, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleHorizontallyRight.frame = RectMake(this.frame.size.width - thickness, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleVerticallyTop.frame = RectMake(thickness, 0, this.frame.size.width - (2 * thickness), thickness);
            this._sizeHandleVerticallyallyBottom.frame = RectMake(thickness, this.frame.size.height - thickness, this.frame.size.width - (2 * thickness), thickness);
        };
        return UserResizableView;
    })(View);
    red.UserResizableView = UserResizableView;

    var UserDraggableView = (function (_super) {
        __extends(UserDraggableView, _super);
        function UserDraggableView(aRect) {
            _super.call(this, aRect);
        }
        Object.defineProperty(UserDraggableView.prototype, "isDraggable", {
            get: function () {
                return this._isDraggable && this._dragHandleView != null;
            },
            set: function (v) {
                this._isDraggable = v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(UserDraggableView.prototype, "dragHandleView", {
            get: function () {
                return this._dragHandleView || this;
            },
            set: function (v) {
                var _this = this;
                if (v != this._dragHandleView) {
                    this._dragHandleView = v;

                    if (this.isDraggable)
                        this.dragHandleView.mouseDown = function (e) {
                            new ViewDragManager(e, _this);
                        };
                    else
                        this.dragHandleView.mouseDown = function (e) {
                        };
                }
            },
            enumerable: true,
            configurable: true
        });
        return UserDraggableView;
    })(UserResizableView);
    red.UserDraggableView = UserDraggableView;

    var Window = (function (_super) {
        __extends(Window, _super);
        function Window(aRect) {
            if (typeof aRect === "undefined") { aRect = null; }
            _super.call(this, aRect = aRect || RectMake(0, 0, 329, 200));
            this.clipsContent = false;
            this._canBecomeKey = true;
            this._windowManager = red.application.windowManager;
            this._windowManager.windows.push(this);

            this._titleBar = new TitleBar(RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26));
            this.isDraggable = true;
            this.dragHandleView = this._titleBar;

            this.addSubView(this._titleBar);
            var m = this.resizeBorderThickness;
            this._contentView = this.addSubView(new ContentView(RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m)));

            this.allowDragAndDrop = true;
            this.applyFrame();

            this._tools = this._titleBar.addSubView(new View(RectMake(2, 2, 80, 20)));
            this._tools.addCssClass('WindowTools');

            var y = 4, s = 12, o = 8;
            this._resizeTool = this._tools.addSubView(new WindowTool(RectMake(o, y, s, s), 2 /* Resize */));
            this._minimizeTool = this._tools.addSubView(new WindowTool(RectMake(o + (2 * s), y, s, s), 1 /* Minimize */));
            this._closeTool = this._tools.addSubView(new WindowTool(RectMake(o + (4 * s), y, s, s), 0 /* Close */));
        }
        Window.prototype.orderFront = function () {
            this._windowManager.orderFront(this);
        };

        Window.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            this._titleBar.frame = RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26);
            var m = this.resizeBorderThickness;
            this._contentView.frame = RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m);
        };
        Window.prototype.mouseDown = function (e) {
            this.orderFront();
        };
        Window.prototype.mouseUp = function (e) {
        };
        return Window;
    })(UserDraggableView);
    red.Window = Window;

    var Application = (function () {
        function Application(delegate) {
            if (typeof delegate === "undefined") { delegate = null; }
            this._delegate = delegate;
            this._windowManager = new WindowManager();
        }
        Object.defineProperty(Application.prototype, "windowManager", {
            get: function () {
                return this._windowManager;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Application.prototype, "delegate", {
            set: function (delegate) {
                this._delegate = delegate;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Application.prototype, "desktop", {
            get: function () {
                return this._desktop;
            },
            enumerable: true,
            configurable: true
        });

        Application.prototype.initialize = function () {
            this._desktop = new Desktop();
        };
        Application.prototype.run = function () {
            this.initialize();
            if (this._delegate && this._delegate['applicationDidFinishLaunching']) {
                this._delegate.applicationDidFinishLaunching(this);
            }
        };
        return Application;
    })();
    red.Application = Application;

    red.application = new Application();
})(red || (red = {}));
//# sourceMappingURL=ui.js.map
