var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * © Kris Herlaar <kris@theredhead.nl>
 */
var red;
(function (red) {
    red.settings = {
        debug: true,
        displayRectInfo: false
    };
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
    }());
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
    }(Notification));
    red.PropertyChangeNotification = PropertyChangeNotification;
    var PropertyWillChangeNotification = (function (_super) {
        __extends(PropertyWillChangeNotification, _super);
        function PropertyWillChangeNotification() {
            _super.apply(this, arguments);
        }
        return PropertyWillChangeNotification;
    }(PropertyChangeNotification));
    red.PropertyWillChangeNotification = PropertyWillChangeNotification;
    var PropertyDidChangeNotification = (function (_super) {
        __extends(PropertyDidChangeNotification, _super);
        function PropertyDidChangeNotification() {
            _super.apply(this, arguments);
        }
        return PropertyDidChangeNotification;
    }(PropertyChangeNotification));
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
    }());
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
    }());
    red.Observable = Observable;
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.prep = function (n) {
            return n;
        };
        Object.defineProperty(Point.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (v) {
                this._x = this.prep(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (v) {
                this._y = this.prep(v);
            },
            enumerable: true,
            configurable: true
        });
        Point.prototype.toString = function () {
            return 'Point(' + this.x + ', ' + this.y + ')';
        };
        Point.prototype.distanceTo = function (other) {
            return new Point((this.x - other.x), (this.y - other.y));
        };
        return Point;
    }());
    red.Point = Point;
    var Size = (function () {
        function Size(width, height) {
            this.height = height;
            this.width = width;
        }
        Size.prototype.prep = function (n) {
            return n;
        };
        Object.defineProperty(Size.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (v) {
                this._width = this.prep(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Size.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (v) {
                this._height = this.prep(v);
            },
            enumerable: true,
            configurable: true
        });
        Size.prototype.toString = function () {
            return 'Size(' + this.width + ', ' + this.height + ')';
        };
        return Size;
    }());
    red.Size = Size;
    var Rect = (function () {
        function Rect(origin, size) {
            this.origin = origin;
            this.size = size;
        }
        Object.defineProperty(Rect.prototype, "center", {
            get: function () {
                return new Point(this.origin.x + (this.size.width / 2), this.origin.y + (this.size.height / 2));
            },
            enumerable: true,
            configurable: true
        });
        Rect.prototype.centeredInRect = function (r) {
        };
        Rect.prototype.shrink = function (pixels) {
            return RectMake(this.origin.x + pixels, this.origin.y + pixels, this.size.width - 2 * pixels, this.size.height - 2 * pixels);
        };
        Rect.prototype.copy = function () {
            return RectMake(this.origin.x, this.origin.y, this.size.width, this.size.height);
        };
        Rect.prototype.sizeOnlyCopy = function () {
            return RectMake(0, 0, this.size.width, this.size.height);
        };
        Rect.prototype.toString = function () {
            return [this.origin.x, this.origin.y, this.size.width, this.size.height].join(', ');
        };
        Rect.prototype.isEquivalentTToRect = function (otherRect) {
            return this.toString() == otherRect.toString();
        };
        Rect.prototype.intersects = function (other) {
            var delta = this.center.distanceTo(other.center), dx = Math.abs(delta.x), dy = Math.abs(delta.y);
            return dx < ((this.size.width / 2) || dx < (other.size.width / 2))
                && dy < ((this.size.height / 2) || dy < (other.size.height / 2));
        };
        Rect.prototype.toClipString = function () {
            return 'rect(0px,' + (this.size.width).toFixed(0) + 'px,' + (this.size.height).toFixed(0) + 'px,0px)';
        };
        Rect.prototype.adjustRectsToFitHorizontally = function (rects, margin) {
            if (margin === void 0) { margin = 0; }
            var availableWidth = this.size.width, singleRectWidth = (availableWidth - ((1 + rects.length) * margin)) / rects.length, singleRectHeight = this.size.height - (2 * margin);
            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.y = margin;
                rects[ix].origin.x = ((ix + 1) * margin) + (ix * singleRectWidth);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        };
        Rect.prototype.adjustRectsToFitVertically = function (rects, margin) {
            if (margin === void 0) { margin = 0; }
            var availableHeight = this.size.height, singleRectHeight = (availableHeight - ((1 + rects.length) * margin)) / rects.length, singleRectWidth = this.size.width - (2 * margin);
            for (var ix = 0; ix < rects.length; ix++) {
                rects[ix].origin.x = margin;
                rects[ix].origin.y = ((ix + 1) * margin) + (ix * singleRectHeight);
                rects[ix].size.width = singleRectWidth;
                rects[ix].size.height = singleRectHeight;
            }
        };
        Object.defineProperty(Rect.prototype, "isNegativeRect", {
            get: function () {
                return this.width < 0 || this.height < 0;
            },
            enumerable: true,
            configurable: true
        });
        return Rect;
    }());
    red.Rect = Rect;
    function DetermineTextSize(text, font) {
        var canvas = DetermineTextSize.canvas || (DetermineTextSize.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return SizeMake(metrics.width, metrics.height);
    }
    red.DetermineTextSize = DetermineTextSize;
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
    function RectInset(r, p) {
        return new Rect(PointMake(r.origin.x + p, r.origin.y + p), SizeMake(r.size.width - (2 * p), r.size.height - (2 * p)));
    }
    red.RectInset = RectInset;
    function RectOutset(r, p) {
        return new Rect(PointMake(r.origin.x - p, r.origin.y - p), SizeMake(r.size.width + (2 * p), r.size.height + (2 * p)));
    }
    red.RectOutset = RectOutset;
    function RectMakeZero(s) {
        if (s === void 0) { s = null; }
        if (s == null)
            return RectMake(0, 0, 0, 0);
        else
            return new Rect(new Point(0, 0), s);
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
            //this.applyFrame();
        }
        Object.defineProperty(UIElement.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (v) {
                if (this._visible != v) {
                    this._visible = v;
                    this.element.style.visibility = this._visible
                        ? 'visible'
                        : 'hidden';
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
                if (!this._frame.isEquivalentTToRect(v)) {
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
            if (this._cursor)
                this.element.style.cursor = this._cursor;
            if (this._backgroundColor)
                this.element.style.backgroundColor = this._backgroundColor.toString();
            if (this._backgroundImage)
                this.element.style.background = 'url(' + this._backgroundImage + ')';
            if (red.settings.debug && red.settings.displayRectInfo)
                this.element.title = this.frame.toString();
            if (this.clipsContent)
                this._element.style.clip = this.frame.toClipString();
            else
                this._element.style.clip = null;
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
                console.log('before removeClass:', this.cssCasses);
                this._cssClasses.splice(this._cssClasses.indexOf(aClass));
                console.log('after removeClass:', this.cssCasses);
            }
        };
        UIElement.prototype.toggleCssClass = function (aClass) {
            if (!this.hasCssClass(aClass)) {
                this.removeCssClass(aClass);
            }
            else {
                this.addCssClass(aClass);
            }
        };
        return UIElement;
    }());
    red.UIElement = UIElement;
    var Color = (function () {
        function Color(r, g, b, alpha) {
            if (alpha === void 0) { alpha = 1.0; }
            this._r = this.adjustToByte(r);
            this._g = this.adjustToByte(g);
            this._b = this.adjustToByte(b);
            this._alpha = this.adjustAlpha(alpha);
        }
        Color.prototype.adjustToByte = function (i) {
            var o = Math.ceil(i);
            if (o < 0) {
                return 0;
            }
            else if (o > 255) {
                return 255;
            }
            else
                return o;
        };
        Color.prototype.adjustAlpha = function (i) {
            if (i < 0) {
                return 0;
            }
            else if (i > 1) {
                return 1;
            }
            else
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
    }());
    red.Color = Color;
    red.colors = {
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
    function resizeProportionally(r, oldSize, newSize) {
        var fn = function (lengthA, lengthB, distanceA) {
            return (distanceA * lengthB) / lengthA;
        };
        var x = fn(oldSize.width, newSize.width, r.origin.x), y = fn(oldSize.height, newSize.height, r.origin.y), w = fn(oldSize.width, newSize.width, r.size.width), h = fn(oldSize.height, newSize.height, r.size.height);
        return RectMake(x, y, w, h);
    }
    (function (AutoresizingMask) {
        AutoresizingMask[AutoresizingMask["LockedTop"] = 1] = "LockedTop";
        AutoresizingMask[AutoresizingMask["LockedLeft"] = 2] = "LockedLeft";
        AutoresizingMask[AutoresizingMask["LockedBottom"] = 4] = "LockedBottom";
        AutoresizingMask[AutoresizingMask["LockedRight"] = 8] = "LockedRight";
        AutoresizingMask[AutoresizingMask["WidthSizable"] = 16] = "WidthSizable";
        AutoresizingMask[AutoresizingMask["HeightSizable"] = 32] = "HeightSizable";
    })(red.AutoresizingMask || (red.AutoresizingMask = {}));
    var AutoresizingMask = red.AutoresizingMask;
    red.ResizeWithParent = AutoresizingMask.HeightSizable | AutoresizingMask.WidthSizable | AutoresizingMask.LockedLeft | AutoresizingMask.LockedRight | AutoresizingMask.LockedTop | AutoresizingMask.LockedBottom;
    var viewId = 0;
    var View = (function (_super) {
        __extends(View, _super);
        function View(frame) {
            _super.call(this, frame);
            this._autoresizingMask = AutoresizingMask.LockedTop | AutoresizingMask.LockedLeft;
            this._autoresizesSubviews = true;
            this._subViews = [];
            var typeName = typeId(this);
            this._identifier = '_' + (viewId++).toString();
            this.addCssClass(typeName);
            this.element.setAttribute('id', this._identifier);
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
        Object.defineProperty(View.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (v) {
                if (!this._frame.isEquivalentTToRect(v) && !v.isNegativeRect) {
                    var oldFrame = this._frame;
                    this.willUpdateFrame(oldFrame, v);
                    this._frame = v;
                    this.applyFrame();
                    this.didUpdateFrame(oldFrame, v);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "minimumWidth", {
            get: function () {
                if (this.minimumSize) {
                    return this.minimumSize.width;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "minimumHeight", {
            get: function () {
                if (this.minimumSize) {
                    return this.minimumSize.height;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "maximumWidth", {
            get: function () {
                if (this.maximumSize) {
                    return this.maximumSize.width;
                }
                return window.innerWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "maximumHeight", {
            get: function () {
                if (this.maximumSize) {
                    return this.maximumSize.height;
                }
                return window.innerHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "minimumSize", {
            get: function () {
                return this._minimumSize;
            },
            set: function (v) {
                this._minimumSize = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "maximumSize", {
            get: function () {
                return this._maximumSize;
            },
            set: function (v) {
                this._maximumSize = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "identifier", {
            get: function () {
                return this._identifier;
            },
            set: function (v) {
                this._identifier = v;
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
        Object.defineProperty(View.prototype, "autoresizesSubviews", {
            get: function () {
                return this._autoresizesSubviews;
            },
            set: function (v) {
                this._autoresizesSubviews = v;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.willUpdateFrame = function (oldFrame, newFrame) {
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
        };
        View.prototype.didUpdateFrame = function (oldFrame, newFrame) {
            // console.log(this.identifier + ' updated frame from ' + oldFrame + ' to ' + newFrame);
        };
        View.prototype.resizeSubviews = function (oldSize, newSize) {
            if (oldSize != null) {
                if (this.autoresizesSubviews) {
                    var oldRect = RectMake(0, 0, oldSize.width, oldSize.height);
                    for (var ix = 0; ix < this._subViews.length; ix++) {
                        var sub = this._subViews[ix], frame = sub.frame.copy(), rect = resizeProportionally(sub.frame, oldSize, newSize);
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
            }
        };
        View.prototype.applyFrame = function () {
            for (var ix = 0; ix < this._subViews.length; ix++) {
                var view = this._subViews[ix];
                view.applyFrame();
            }
            _super.prototype.applyFrame.call(this);
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
        Object.defineProperty(View.prototype, "subViews", {
            get: function () {
                return this._subViews;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.addSubview = function (aView) {
            this._subViews.push(aView);
            aView._parentView = this;
            this.element.appendChild(aView.element);
            return aView;
        };
        View.prototype.removeSubview = function (aView) {
            this._subViews.splice(this._subViews.indexOf(aView));
            if (this.element.contains(aView.element)) {
                this.element.removeChild(aView.element);
            }
            return aView;
        };
        View.prototype.center = function (inRect) {
            if (inRect === void 0) { inRect = null; }
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
            //this.applyFrame();
        };
        return View;
    }(UIElement));
    red.View = View;
    var Desktop = (function (_super) {
        __extends(Desktop, _super);
        function Desktop() {
            _super.call(this, RectMake(0, 0, window.innerWidth, window.innerHeight));
            this.clipsContent = true;
            this.addCssClass(typeId(this));
            document.getElementsByTagName('body').item(0).appendChild(this.element);
            this.applyFrame();
        }
        return Desktop;
    }(View));
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
            this.view.applyFrame();
        };
        return ViewDragManager;
    }());
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
            if (min && val < min)
                return min;
            if (max && val > max)
                return max;
            return val;
        };
        ViewResizeManager.prototype.handleMouseMove = function (e) {
            if (this.busy)
                return;
            this.busy = true;
            e.preventDefault();
            var dir = this.resizeDirectionMask, frame = this.originalFrame.copy(), diffX = Math.round(this.initialMouseEvent.x - e.x), diffY = Math.round(this.initialMouseEvent.y - e.y);
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
        };
        ViewResizeManager.prototype.handleMouseRelease = function (e) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isResizing = false;
            this.view.isBeingDragged = false;
            this.view.applyFrame();
        };
        return ViewResizeManager;
    }());
    red.ViewResizeManager = ViewResizeManager;
    var TitleView = (function (_super) {
        __extends(TitleView, _super);
        function TitleView() {
            _super.apply(this, arguments);
        }
        return TitleView;
    }(View));
    red.TitleView = TitleView;
    var TitleBar = (function (_super) {
        __extends(TitleBar, _super);
        function TitleBar(aRect) {
            _super.call(this, aRect);
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
        Object.defineProperty(TitleBar.prototype, "closeTool", {
            get: function () {
                return this._closeTool;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TitleBar.prototype, "minimizeTool", {
            get: function () {
                return this._minimizeTool;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TitleBar.prototype, "resizeTool", {
            get: function () {
                return this._resizeTool;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TitleBar.prototype, "title", {
            get: function () {
                return this._titleView.element.innerText;
            },
            set: function (value) {
                this._titleView.element.innerText = value;
                this.applyFrame();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TitleBar.prototype, "forWindow", {
            get: function () {
                return this.parentView;
            },
            enumerable: true,
            configurable: true
        });
        TitleBar.prototype.applyFrame = function () {
            this._titleView.frame = this.makeTitleViewRect();
            this._titleView.applyFrame();
            _super.prototype.applyFrame.call(this);
        };
        TitleBar.prototype.makeTitleViewRect = function () {
            return RectMake(80, 4, this.frame.size.width - 80, 20);
        };
        return TitleBar;
    }(View));
    red.TitleBar = TitleBar;
    var WindowManager = (function () {
        function WindowManager(container) {
            this._windows = [];
            this._container = container;
        }
        Object.defineProperty(WindowManager.prototype, "windows", {
            get: function () {
                return this._windows;
            },
            enumerable: true,
            configurable: true
        });
        WindowManager.prototype.addWindow = function (window) {
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
            }
            else {
                window.element.parentNode.removeChild(window.element);
                this._container.element.appendChild(window.element);
            }
        };
        WindowManager.prototype.orderFront = function (window) {
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
            if (window === this._front)
                return;
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
        };
        return WindowManager;
    }());
    red.WindowManager = WindowManager;
    var ContentView = (function (_super) {
        __extends(ContentView, _super);
        function ContentView(aRect) {
            _super.call(this, aRect);
            this.autoresizesSubviews = true;
            // console.log('Created a ContentView');
        }
        return ContentView;
    }(View));
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
    }(View));
    red.WindowTool = WindowTool;
    var WindowSizeHandle = (function (_super) {
        __extends(WindowSizeHandle, _super);
        function WindowSizeHandle(rect) {
            _super.call(this, rect);
            // this.setBackgroundColor(colors.red);
        }
        return WindowSizeHandle;
    }(View));
    red.WindowSizeHandle = WindowSizeHandle;
    var UserResizableView = (function (_super) {
        __extends(UserResizableView, _super);
        function UserResizableView(aRect) {
            _super.call(this, aRect);
            this._resizeBorderThickness = 4;
            var thickness = this._resizeBorderThickness;
            this._sizeHandleTopLeft = this.addSubview(new WindowSizeHandle(RectMake(0, 0, thickness, thickness)));
            this._sizeHandleTopLeft.setCursor('nw-resize');
            this._sizeHandleTopRight = this.addSubview(new WindowSizeHandle(RectMake(aRect.size.width - thickness, 0, thickness, thickness)));
            this._sizeHandleTopRight.setCursor('ne-resize');
            this._sizeHandleBottomLeft = this.addSubview(new WindowSizeHandle(RectMake(0, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomLeft.setCursor('sw-resize');
            this._sizeHandleBottomRight = this.addSubview(new WindowSizeHandle(RectMake(aRect.size.width - thickness, aRect.size.height - thickness, thickness, thickness)));
            this._sizeHandleBottomRight.setCursor('se-resize');
            this._sizeHandleHorizontallyLeft = this.addSubview(new WindowSizeHandle(RectMake(0, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyLeft.setCursor('w-resize');
            this._sizeHandleHorizontallyRight = this.addSubview(new WindowSizeHandle(RectMake(aRect.size.width - thickness, thickness, thickness, aRect.size.height - (2 * thickness))));
            this._sizeHandleHorizontallyRight.setCursor('e-resize');
            this._sizeHandleVerticallyTop = this.addSubview(new WindowSizeHandle(RectMake(thickness, 0, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyTop.setCursor('n-resize');
            this._sizeHandleVerticallyallyBottom = this.addSubview(new WindowSizeHandle(RectMake(thickness, aRect.size.height - thickness, aRect.size.width - (2 * thickness), thickness)));
            this._sizeHandleVerticallyallyBottom.setCursor('s-resize');
            // this.applyFrame();
            var theView = this;
            this._sizeHandleHorizontallyRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.East);
                }
            };
            this._sizeHandleHorizontallyLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.West);
                }
            };
            this._sizeHandleVerticallyTop.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, Resize.North);
                }
            };
            this._sizeHandleVerticallyallyBottom.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable) {
                    new ViewResizeManager(e, theView, Resize.South);
                }
            };
            this._sizeHandleTopLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.North | Resize.West);
                }
            };
            this._sizeHandleTopRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.North | Resize.East);
                }
            };
            this._sizeHandleBottomLeft.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.South | Resize.West);
                }
            };
            this._sizeHandleBottomRight.mouseDown = function (e) {
                if (!theView.isResizing && theView.isVertictallySizable && theView.isHorizontallySizable) {
                    new ViewResizeManager(e, theView, Resize.South | Resize.East);
                }
            };
            this.isHorizontallySizable = true;
            this.isVertictallySizable = true;
        }
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
        UserResizableView.prototype.applyFrame = function () {
            var thickness = this.resizeBorderThickness;
            this._sizeHandleTopLeft.frame = RectMake(0, 0, thickness, thickness);
            this._sizeHandleTopRight.frame = RectMake(this.frame.size.width - thickness, 0, thickness, thickness);
            this._sizeHandleBottomLeft.frame = RectMake(0, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleBottomRight.frame = RectMake(this.frame.size.width - thickness, this.frame.size.height - thickness, thickness, thickness);
            this._sizeHandleHorizontallyLeft.frame = RectMake(0, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleHorizontallyRight.frame = RectMake(this.frame.size.width - thickness, thickness, thickness, this.frame.size.height - (2 * thickness));
            this._sizeHandleVerticallyTop.frame = RectMake(thickness, 0, this.frame.size.width - (2 * thickness), thickness);
            this._sizeHandleVerticallyallyBottom.frame = RectMake(thickness, this.frame.size.height - thickness, this.frame.size.width - (2 * thickness), thickness);
            _super.prototype.applyFrame.call(this);
        };
        return UserResizableView;
    }(View));
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
    }(UserResizableView));
    red.UserDraggableView = UserDraggableView;
    (function (WindowCloseReason) {
        WindowCloseReason[WindowCloseReason["UserAction"] = 0] = "UserAction";
    })(red.WindowCloseReason || (red.WindowCloseReason = {}));
    var WindowCloseReason = red.WindowCloseReason;
    (function (WindowMinimizeReason) {
        WindowMinimizeReason[WindowMinimizeReason["UserAction"] = 0] = "UserAction";
    })(red.WindowMinimizeReason || (red.WindowMinimizeReason = {}));
    var WindowMinimizeReason = red.WindowMinimizeReason;
    function WindowWithSize(s) {
        var win = new Window(RectMakeZero());
        win.frame.size = s;
        win.applyFrame();
        return win;
    }
    red.WindowWithSize = WindowWithSize;
    var Window = (function (_super) {
        __extends(Window, _super);
        function Window(aRect) {
            if (aRect === void 0) { aRect = null; }
            _super.call(this, aRect = aRect || RectMake(0, 0, 329, 200));
            this.init();
            this._windowManager = red.application.windowManager;
            this._windowManager.addWindow(this);
            var me = this;
            this._titleBar.closeTool.mouseUp = function () {
                me.close(WindowCloseReason.UserAction);
            };
            this._titleBar.minimizeTool.mouseUp = function () {
                me.minimize(WindowMinimizeReason.UserAction);
            };
            this.setupWindow();
            this.unminimizedElement = this.element;
            this.applyFrame();
        }
        Object.defineProperty(Window.prototype, "delegate", {
            get: function () {
                return this._delegate;
            },
            set: function (d) {
                this._delegate = d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "title", {
            get: function () {
                return this._titleBar.title;
            },
            set: function (value) {
                this._titleBar.title = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "contentView", {
            get: function () {
                return this._contentView;
            },
            enumerable: true,
            configurable: true
        });
        Window.prototype.orderFront = function () {
            this.visible = false;
            this._windowManager.orderFront(this);
        };
        Window.prototype.init = function () {
            this.addCssClass('Window');
            this.minimumSize = SizeMake(64, 64);
            this.clipsContent = false;
            this._canBecomeKey = true;
            this._titleBar = new TitleBar(RectMake(this.resizeBorderThickness, this.resizeBorderThickness, this.frame.size.width - (2 * this.resizeBorderThickness), this.resizeBorderThickness + 26));
            this.isDraggable = true;
            this.dragHandleView = this._titleBar;
            this.addSubview(this._titleBar);
            var m = this.resizeBorderThickness;
            this._contentView = this.addSubview(new ContentView(RectMake(m, this._titleBar.frame.size.height, this.frame.size.width - (m * 2), this.frame.size.height - this._titleBar.frame.size.height - m)));
            this.allowDragAndDrop = true;
        };
        Window.prototype.close = function (reason) {
            if (reason === void 0) { reason = WindowCloseReason.UserAction; }
            if (this.windowShouldClose(reason)) {
                this.windowWillClose();
                this.parentView.removeSubview(this);
                this.windowDidClose();
            }
        };
        Window.prototype.windowShouldClose = function (reason) {
            if (this.delegate) {
                var fn = this.delegate.windowShouldClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        };
        Window.prototype.windowWillClose = function () {
            if (this.delegate) {
                var fn = this.delegate.windowDidClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.windowDidClose = function () {
            if (this.delegate) {
                var fn = this.delegate.windowDidClose;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.minimize = function (reason) {
            if (reason === void 0) { reason = WindowMinimizeReason.UserAction; }
            if (this.windowShouldMinimize(reason)) {
                this.windowWillMinimize();
                // this.parentView.removeSubview(this);
                this.visible = false;
                this.windowDidMinimize();
            }
        };
        Window.prototype.windowShouldMinimize = function (reason) {
            if (this.delegate) {
                var fn = this.delegate.windowShouldMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        };
        Window.prototype.windowWillMinimize = function () {
            if (this.delegate) {
                var fn = this.delegate.windowWillMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.windowDidMinimize = function () {
            if (this.delegate) {
                var fn = this.delegate.windowDidMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.unminimize = function (reason) {
            if (reason === void 0) { reason = WindowMinimizeReason.UserAction; }
            if (this.windowShouldUnMinimize(reason)) {
                this.windowWillUnMinimize();
                //this.parentView.removeSubview(this);
                this.windowDidUnMinimize();
            }
        };
        Window.prototype.windowShouldUnMinimize = function (reason) {
            if (this.delegate) {
                var fn = this.delegate.windowShouldUnMinimize;
                if (typeof fn == "function") {
                    return fn.call(this.delegate, this, reason);
                }
            }
            return true;
        };
        Window.prototype.windowWillUnMinimize = function () {
            if (this.delegate) {
                var fn = this.delegate.windowWillUnMinimize;
                if (typeof fn == "function") {
                    fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.windowDidUnMinimize = function () {
            if (this.delegate) {
                var fn = this.delegate.windowDidUnMinimize;
                if (typeof fn == "function") {
                    fn.call(this.delegate, this);
                }
            }
        };
        Window.prototype.setupWindow = function () {
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
        Window.prototype.keyDown = function (e) {
        };
        Window.prototype.keyUp = function (e) {
        };
        return Window;
    }(UserDraggableView));
    red.Window = Window;
    var AboutWindow = (function (_super) {
        __extends(AboutWindow, _super);
        function AboutWindow() {
            _super.call(this, RectMake(0, 0, 380, 300));
            this.title = 'About this software…';
        }
        AboutWindow.prototype.setupWindow = function () {
            var margin = 8, logoSize = 128;
            this.minimumSize = SizeMake(203, 300);
            this.maximumSize = SizeMake(800, 600);
            var logo = this.contentView.addSubview(new View(RectMake(margin, margin, logoSize, logoSize)));
            logo.addCssClass('Logo');
            logo.addCssClass('theredhead');
            logo.autoresizingMask = AutoresizingMask.LockedLeft | AutoresizingMask.LockedTop;
            logo.maximumSize = SizeMake(128, 128);
            var about = this.contentView.addSubview(new View(RectMake((2 * margin) + logo.frame.size.width, margin, this.contentView.frame.size.width - (3 * margin) - logo.frame.size.width, this.contentView.frame.size.height - (2 * margin))));
            about.autoresizingMask = AutoresizingMask.LockedRight | AutoresizingMask.LockedTop | AutoresizingMask.LockedBottom;
            about.element.style.padding = '0 8px';
            about.element.innerHTML =
                '<p>This software is built with TypedUI, an easy to use typescript frontend development framework built with no external dependencies, intended for desktop replacement web applications.</p>';
        };
        return AboutWindow;
    }(Window));
    red.AboutWindow = AboutWindow;
    var Application = (function () {
        function Application(delegate) {
            if (delegate === void 0) { delegate = null; }
            this._delegate = delegate;
            this._desktop = new Desktop();
            this._windowManager = new WindowManager(this._desktop);
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
            var _this = this;
            this._desktop.element.addEventListener('dblclick', function (e) {
                if (e.metaKey) {
                    e.preventDefault();
                    _this.about();
                }
            }, true);
        };
        Application.prototype.run = function () {
            this.initialize();
            if (this._delegate && this._delegate['applicationDidFinishLaunching']) {
                this._delegate.applicationDidFinishLaunching(this);
            }
        };
        Application.prototype.about = function () {
            if (this.aboutWindow == null) {
                this.aboutWindow = new AboutWindow();
            }
            this.desktop.addSubview(this.aboutWindow);
            this.aboutWindow.center();
            this.aboutWindow.visible = true;
        };
        return Application;
    }());
    red.Application = Application;
    var ScrollViewContentView = (function (_super) {
        __extends(ScrollViewContentView, _super);
        function ScrollViewContentView(aRect) {
            _super.call(this, aRect);
            var me = this;
            this.scrollTop = 0;
            this.scrollLeft = 0;
            this.element.addEventListener('scroll', function (e) { me.scrolled(e); }, true);
            this.autoresizesSubviews = false;
        }
        ScrollViewContentView.prototype.scrolled = function (e) {
            this.scrollLeft = this.element.scrollLeft;
            this.scrollTop = this.element.scrollTop;
        };
        ScrollViewContentView.prototype.applyFrame = function () {
            this.element.scrollLeft = this.scrollLeft;
            this.element.scrollTop = this.scrollTop;
            _super.prototype.applyFrame.call(this);
        };
        return ScrollViewContentView;
    }(View));
    red.ScrollViewContentView = ScrollViewContentView;
    /**
     * Provides a view that can scroll
     */
    var ScrollView = (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(aRect) {
            _super.call(this, aRect);
            this._scrollsVertically = true;
            this._scrollsHorizontally = true;
            this._scrollMode = 'auto';
            this._contentView = new ScrollViewContentView(RectMake(0, 0, this.frame.size.width, this.frame.size.height));
            this.contentView.autoresizesSubviews = false;
            this.autoresizesSubviews = false;
            this.addSubview(this._contentView);
        }
        Object.defineProperty(ScrollView.prototype, "scrollsVertically", {
            get: function () {
                return this._scrollsVertically;
            },
            set: function (value) {
                this._scrollsVertically = value;
                this.applyFrame();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "scrollsHorizontally", {
            get: function () {
                return this._scrollsHorizontally;
            },
            set: function (value) {
                this._scrollsHorizontally = value;
                this.applyFrame();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "contentView", {
            get: function () {
                return this._contentView;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollView.prototype, "scrollMode", {
            get: function () {
                return this._scrollMode;
            },
            set: function (value) {
                if (['scroll', 'auto'].indexOf(value.toLowerCase())) {
                    throw new Error('scrollMode must be either "scroll" or "auto". not "' + value + '".');
                }
                this._scrollMode = value.toLowerCase();
                this.applyFrame();
            },
            enumerable: true,
            configurable: true
        });
        ScrollView.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            this.contentView.frame = RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            this.contentView.element.style.overflowX = this.scrollsHorizontally ? this.scrollMode : 'clip';
            this.contentView.element.style.overflowX = this.scrollsVertically ? this.scrollMode : 'clip';
            this.clipsContent = true;
            this.contentView.clipsContent = false;
        };
        return ScrollView;
    }(View));
    red.ScrollView = ScrollView;
    var TextField = (function (_super) {
        __extends(TextField, _super);
        function TextField() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(TextField.prototype, "text", {
            get: function () {
                return this.element.innerText;
            },
            set: function (v) {
                this.element.innerText = v;
            },
            enumerable: true,
            configurable: true
        });
        return TextField;
    }(View));
    red.TextField = TextField;
    var PushButton = (function (_super) {
        __extends(PushButton, _super);
        function PushButton(aRect) {
            var _this = this;
            _super.call(this, aRect);
            this.action = function () { };
            this.textField = new TextField(this.makeLabelFrame());
            this.addSubview(this.textField);
            this.element.addEventListener('click', function () { _this.action(); }, true);
        }
        Object.defineProperty(PushButton.prototype, "label", {
            get: function () {
                return this.textField.text;
            },
            set: function (v) {
                this.textField.text = v;
            },
            enumerable: true,
            configurable: true
        });
        PushButton.prototype.makeLabelFrame = function () {
            return red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
        };
        PushButton.prototype.applyFrame = function () {
            this.textField.frame = this.makeLabelFrame();
            this.textField.element.style.textAlign = 'center';
            _super.prototype.applyFrame.call(this);
        };
        return PushButton;
    }(View));
    red.PushButton = PushButton;
    (function (StackViewOrientation) {
        StackViewOrientation[StackViewOrientation["Horizontal"] = 0] = "Horizontal";
        StackViewOrientation[StackViewOrientation["Vertical"] = 1] = "Vertical";
    })(red.StackViewOrientation || (red.StackViewOrientation = {}));
    var StackViewOrientation = red.StackViewOrientation;
    var StackView = (function (_super) {
        __extends(StackView, _super);
        function StackView() {
            _super.apply(this, arguments);
            this._margin = 1;
            this._orientation = StackViewOrientation.Vertical;
        }
        Object.defineProperty(StackView.prototype, "margin", {
            get: function () {
                return this._margin;
            },
            set: function (value) {
                this._margin = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackView.prototype, "orientation", {
            get: function () {
                return this._orientation;
            },
            set: function (value) {
                this._orientation = value;
            },
            enumerable: true,
            configurable: true
        });
        StackView.prototype.addSubView = function (view) {
            _super.prototype.addSubview.call(this, view);
            this.applyStacking();
        };
        StackView.prototype.removeSubView = function (view) {
            _super.prototype.removeSubview.call(this, view);
            this.applyStacking();
        };
        StackView.prototype.applyStacking = function () {
            var subViews = this.subViews, rects = [], ix = 0;
            for (ix = 0; ix < subViews.length; ix++) {
                rects.push(subViews[ix].frame);
            }
            switch (this.orientation) {
                case StackViewOrientation.Vertical:
                    this.frame.adjustRectsToFitVertically(rects, this.margin);
                    break;
                case StackViewOrientation.Horizontal:
                    this.frame.adjustRectsToFitHorizontally(rects, this.margin);
                    break;
            }
            for (ix = 0; ix < subViews.length; ix++) {
                subViews[ix].applyFrame();
            }
        };
        StackView.prototype.applyFrame = function () {
            this.applyStacking();
        };
        return StackView;
    }(View));
    red.StackView = StackView;
    (function (SplitViewOrientation) {
        SplitViewOrientation[SplitViewOrientation["Horizontal"] = 0] = "Horizontal";
        SplitViewOrientation[SplitViewOrientation["Vertical"] = 1] = "Vertical";
    })(red.SplitViewOrientation || (red.SplitViewOrientation = {}));
    var SplitViewOrientation = red.SplitViewOrientation;
    var SplitViewSplitBar = (function (_super) {
        __extends(SplitViewSplitBar, _super);
        function SplitViewSplitBar(aRect) {
            _super.call(this, aRect);
            this.addCssClass('SplitViewSplitBar');
        }
        return SplitViewSplitBar;
    }(View));
    red.SplitViewSplitBar = SplitViewSplitBar;
    var SplitViewAdjustManager = (function () {
        function SplitViewAdjustManager(e, view) {
            var _this = this;
            this.view = view;
            this.view.isBeingResized = true;
            // this.view.splitterPosition = this.view.splitterPosition+1;
            // this.view.splitterPosition = this.view.splitterPosition-1;
            //this.offsetPosition =
            //    (view.orientation == SplitViewOrientation.Horizontal ? (e.x - view.frame.origin.x + view.splitterPosition) : (e.y - view.frame.origin.y + view.splitterPosition));
            if (this.view.orientation == SplitViewOrientation.Horizontal) {
                this.offsetPosition = e.x - this.view.splitterPosition - (this.view.splitterSize / 2);
            }
            else {
                this.offsetPosition = e.y - this.view.splitterPosition - (this.view.splitterSize / 2);
            }
            this.mouseMoveHandler = function (e) {
                _this.handleMouseMove(e);
            };
            this.mouseUpHandler = function (e) {
                _this.handleMouseRelease(e);
            };
            document.addEventListener('mousemove', this.mouseMoveHandler, true);
            document.addEventListener('mouseup', this.mouseUpHandler, true);
        }
        SplitViewAdjustManager.prototype.handleMouseMove = function (e) {
            if (this.view.orientation == SplitViewOrientation.Horizontal) {
                var draggedToPosition = e.x - this.offsetPosition - (this.view.splitterSize / 2);
                if (draggedToPosition <= this.view.frame.size.width)
                    this.view.splitterPosition = draggedToPosition;
            }
            else {
                var draggedToPosition = e.y - this.offsetPosition - (this.view.splitterSize / 2);
                if (draggedToPosition <= this.view.frame.size.height)
                    this.view.splitterPosition = draggedToPosition;
            }
            e.preventDefault();
            this.view.applyFrame();
        };
        SplitViewAdjustManager.prototype.handleMouseRelease = function (e) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
            this.view.isBeingResized = false;
            this.view.applyFrame();
        };
        return SplitViewAdjustManager;
    }());
    red.SplitViewAdjustManager = SplitViewAdjustManager;
    var SplitView = (function (_super) {
        __extends(SplitView, _super);
        function SplitView(aRect) {
            var _this = this;
            _super.call(this, aRect);
            this._isBeingResized = false;
            this._orientation = SplitViewOrientation.Horizontal;
            this._positionFromEnd = false;
            this._splitterSize = 8;
            this._splitterPosition = -1;
            this.autoresizesSubviews = true;
            this.contentView1 = new ContentView(RectMakeZero());
            this.contentView2 = new ContentView(RectMakeZero());
            this.splitterView = new SplitViewSplitBar(RectMakeZero());
            this.splitterView.setBackgroundColor(red.colors.lightGray);
            this.addCssClass('SplitView');
            this.splitterView.mouseDown = function (e) {
                if (!_this.isBeingResized) {
                    new SplitViewAdjustManager(e, _this);
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
        Object.defineProperty(SplitView.prototype, "isBeingResized", {
            get: function () {
                return this._isBeingResized;
            },
            set: function (value) {
                this._isBeingResized = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "orientation", {
            get: function () {
                return this._orientation;
            },
            set: function (value) {
                if (this._orientation != value) {
                    this._orientation = value;
                    this.applyFrame();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "isPositionedFromEnd", {
            get: function () {
                return this._positionFromEnd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "positionFromEnd", {
            set: function (value) {
                this._positionFromEnd = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "splitterSize", {
            get: function () {
                return this._splitterSize;
            },
            set: function (value) {
                if (this._splitterSize != value) {
                    this._splitterSize = value;
                    this.applyFrame();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "splitterPosition", {
            get: function () {
                if (this._splitterPosition == -1) {
                    return this.orientation == SplitViewOrientation.Horizontal
                        ? this.frame.size.height / 2
                        : this.frame.size.width / 2;
                }
                return this._splitterPosition;
            },
            set: function (value) {
                if (value < 0)
                    value = 0;
                if (value > this.frame.size.width)
                    value = this.frame.size.width;
                if (this._splitterPosition != value) {
                    this._splitterPosition = value;
                    this.applyFrame();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "splitterPositionPercentage", {
            get: function () {
                var position = this.splitterPosition;
                var available = (this.orientation == SplitViewOrientation.Horizontal)
                    ? this.frame.size.width
                    : this.frame.size.height;
                return (100 / available) * position;
            },
            set: function (v) {
                var available = (this.orientation == SplitViewOrientation.Horizontal)
                    ? this.frame.size.width
                    : this.frame.size.height;
                this.splitterPosition = (available / 100) * v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "splitterView", {
            get: function () {
                return this._splitterView;
            },
            set: function (value) {
                this._splitterView = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "contentView1", {
            get: function () {
                return this._contentView1;
            },
            set: function (value) {
                this._contentView1 = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitView.prototype, "contentView2", {
            get: function () {
                return this._contentView2;
            },
            set: function (value) {
                this._contentView2 = value;
            },
            enumerable: true,
            configurable: true
        });
        SplitView.prototype.init = function () {
            if (this.parentView && this.frame.size != this.parentView.frame.size) {
                this.frame = this.parentView.frame.sizeOnlyCopy();
            }
        };
        SplitView.prototype.applyFrame = function () {
            if (this.orientation == SplitViewOrientation.Horizontal) {
                this.applyFrameHorizontal();
                this.splitterView.removeCssClass('Vertical');
                this.splitterView.addCssClass('Horizontal');
            }
            else {
                this.applyFrameVertical();
                this.splitterView.removeCssClass('Horizontal');
                this.splitterView.addCssClass('Vertical');
            }
            _super.prototype.applyFrame.call(this);
        };
        SplitView.prototype.applyFrameHorizontal = function () {
            var pos = this._splitterPosition = this._splitterPosition == -1
                ? this.frame.size.width / 2
                : this._splitterPosition;
            this.splitterView.frame = RectMake(pos - (this.splitterSize / 2), 0, this.splitterSize, this.frame.size.height);
            this.contentView1.frame = RectMake(0, 0, this.splitterView.frame.origin.x, this.frame.size.height);
            this.contentView2.frame = RectMake(this.splitterView.frame.origin.x + this.splitterView.frame.size.width, 0, this.frame.size.width - (this.splitterView.frame.origin.x + this.splitterView.frame.size.width), this.frame.size.height);
        };
        SplitView.prototype.applyFrameVertical = function () {
            var pos = this._splitterPosition = this._splitterPosition == -1
                ? this.frame.size.height / 2
                : this._splitterPosition;
            this.splitterView.frame = RectMake(0, pos - (this.splitterSize / 2), this.frame.size.width, this.splitterSize);
            this.contentView1.frame = RectMake(0, 0, this.frame.size.width, this.splitterPosition - (this.splitterSize / 2));
            this.contentView2.frame = RectMake(0, this.splitterView.frame.origin.y + this.splitterSize, this.frame.size.width, this.frame.size.height - (this.splitterView.frame.origin.y + this.splitterSize));
        };
        SplitView.prototype.didUpdateFrame = function (oldFrame, newFrame) {
            if (!this.isBeingResized && this.isPositionedFromEnd) {
                var offset;
                if (this.orientation == SplitViewOrientation.Horizontal) {
                    offset = oldFrame.size.width - this.splitterPosition;
                    this.splitterPosition = newFrame.size.width - offset;
                    if (this.splitterPosition < 0)
                        this.splitterPosition = 0;
                    else if (this.splitterPosition > newFrame.size.width)
                        this.splitterPosition = newFrame.size.width;
                }
                else {
                    offset = oldFrame.size.height - this.splitterPosition;
                    this.splitterPosition = newFrame.size.height - offset;
                    if (this.splitterPosition < 0)
                        this.splitterPosition = 0;
                    else if (this.splitterPosition > newFrame.size.height)
                        this.splitterPosition = newFrame.size.height;
                }
            }
            _super.prototype.didUpdateFrame.call(this, oldFrame, newFrame);
        };
        return SplitView;
    }(View));
    red.SplitView = SplitView;
    var HorizontalSplitView = (function (_super) {
        __extends(HorizontalSplitView, _super);
        function HorizontalSplitView() {
            _super.apply(this, arguments);
        }
        HorizontalSplitView.prototype.init = function () {
            this.orientation = SplitViewOrientation.Horizontal;
        };
        return HorizontalSplitView;
    }(SplitView));
    red.HorizontalSplitView = HorizontalSplitView;
    var VerticalSplitView = (function (_super) {
        __extends(VerticalSplitView, _super);
        function VerticalSplitView() {
            _super.apply(this, arguments);
        }
        VerticalSplitView.prototype.init = function () {
            this.orientation = SplitViewOrientation.Vertical;
        };
        return VerticalSplitView;
    }(SplitView));
    red.VerticalSplitView = VerticalSplitView;
    var TextEditor = (function (_super) {
        __extends(TextEditor, _super);
        function TextEditor(rect) {
            _super.call(this, rect);
            var me = this;
            this._ace = document.createElement('div');
            this.element.appendChild(this._ace);
            this._editor = ace.edit(this._ace);
            this._editor.getSession().on('change', function (e) {
                me.onStringValueDidChange(e);
            });
        }
        Object.defineProperty(TextEditor.prototype, "delegate", {
            get: function () {
                return this._delegate;
            },
            set: function (d) {
                this._delegate = d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextEditor.prototype, "mode", {
            get: function () {
                return this._editor.getSession().getMode();
            },
            set: function (v) {
                this._editor.getSession().setMode(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextEditor.prototype, "stringValue", {
            get: function () {
                return this._editor.getValue();
            },
            set: function (v) {
                return this._editor.setValue(v);
            },
            enumerable: true,
            configurable: true
        });
        TextEditor.prototype.didUpdateFrame = function (oldFrame, newFrame) {
            window.dispatchEvent(new Event('resize')); // force ace to update
        };
        TextEditor.prototype.onStringValueDidChange = function (e) {
            // console.log('onStringValueDidChange', e, this.stringValue);
            if (this.delegate) {
                var fn = this.delegate.stringValueDidChange;
                if (typeof fn == 'function')
                    fn.call(this.delegate, this);
            }
        };
        TextEditor.prototype.applyFrame = function () {
            this._ace.style.position = 'absolute';
            this._ace.style.display = 'block';
            this._ace.style.top = this.frame.origin.y + 'px';
            this._ace.style.left = this.frame.origin.x + 'px';
            this._ace.style.height = this.frame.size.height + 'px';
            this._ace.style.width = this.frame.size.width + 'px';
            _super.prototype.applyFrame.call(this);
        };
        return TextEditor;
    }(View));
    red.TextEditor = TextEditor;
    var TabContainer = (function (_super) {
        __extends(TabContainer, _super);
        function TabContainer(r) {
            _super.call(this, r);
            this._tabs = [];
            this._buttonBar = new TabButtonBar(RectMakeZero(SizeMake(r.size.width, 24)));
            this._buttonBar.setBackgroundColor(red.colors.green);
            this.applyFrame();
        }
        Object.defineProperty(TabContainer.prototype, "tabs", {
            get: function () { return this._tabs; },
            enumerable: true,
            configurable: true
        });
        TabContainer.prototype.applyFrame = function () {
            this._buttonBar.frame = RectMakeZero(SizeMake(this.frame.size.width, 24));
            _super.prototype.applyFrame.call(this);
        };
        return TabContainer;
    }(View));
    red.TabContainer = TabContainer;
    var TabButtonBar = (function (_super) {
        __extends(TabButtonBar, _super);
        function TabButtonBar() {
            _super.apply(this, arguments);
            this._tabs = [];
        }
        Object.defineProperty(TabButtonBar.prototype, "tabs", {
            get: function () { return this._tabs; },
            enumerable: true,
            configurable: true
        });
        TabButtonBar.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
        };
        return TabButtonBar;
    }(View));
    red.TabButtonBar = TabButtonBar;
    var Tab = (function () {
        function Tab(lbl, cntView) {
            this.label = label;
            this.contentView = cntView;
        }
        Object.defineProperty(Tab.prototype, "label", {
            get: function () { return this._label; },
            set: function (v) { this._label = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tab.prototype, "contentView", {
            get: function () { return this._contentView; },
            set: function (v) { this._contentView = v; },
            enumerable: true,
            configurable: true
        });
        return Tab;
    }());
    red.Tab = Tab;
    document.addEventListener('DOMContentLoaded', function () {
        red.application = new Application();
    }, true);
})(red || (red = {}));
//# sourceMappingURL=ui.js.map