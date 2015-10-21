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
            return new Point(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
        };
        return Point;
    })();
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
    })();
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

        Rect.prototype.shrink = function (pixels) {
            return RectMake(this.origin.x + pixels, this.origin.y + pixels, this.size.width - 2 * pixels, this.size.height - 2 * pixels);
        };

        Rect.prototype.copy = function () {
            return RectMake(this.origin.x, this.origin.y, this.size.width, this.size.height);
        };

        Rect.prototype.toString = function () {
            return [this.origin.x, this.origin.y, this.size.width, this.size.height].join(', ');
        };

        Rect.prototype.isEquivalentTToRect = function (otherRect) {
            return this.toString() == otherRect.toString();
        };

        Rect.prototype.intersects = function (other) {
            var delta = this.center.distanceTo(other.center);
            return delta.x < (this.size.width / 2) || delta.x < (other.size.width / 2) && delta.y < (this.size.height / 2) || delta.y < (other.size.height / 2);
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
            //this.applyFrame();
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
    var viewId = 0;
    var View = (function (_super) {
        __extends(View, _super);
        function View(frame) {
            _super.call(this, frame);
            this._autoresizesSubviews = false;
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
        };

        View.prototype.resizeSubviews = function (oldSize, newSize) {
            if (oldSize != null) {
                if (this.autoresizesSubviews) {
                    var oldRect = RectMake(0, 0, oldSize.width, oldSize.height);
                    for (var ix = 0; ix < this._subViews.length; ix++) {
                        var sub = this._subViews[ix], frame = sub.frame.copy(), rect = resizeProportionally(sub.frame, oldSize, newSize);

                        if ((sub.autoresizingMask & 2 /* LockedLeft */) == 2 /* LockedLeft */) {
                            rect.origin.x = sub.frame.origin.x;
                        }
                        if ((sub.autoresizingMask & 1 /* LockedTop */) == 1 /* LockedTop */) {
                            rect.origin.y = sub.frame.origin.y;
                        }
                        if ((sub.autoresizingMask & 8 /* LockedRight */) == 8 /* LockedRight */) {
                            var distanceFromOldRight = oldSize.width - (frame.size.width + frame.origin.x);
                            rect.size.width = newSize.width - rect.origin.x - distanceFromOldRight;
                        }
                        if ((sub.autoresizingMask & 4 /* LockedBottom */) == 4 /* LockedBottom */) {
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
            _super.prototype.applyFrame.call(this);
            for (var ix = 0; ix < this._subViews.length; ix++) {
                var view = this._subViews[ix];
                view.applyFrame();
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
            //this.applyFrame();
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
            this.view.applyFrame();
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
        function TitleBar(aRect) {
            _super.call(this, aRect);
            this._titleView = new View(this.makeTitleViewRect());
            this._titleView.element.style.overflow = 'ellipsis';
            this.addSubview(this._titleView);

            this._tools = this.addSubview(new View(RectMake(2, 2, 80, 20)));
            this._tools.addCssClass('WindowTools');
            this._tools.applyFrame();

            var y = 4, s = 12, o = 8;
            this._closeTool = this._tools.addSubview(new WindowTool(RectMake(o, y, s, s), 0 /* Close */));
            this._minimizeTool = this._tools.addSubview(new WindowTool(RectMake(o + (2 * s), y, s, s), 1 /* Minimize */));
            this._resizeTool = this._tools.addSubview(new WindowTool(RectMake(o + (4 * s), y, s, s), 2 /* Resize */));
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
            return RectMake(80, 4, this.frame.size.width - 80, this.frame.size.height - 8);
        };
        return TitleBar;
    })(View);
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
            } else {
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
    })();
    red.WindowManager = WindowManager;

    var ContentView = (function (_super) {
        __extends(ContentView, _super);
        function ContentView(aRect) {
            _super.call(this, aRect);
            this.autoresizesSubviews = true;
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

    (function (WindowCloseReason) {
        WindowCloseReason[WindowCloseReason["UserAction"] = 0] = "UserAction";
    })(red.WindowCloseReason || (red.WindowCloseReason = {}));
    var WindowCloseReason = red.WindowCloseReason;

    (function (WindowMinimizeReason) {
        WindowMinimizeReason[WindowMinimizeReason["UserAction"] = 0] = "UserAction";
    })(red.WindowMinimizeReason || (red.WindowMinimizeReason = {}));
    var WindowMinimizeReason = red.WindowMinimizeReason;

    var Window = (function (_super) {
        __extends(Window, _super);
        function Window(aRect) {
            if (typeof aRect === "undefined") { aRect = null; }
            _super.call(this, aRect = aRect || RectMake(0, 0, 329, 200));
            this.init();
            this._windowManager = red.application.windowManager;
            this._windowManager.addWindow(this);

            var me = this;
            this._titleBar.closeTool.mouseUp = function () {
                me.close(0 /* UserAction */);
            };
            this._titleBar.minimizeTool.mouseUp = function () {
                me.minimize(0 /* UserAction */);
            };

            this.setupWindow();
            this.unminimizedElement = this.element;
            this.applyFrame();
        }
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
            if (typeof reason === "undefined") { reason = 0 /* UserAction */; }
            if (this.windowShouldClose(reason)) {
                this.windowWillClose();
                this.parentView.removeSubview(this);
                this.windowDidClose();
            }
        };

        Window.prototype.windowShouldClose = function (reason) {
            return true;
        };

        Window.prototype.windowWillClose = function () {
        };

        Window.prototype.windowDidClose = function () {
        };

        Window.prototype.minimize = function (reason) {
            if (typeof reason === "undefined") { reason = 0 /* UserAction */; }
            if (this.windowShouldMinimize(reason)) {
                this.windowWillMinimize();

                //this.parentView.removeSubview(this);
                this.windowDidMinimize();
            }
        };

        Window.prototype.windowShouldMinimize = function (reason) {
            return true;
        };

        Window.prototype.windowWillMinimize = function () {
        };

        Window.prototype.windowDidMinimize = function () {
        };

        Window.prototype.unminimize = function (reason) {
            if (typeof reason === "undefined") { reason = 0 /* UserAction */; }
            if (this.windowShouldUnMinimize(reason)) {
                this.windowWillUnMinimize();

                //this.parentView.removeSubview(this);
                this.windowDidUnMinimize();
            }
        };

        Window.prototype.windowShouldUnMinimize = function (reason) {
            return true;
        };

        Window.prototype.windowWillUnMinimize = function () {
        };

        Window.prototype.windowDidUnMinimize = function () {
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
    })(UserDraggableView);
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
            logo.autoresizingMask = 2 /* LockedLeft */ | 1 /* LockedTop */;
            logo.maximumSize = SizeMake(128, 128);

            var about = this.contentView.addSubview(new View(RectMake((2 * margin) + logo.frame.size.width, margin, this.contentView.frame.size.width - (3 * margin) - logo.frame.size.width, this.contentView.frame.size.height - (2 * margin))));

            about.autoresizingMask = 8 /* LockedRight */ | 1 /* LockedTop */ | 4 /* LockedBottom */;
            about.element.style.padding = '0 8px';
            about.element.innerHTML = '<p>This software is built with TypedUI, an easy to use typescript frontend development framework built with no external dependencies, intended for desktop replacement web applications.</p>';
        };
        return AboutWindow;
    })(Window);
    red.AboutWindow = AboutWindow;

    var Application = (function () {
        function Application(delegate) {
            if (typeof delegate === "undefined") { delegate = null; }
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
    })();
    red.Application = Application;

    var ScrollViewContentView = (function (_super) {
        __extends(ScrollViewContentView, _super);
        function ScrollViewContentView(aRect) {
            _super.call(this, aRect);
            var me = this;
            this.scrollTop = 0;
            this.scrollLeft = 0;
            this.element.addEventListener('scroll', function (e) {
                me.scrolled(e);
            }, true);
            this.autoresizesSubviews = false;
        }
        ScrollViewContentView.prototype.scrolled = function (e) {
            this.scrollLeft = this.element.scrollLeft;
            this.scrollTop = this.element.scrollTop;
            //console.log(this.element.scrollLeft, this.element.scrollTop);
        };

        ScrollViewContentView.prototype.applyFrame = function () {
            this.element.scrollLeft = this.scrollLeft;
            this.element.scrollTop = this.scrollTop;
            _super.prototype.applyFrame.call(this);
        };
        return ScrollViewContentView;
    })(View);
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
    })(View);
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
    })(View);
    red.TextField = TextField;

    var PushButton = (function (_super) {
        __extends(PushButton, _super);
        function PushButton(aRect) {
            var _this = this;
            _super.call(this, aRect);
            this.action = function () {
            };
            this.textField = new TextField(this.makeLabelFrame());
            this.addSubview(this.textField);
            this.element.addEventListener('click', function () {
                _this.action();
            }, true);
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
    })(View);
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
            this._orientation = 1 /* Vertical */;
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
                case 1 /* Vertical */:
                    this.frame.adjustRectsToFitVertically(rects, this.margin);
                    break;

                case 0 /* Horizontal */:
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
    })(View);
    red.StackView = StackView;

    red.application;
    document.addEventListener('DOMContentLoaded', function () {
        red.application = new Application();
    }, true);
})(red || (red = {}));
/// <reference path="ui.ts"/>
var tests;
(function (_tests) {
    var ScrollViewWindow = (function (_super) {
        __extends(ScrollViewWindow, _super);
        function ScrollViewWindow(aRect) {
            _super.call(this, aRect);
            this.autoresizesSubviews = false;
            this.scrollView = new red.ScrollView(this.contentView.frame);
            this.contentView.addSubview(this.scrollView);
            this.contentView.autoresizesSubviews = false;
            var img = this.scrollView.contentView.addSubview(new red.View(red.RectMake(0, 0, 1920, 1200)));

            //img.autoresizingMask =
            //    red.AutoresizingMask.LockedTop |
            //    red.AutoresizingMask.LockedRight |
            //    red.AutoresizingMask.LockedBottom |
            //    red.AutoresizingMask.LockedLeft;
            img.setBackgroundImage('img/mountains.jpg');
            this.applyFrame();
        }
        ScrollViewWindow.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            if (this.contentView && this.scrollView) {
                this.scrollView.frame = red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            }
        };
        return ScrollViewWindow;
    })(red.Window);

    var PushButtonWindow = (function (_super) {
        __extends(PushButtonWindow, _super);
        function PushButtonWindow() {
            _super.apply(this, arguments);
        }
        PushButtonWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            this.button = this.contentView.addSubview(new red.PushButton(red.RectMake(32, 32, 100, 20)));
            this.button.label = 'Hello, World!';
            this.autoresizesSubviews = true;
        };
        return PushButtonWindow;
    })(red.Window);

    var Ball = (function (_super) {
        __extends(Ball, _super);
        function Ball(x, y, r) {
            _super.call(this, red.RectMakeZero());
            this.deltaR = 0.5;
            this.addCssClass('BouncingBall');
            this.x = x;
            this.y = y;
            this.r = r;

            this.minRadius = Math.floor(r / 2);
            this.maxRadius = Math.ceil(r * 2);

            this.deltaX = (Math.round(Math.random()) ? 1 : -1) * (5 * Math.random());
            this.deltaY = (Math.round(Math.random()) ? 1 : -1) * (5 * Math.random());
            this.applyPosition();
        }
        Ball.prototype.isCollidingWith = function (other) {
            return this.frame.intersects(other.frame);
        };

        Ball.prototype.tick = function () {
            if (this.x + this.r + this.deltaX > this.parentView.frame.size.width || this.x - this.r + this.deltaX < 0) {
                this.deltaX = -1 * this.deltaX;
            }
            if (this.y + this.r + this.deltaY > this.parentView.frame.size.height || this.y - this.r + this.deltaY < 0) {
                this.deltaY = -1 * this.deltaY;
            }
            if (this.r + this.deltaR > this.maxRadius || this.r + this.deltaR < this.minRadius) {
                this.deltaR = -1 * this.deltaR;
            }

            this.x += this.deltaX;
            this.y += this.deltaY;
            this.r += this.deltaR;

            this.applyPosition();
        };

        Ball.prototype.applyPosition = function () {
            this.frame = this.makeRect(this.x, this.y, this.r);
            this.applyFrame();
        };

        Ball.prototype.makeRect = function (x, y, r) {
            return red.RectMake(x - r, y - r, 2 * r, 2 * r);
        };
        return Ball;
    })(red.View);

    var BouncingBallWindow = (function (_super) {
        __extends(BouncingBallWindow, _super);
        function BouncingBallWindow() {
            _super.apply(this, arguments);
        }
        BouncingBallWindow.prototype.tick = function (w) {
            for (var ix = 0; ix < w._balls.length; ix++) {
                w._balls[ix].tick();
            }
        };

        BouncingBallWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            var numberOfBalls = 10;
            this._balls = [];
            for (var n = 0; n < numberOfBalls; n++) {
                var r = (20 * Math.random()) + 5, x = Math.random() * (this.frame.size.width - r), y = Math.random() * (this.frame.size.height - r), ball = new Ball(x, y, r);
                this._balls.push(ball);
                this.contentView.addSubview(ball);
            }

            var update = (function (w) {
                return function () {
                    w.tick(w);
                };
            })(this);
            setInterval(update, 25);
        };
        return BouncingBallWindow;
    })(red.Window);

    var StackViewWindow = (function (_super) {
        __extends(StackViewWindow, _super);
        function StackViewWindow() {
            _super.apply(this, arguments);
        }
        StackViewWindow.prototype.init = function () {
            _super.prototype.init.call(this);

            this.panel = new red.StackView(red.RectMake(0, 0, this.frame.size.width, this.contentView.frame.size.height));
            this.contentView.addSubview((this.panel));
            for (var key in red.colors) {
                if (red.colors.hasOwnProperty(key)) {
                    var color = red.colors[key];

                    var view = new red.View(red.RectMakeZero());
                    this.panel.addSubView(view);
                    view.setBackgroundColor(color);
                }
            }
        };

        StackViewWindow.prototype.applyFrame = function () {
            this.panel.frame = red.RectMake(0, 0, this.contentView.frame.size.width, this.contentView.frame.size.height);
            _super.prototype.applyFrame.call(this);
        };
        return StackViewWindow;
    })(red.Window);

    var VerticalStackViewWindow = (function (_super) {
        __extends(VerticalStackViewWindow, _super);
        function VerticalStackViewWindow() {
            _super.apply(this, arguments);
        }
        VerticalStackViewWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            this.panel.orientation = 1 /* Vertical */;
        };
        return VerticalStackViewWindow;
    })(StackViewWindow);

    var HorizontalStackViewWindow = (function (_super) {
        __extends(HorizontalStackViewWindow, _super);
        function HorizontalStackViewWindow() {
            _super.apply(this, arguments);
        }
        HorizontalStackViewWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            this.panel.orientation = 0 /* Horizontal */;
        };
        return HorizontalStackViewWindow;
    })(StackViewWindow);

    var TestController = (function () {
        function TestController(name, window) {
            this.name = name;
            this.window = window;

            red.application.windowManager.addWindow(this.window);
        }
        Object.defineProperty(TestController.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TestController.prototype, "window", {
            get: function () {
                return this._window;
            },
            set: function (value) {
                this._window = value;
            },
            enumerable: true,
            configurable: true
        });

        TestController.prototype.showWindow = function () {
            this._window.orderFront();
        };
        return TestController;
    })();
    _tests.TestController = TestController;

    var TestsController = (function () {
        function TestsController(tests) {
            this._tests = [];
            this._tests = tests;

            var win = this._window = new red.Window(red.RectMake(0, 0, 200, 300)), content = win.contentView.addSubview(new red.ScrollView(win.frame.copy())), y = 0, h = 32, test, m = 4;
            win.title = 'Tests';
            win.frame.origin.x = win.parentView.frame.size.width - win.frame.size.width;
            win.applyFrame();

            for (var ix = 0; ix < this._tests.length; ix++) {
                y = ix * h;
                test = this._tests[ix];
                var button = content.addSubview(new red.PushButton(red.RectMake(m, m + y, content.frame.size.width - (4 * m), h - (2 * m))));
                button.label = test.name;

                test.window.title = test.name;

                //button.element.style.radiusX = button.element.style.radiusY = 5;
                button.action = (function (tc) {
                    return function (e) {
                        tc.showWindow();
                    };
                })(test);
            }

            win.orderFront();
        }
        return TestsController;
    })();
    _tests.TestsController = TestsController;

    _tests.tests;

    document.addEventListener('DOMContentLoaded', function () {
        var offset = 32, n = -1;

        _tests.tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake((++n) * offset, n * offset, 320, 200))),
            new TestController('Push button', new PushButtonWindow(red.RectMake((++n) * offset, n * offset, 320, 200))),
            new TestController('Bouncy', new BouncingBallWindow(red.RectMake((++n) * offset, n * offset, 320, 200))),
            new TestController('VerticalStackView', new VerticalStackViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200))),
            new TestController('HorizontalStackView', new HorizontalStackViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200)))
        ]);
    }, true);
})(tests || (tests = {}));
//# sourceMappingURL=tests.js.map
