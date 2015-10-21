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
            //img.autoresizingMask =
            //    red.AutoresizingMask.LockedTop |
            //    red.AutoresizingMask.LockedRight |
            //    red.AutoresizingMask.LockedBottom |
            //    red.AutoresizingMask.LockedLeft;
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

        private deltaX : number;
        private deltaY : number;
        private deltaR : number = 0.5;

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

        public tick() : void {
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
            }
        }

        public init() : void {
            super.init();
            var numberOfBalls = 10;
            this._balls = [];
            for (var n = 0; n < numberOfBalls; n ++) {

                var r = (20 * Math.random()) + 5,
                    x = Math.random() * (this.frame.size.width - r),
                    y = Math.random() * (this.frame.size.height - r),
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

    export class TestController
    {
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
                test = this._tests[ix];
                var button = <red.PushButton>content.addSubview(new red.PushButton(red.RectMake(m, m+y, content.frame.size.width-(4*m), h-(2*m))));
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

            win.orderFront();
        }
    }

    export var tests;

    document.addEventListener('DOMContentLoaded', ()=>{
        var offset = 32, n = -1;

        tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake((++n)*offset, n*offset, 320, 200))),
            new TestController('Push button', new PushButtonWindow(red.RectMake((++n)*offset, n*offset, 320, 200))),
            new TestController('Bouncy', new BouncingBallWindow(red.RectMake((++n)*offset, n*offset, 320, 200))),
            new TestController('VerticalStackView', new VerticalStackViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200))),
            new TestController('HorizontalStackView', new HorizontalStackViewWindow(red.RectMake((++n)*offset, n*offset, 300, 200)))
        ]);
    }, true);
}