/// <reference path="ui.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tests;
(function (tests_1) {
    var ScrollViewWindow = (function (_super) {
        __extends(ScrollViewWindow, _super);
        function ScrollViewWindow(aRect) {
            _super.call(this, aRect);
            this.autoresizesSubviews = false;
            this.scrollView = new red.ScrollView(this.contentView.frame);
            this.contentView.addSubview(this.scrollView);
            this.contentView.autoresizesSubviews = false;
            var img = this.scrollView.contentView.addSubview(new red.View(red.RectMake(0, 0, 1920, 1200)));
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
    }(red.Window));
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
    }(red.Window));
    var Ball = (function (_super) {
        __extends(Ball, _super);
        function Ball(x, y, r) {
            _super.call(this, red.RectMakeZero());
            this.deltaR = 0.1;
            this.boost = 1.00;
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
        Ball.prototype.isHorizontallyCollidingWith = function (other) {
            return (this.x + this.r) >= (other.x - other.r) &&
                (this.x - this.r) <= (other.x + other.r);
        };
        Ball.prototype.isVerticallyCollidingWith = function (other) {
            return (this.y + this.r) >= (other.y - other.r) &&
                (this.y - this.r) <= (other.y + other.r);
        };
        Ball.prototype.tick = function () {
            if (this.x + this.r + (this.deltaX * this.boost) >= this.parentView.frame.size.width || this.x - this.r + (this.deltaX * this.boost) <= 0) {
                this.deltaX = -1 * this.deltaX;
            }
            if (this.y + this.r + (this.deltaY * this.boost) >= this.parentView.frame.size.height || this.y - this.r + (this.deltaY * this.boost) <= 0) {
                this.deltaY = -1 * this.deltaY;
            }
            if (this.r + this.deltaR > this.maxRadius || this.r + this.deltaR < this.minRadius) {
                this.deltaR = -1 * this.deltaR;
            }
            this.x += (this.boost * this.deltaX);
            this.y += (this.boost * this.deltaY);
            this.boost = this.boost > 1 ? this.boost - 0.25 : this.boost;
            if (this.boost > 2)
                this.boost = 2;
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
    }(red.View));
    var BouncingBallWindow = (function (_super) {
        __extends(BouncingBallWindow, _super);
        function BouncingBallWindow() {
            _super.apply(this, arguments);
        }
        BouncingBallWindow.prototype.tick = function (w) {
            for (var ix = 0; ix < w._balls.length; ix++) {
                w._balls[ix].tick();
                for (var ix2 = 0; ix2 < w._balls.length; ix2++) {
                    if (ix != ix2) {
                        if (w._balls[ix].isCollidingWith(w._balls[ix2])) {
                            if (w._balls[ix].isHorizontallyCollidingWith(w._balls[ix2])) {
                                w._balls[ix].deltaX = -1 * w._balls[ix].deltaX;
                                w._balls[ix2].deltaX = -1 * w._balls[ix2].deltaX;
                            }
                            else if (w._balls[ix].isVerticallyCollidingWith(w._balls[ix2])) {
                                w._balls[ix].deltaY = -1 * w._balls[ix].deltaY;
                                w._balls[ix2].deltaY = -1 * w._balls[ix2].deltaY;
                            }
                            w._balls[ix].deltaR = -1 * Math.abs(w._balls[ix].deltaR);
                            w._balls[ix2].deltaR = -1 * Math.abs(w._balls[ix2].deltaR);
                            w._balls[ix].tick();
                            w._balls[ix2].tick();
                        }
                    }
                }
            }
        };
        BouncingBallWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            var numberOfBalls = 100;
            this._balls = [];
            for (var n = 0; n < numberOfBalls; n++) {
                var r = (20 * Math.random()) + 5, x = Math.random() * (this.contentView.frame.size.width - r), y = Math.random() * (this.contentView.frame.size.height - r), ball = new Ball(x, y, r);
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
    }(red.Window));
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
    }(red.Window));
    var VerticalStackViewWindow = (function (_super) {
        __extends(VerticalStackViewWindow, _super);
        function VerticalStackViewWindow() {
            _super.apply(this, arguments);
        }
        VerticalStackViewWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            this.panel.orientation = red.StackViewOrientation.Vertical;
        };
        return VerticalStackViewWindow;
    }(StackViewWindow));
    var HorizontalStackViewWindow = (function (_super) {
        __extends(HorizontalStackViewWindow, _super);
        function HorizontalStackViewWindow() {
            _super.apply(this, arguments);
        }
        HorizontalStackViewWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            this.panel.orientation = red.StackViewOrientation.Horizontal;
        };
        return HorizontalStackViewWindow;
    }(StackViewWindow));
    var SplitViewWindow = (function (_super) {
        __extends(SplitViewWindow, _super);
        function SplitViewWindow(aRect, splitView) {
            _super.call(this, aRect);
            this.splitView = splitView;
            this.splitView.contentView1.setBackgroundColor(red.colors.red);
            this.splitView.contentView2.setBackgroundColor(red.colors.green);
            this.contentView.addSubview(this.splitView);
            this.applyFrame();
        }
        SplitViewWindow.prototype.applyFrame = function () {
            _super.prototype.applyFrame.call(this);
            if (this.splitView) {
                this.splitView.frame = red.RectMake(0, 0, this.contentView.frame.size.width, this.contentView.frame.size.height);
            }
        };
        return SplitViewWindow;
    }(red.Window));
    var MainWindow = (function (_super) {
        __extends(MainWindow, _super);
        function MainWindow(aRect) {
            _super.call(this, aRect);
            var cv = this.contentView, f = cv.frame, w = f.size.width, h = f.size.height;
            this.hSplitter1 = new red.SplitView(f.sizeOnlyCopy());
            this.contentView.addSubview(this.hSplitter1);
            this.hSplitter1.splitterPosition = (w / 5);
            this.hSplitter2 = new red.SplitView(this.hSplitter1.contentView2.frame.sizeOnlyCopy());
            this.hSplitter2.positionFromEnd = true;
            this.hSplitter1.contentView2.addSubview(this.hSplitter2);
            this.hSplitter2.splitterPosition = this.hSplitter2.frame.size.width - (w / 5);
            this.applyFrame();
        }
        return MainWindow;
    }(red.Window));
    tests_1.MainWindow = MainWindow;
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
    }());
    tests_1.TestController = TestController;
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
                var test_1 = this._tests[ix];
                test_1.window.minimize();
                var button = content.addSubview(new red.PushButton(red.RectMake(m, m + y, content.frame.size.width - (4 * m), h - (2 * m))));
                button.label = test_1.name;
                test_1.window.title = test_1.name;
                //button.element.style.radiusX = button.element.style.radiusY = 5;
                button.action = (function (tc) {
                    return function (e) {
                        tc.showWindow();
                    };
                })(test_1);
            }
            win.applyFrame();
        }
        return TestsController;
    }());
    tests_1.TestsController = TestsController;
    document.addEventListener('DOMContentLoaded', function () {
        var offset = 28, n = -1;
        var bouncy;
        var mainWindow;
        tests_1.tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake((++n) * offset, n * offset, 320, 200))),
            new TestController('Push button', new PushButtonWindow(red.RectMake((++n) * offset, n * offset, 320, 200))),
            new TestController('Vertical StackView', new VerticalStackViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200))),
            new TestController('Horizontal StackView', new HorizontalStackViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200))),
            new TestController('Vertical splitter', new SplitViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200), new red.VerticalSplitView(red.RectMake(0, 0, 300, 200)))),
            new TestController('Horizontal splitter', new SplitViewWindow(red.RectMake((++n) * offset, n * offset, 300, 200), new red.HorizontalSplitView(red.RectMake(0, 0, 300, 200)))),
            new TestController('Bouncy', bouncy = new BouncingBallWindow(red.RectMake((++n) * offset, n * offset, 640, 480))),
        ]);
        bouncy.center();
        //mainWindow.center();
    }, true);
})(tests || (tests = {}));
//# sourceMappingURL=tests.js.map