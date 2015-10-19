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
            img.autoresizingMask =
                red.AutoresizingMask.LockedTop |
                red.AutoresizingMask.LockedRight |
                red.AutoresizingMask.LockedBottom |
                red.AutoresizingMask.LockedLeft;
            img.setBackgroundImage('img/mountains.jpg');
        }

        public applyFrame() : void {
            super.applyFrame();
            if (this.contentView && this.scrollView) {
                this.scrollView.frame = red.RectMake(0, 0, this.frame.size.width, this.frame.size.height);
            }
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

    export class TestsController
    {
        private _window:red.Window;
        private _tests:Array<TestController> = [];

        constructor(tests:Array<TestController>) {
            this._tests = tests;

            var win = new red.Window(red.RectMake(0, 0, 200, 300)),
                content = win.contentView.addSubview(new red.ScrollView(win.frame.copy())),
                y = 0, h = 32, test;

            for (var ix = 0; ix < this._tests.length; ix ++) {
                y = ix * h;
                test = this._tests[ix];
                var button = content.addSubview(new red.View(red.RectMake(0, y, content.frame.size.width, y + h)));
                button.element.innerText = test.name;
                button.element.style.outline = 'solid 2px gray';
                test.window.title = test.name;
                //button.element.style.radiusX = button.element.style.radiusY = 5;
                button.element.addEventListener('click', (
                    (tc:TestController) => {
                        return (e:MouseEvent) => {
                            alert('foo');
                            setTimeout(function() {
                                tc.showWindow();
                            }, 10);
                        };
                    }
                )(test), true);
            }

            red.application.windowManager.addWindow(win);
            win.orderFront();
        }
    }

    export var tests;
    document.addEventListener('DOMContentLoaded', ()=>{
        tests = new TestsController([
            new TestController('ScrollView', new ScrollViewWindow(red.RectMake(0, 0, 320, 200)))
        ]);
    }, true);
}