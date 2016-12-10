/// <reference path="ui.ts"/>

module tests
{
    class ScrollViewWindow extends red.Window {
        private scrollView:red.ScrollView;
        constructor(aRect:red.Rect) {
            super(aRect);
            this.autoresizesSubviews = false;
            this.scrollView = new red.ScrollView(this.contentView.frame);
            this.contentView.addSubview(this.scrollView);
            this.contentView.autoresizesSubviews = false;
            var img = this.scrollView.contentView.addSubview(new red.View(red.RectMake(0,0,1920, 1200)));
            img.setBackgroundImage('img/mountains.jpg');
            this.applyFrame();
        }

        public applyFrame() : void {
            super.applyFrame();
            if (this.contentView && this.scrollView) {
                this.scrollView.frame = red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            }
        }
    }

    class PushButtonWindow extends red.Window {
        public button : red.PushButton;

        public init() : void {
            super.init();
            this.button = <red.PushButton>this.contentView.addSubview(new red.PushButton(red.RectMake(32, 32, 100, 20)));
            this.button.label = 'Hello, World!';
            this.autoresizesSubviews = true;
        }
    }

    class Ball extends red.View {

        public deltaX : number;
        public deltaY : number;
        public deltaR : number = 0.1;
        public boost : number = 1.00;

        private x : number;
        private y : number;
        private r : number;

        private minRadius;
        private maxRadius;

        constructor(x:number, y:number, r:number) {
            super(red.RectMakeZero());
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

        public isCollidingWith(other:red.View) : boolean {
            return this.frame.intersects(other.frame);
        }

        public isHorizontallyCollidingWith(other:Ball) : boolean {
            return  (this.x + this.r) >= (other.x - other.r) &&
                    (this.x - this.r) <= (other.x + other.r);
        }

        public isVerticallyCollidingWith(other:Ball) : boolean {
            return  (this.y + this.r) >= (other.y - other.r) &&
                    (this.y - this.r) <= (other.y + other.r);
        }

        public tick() : void {
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
            if (this.boost > 2) this.boost = 2;
            this.r += this.deltaR;

            this.applyPosition();
        }

        public applyPosition() : void {
            this.frame = this.makeRect(this.x, this.y, this.r);
            this.applyFrame();
        }

        public makeRect(x, y, r) : red.Rect {
            return red.RectMake(x - r, y - r, 2 * r, 2 * r);
        }
    }

    class BouncingBallWindow extends red.Window {

        public _balls : Array<Ball>;

        public tick(w) : void {
            for (var ix = 0; ix < w._balls.length; ix ++) {
                w._balls[ix].tick();
                for (var ix2 = 0; ix2 < w._balls.length; ix2 ++) {
                    if (ix != ix2) {
                        if (w._balls[ix].isCollidingWith(w._balls[ix2])) {
                            if (w._balls[ix].isHorizontallyCollidingWith(w._balls[ix2])) {
                                w._balls[ix].deltaX = -1 * w._balls[ix].deltaX;
                                w._balls[ix2].deltaX = -1 * w._balls[ix2].deltaX;
                            } else if (w._balls[ix].isVerticallyCollidingWith(w._balls[ix2])) {
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
        }

        public init() : void {
            super.init();
            var numberOfBalls = 100;
            this._balls = [];
            for (var n = 0; n < numberOfBalls; n ++) {

                var r = (20 * Math.random()) + 5,
                    x = Math.random() * (this.contentView.frame.size.width - r),
                    y = Math.random() * (this.contentView.frame.size.height - r),
                    ball = new Ball(x, y, r);
                this._balls.push(ball);
                this.contentView.addSubview(<red.View>ball);
            }

            var update = ((w:BouncingBallWindow) => {
                return () => {
                    w.tick(w);
                };
            })(this);
            setInterval(update, 25);
        }
    }

    class StackViewWindow extends red.Window {
        public panel : red.StackView;
        public init() : void {
            super.init();

            this.panel = new red.StackView(red.RectMake(0, 0, this.frame.size.width, this.contentView.frame.size.height));
            this.contentView.addSubview((this.panel));
            for(var key in red.colors) {
                if (red.colors.hasOwnProperty(key)) {
                    var color = red.colors[key];

                    var view = new red.View(red.RectMakeZero());
                    this.panel.addSubView(view);
                    view.setBackgroundColor(color);
                }
            }
        }

        public applyFrame() : void {
            this.panel.frame = red.RectMake(0, 0, this.contentView.frame.size.width, this.contentView.frame.size.height);
            super.applyFrame();
        }
    }

    class VerticalStackViewWindow extends StackViewWindow {
        public init() : void {
            super.init();
            this.panel.orientation = red.StackViewOrientation.Vertical;
        }
    }

    class HorizontalStackViewWindow extends StackViewWindow {
        public init() : void {
            super.init();
            this.panel.orientation = red.StackViewOrientation.Horizontal;
        }
    }

    class SplitViewWindow extends red.Window {
        public splitView:red.SplitView;

        constructor(aRect:red.Rect, splitView:red.SplitView) {
            super(aRect);
            this.splitView = splitView;
            this.splitView.contentView1.setBackgroundColor(red.colors.red);
            this.splitView.contentView2.setBackgroundColor(red.colors.green);
            this.contentView.addSubview(this.splitView);
            this.applyFrame();
        }

        applyFrame() : void {
            super.applyFrame();
            if (this.splitView) {
                this.splitView.frame = red.RectMake(0, 0, this.contentView.frame.size.width, this.contentView.frame.size.height);
            }
        }
    }


    export class MainWindow extends red.Window  {
        private navigationView:red.View;
        private inspectorView:red.View;

        private hSplitter1:red.SplitView;
        private hSplitter2:red.SplitView;
        private vSplitter1:red.SplitView;
        private vSplitter2:red.SplitView;

        constructor(aRect:red.Rect) {
            super(aRect);

            var cv = this.contentView,
                f = cv.frame,
                w = f.size.width,
                h = f.size.height;

            this.hSplitter1 = new red.SplitView(f.sizeOnlyCopy());
            this.contentView.addSubview(this.hSplitter1);
            this.hSplitter1.splitterPosition = (w / 5);

            this.hSplitter2 = new red.SplitView(this.hSplitter1.contentView2.frame.sizeOnlyCopy());
            this.hSplitter2.positionFromEnd = true;
            this.hSplitter1.contentView2.addSubview(this.hSplitter2);
            this.hSplitter2.splitterPosition = this.hSplitter2.frame.size.width - (w / 5);

            this.applyFrame();
        }
    }

    export class TestController {
        private _name:string;
        public get name():string {
            return this._name;
        }
        public set name(value:string) {
            this._name = value;
        }

        private _window:red.Window;
        public get window():red.Window {
            return this._window;
        }
        public set window(value:red.Window) {
            this._window = value;
        }

        public showWindow() : void {
            this._window.orderFront();
        }

        constructor(name:string, window:any) {
            this.name = name;
            this.window = window;

            red.application.windowManager.addWindow(this.window);
        }
    }

    export class TestsController  {
        private _window:red.Window;
        private _tests:Array<TestController> = [];

        constructor(tests:Array<TestController>) {
            this._tests = tests;

            var win = this._window = new red.Window(red.RectMake(0, 0, 200, 300)),
                content = win.contentView.addSubview(new red.ScrollView(win.frame.copy())),
                y = 0, h = 32, test, m = 4;
            win.title = 'Tests';
            win.frame.origin.x = win.parentView.frame.size.width - win.frame.size.width;
            win.applyFrame();

            for (var ix = 0; ix < this._tests.length; ix ++) {
                y = ix * h;
                let test = <TestController>this._tests[ix];
                test.window.minimize();

                let button = <red.PushButton>content.addSubview(new red.PushButton(red.RectMake(m, m+y, content.frame.size.width-(4*m), h-(2*m))));
                button.label = test.name;

                test.window.title = test.name;
                //button.element.style.radiusX = button.element.style.radiusY = 5;
                button.action = (
                    (tc:TestController) => {
                        return (e:MouseEvent) => {
                            tc.showWindow();
                        };
                    })(test);
            }
            win.applyFrame();
        }
    }

    export var tests;

    document.addEventListener('DOMContentLoaded', ()=>{
        var offset = 28, n = -1;
        var bouncy:BouncingBallWindow;
        var mainWindow:MainWindow;

        tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake((++n)*offset, n*offset, 320, 200))),
            new TestController('Push button', new PushButtonWindow(red.RectMake((++n)*offset, n*offset, 320, 200))),
            new TestController('Vertical StackView', new VerticalStackViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200))),
            new TestController('Horizontal StackView', new HorizontalStackViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200))),
            new TestController('Vertical splitter', new SplitViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200), new red.VerticalSplitView(red.RectMake(0, 0, 300, 200)))),
            new TestController('Horizontal splitter', new SplitViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200), new red.HorizontalSplitView(red.RectMake(0, 0, 300, 200)))),
            new TestController('Bouncy', bouncy = new BouncingBallWindow(red.RectMake((++n)*offset, n*offset, 640, 480))),
            // new TestController('MainWindow', mainWindow = new MainWindow(red.RectMake((++n)*offset, n*offset, 640, 480))),
        ]);
        bouncy.center();
        //mainWindow.center();
    }, true);
}