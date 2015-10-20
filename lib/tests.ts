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

    class BouncingBallWindow extends red.Window {
        public fx:number = 2;
        public fy:number = 2;
        public ball:HTMLElement;
        public radius:number = 10;
        public ballX:number = 20;
        public ballY:number = 20;

        public applyBall() : void {
            this.ball.style.top = (this.ballY - this.radius) + 'px';
            this.ball.style.left = (this.ballX - this.radius) + 'px';
        }

        public tick() : void {
            if (this.ballX + this.fx + this.radius > this.contentView.frame.size.width) {
                this.fx = -1 * this.fx;
            }
            if (this.ballY + this.fy + this.radius > this.contentView.frame.size.height) {
                this.fy = -1 * this.fy;
            }
            if (this.ballX + this.fx - this.radius < 0) {
                this.fx = -1 * this.fx;
            }
            if (this.ballY + this.fy - this.radius < 0) {
                this.fy = -1 * this.fy;
            }

            this.ballX += this.fx;
            this.ballY += this.fy;

            this.ball.style.width  = (2 * this.radius)+'px';
            this.ball.style.height = (2 * this.radius)+'px';

            this.title = (this.ballX + ', ' + this.ballY);

            this.applyBall();
        }

        public init() : void {
            this.ball = this.element.ownerDocument.createElement('div');
            this.ball.style.position = 'absolute';
            this.ball.setAttribute('class', 'BouncingBall');

            var update = ((w:BouncingBallWindow) => {
                return () => {
                    w.tick();
                };
            })(this);

            super.init();

            this.ballX = (this.frame.size.width / 2) - this.radius;
            this.ballY = (this.frame.size.height / 2) - this.radius;
            this.contentView.element.appendChild(this.ball);
            setInterval(update, 25);
        }
    }

    class StackViewTest extends red.Window {
        private panel : red.StackView;
        public init() : void {
            super.init();

            this.panel = new red.StackView(red.RectMake(0, 0, this.frame.size.width, this.frame.size.height));
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
            this.panel.frame = red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            super.applyFrame();
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
        tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake(0, 0, 320, 200))),
            new TestController('Push button', new PushButtonWindow(red.RectMake(20, 20, 320, 200))),
            new TestController('Bouncy', new BouncingBallWindow(red.RectMake(40, 40, 320, 200))),
            new TestController('StackView', new StackViewTest(red.RectMake(60, 60, 300, 200)))
        ]);
    }, true);
}