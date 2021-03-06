import { Component, Input, Output, EventEmitter } from '@angular/core';
var isEqual = require('lodash.isequal');
/*
  *
  * @param() items - List of items to belong in carousel
  * @param() width - Size of window(view) to show
  * @param() $prev - Template for previous button
  * @param() $next - Template for next button
  * @param() $item - Template for the item
*/
var Ng2Carouselamos = (function () {
    function Ng2Carouselamos() {
        this.items = [];
        this.width = 500;
        this.onSelectedItem = new EventEmitter();
        this.childIndex = 0;
        this.amount = 0;
        this.startPress = 0;
        this.lastX = 0;
    }
    
    Ng2Carouselamos.prototype.onMousedown = function (e) {
        if (e.which === 1) {
            this.startPress = e.clientX;
            this.lastX = this.amount;
        }
    };
    Ng2Carouselamos.prototype.onTouchdown = function (e) {
        if (navigator.userAgent.indexOf('Android') >= 0)
            e.preventDefault();
        this.startPress = e.targetTouches[0].clientX;
        this.lastX = this.amount;
    };
    Ng2Carouselamos.prototype.onMousemove = function (e, maxWidth) {
        if (e.which === 1) {
            var amount = this.lastX - (this.startPress - e.clientX);
            if (amount > 0 || amount < -(maxWidth - this.width))
                return;
            this.amount = amount;
        }
    };
    Ng2Carouselamos.prototype.onTouchmove = function (e, maxWidth) {
        if (navigator.userAgent.indexOf('Android') >= 0)
            e.preventDefault();
        var amount = this.lastX - (this.startPress - e.targetTouches[0].clientX);
        if (amount > 0 || amount < -(maxWidth - this.width))
            return;
        this.amount = amount;
    };
    Ng2Carouselamos.prototype.onMouseup = function (e, elem) {
        if (e.which === 1) {
            this.startPress = 0;
            this.snap(elem);
        }
    };
    Ng2Carouselamos.prototype.onTouchup = function (e, elem) {
        if (navigator.userAgent.indexOf('Android') >= 0)
            e.preventDefault();
        this.startPress = 0;
        this.snap(elem);
    };
    Ng2Carouselamos.prototype.snap = function (elem) {
        var counter = 0;
        var lastVal = 0;
        for (var i = 0; i < this.items.length; i++) {
            var el = elem.children[i];
            var style = el.currentStyle || window.getComputedStyle(el);
            counter += el.offsetWidth + (parseFloat(style.marginLeft) + parseFloat(style.marginRight));
            if (this.amount <= lastVal && this.amount >= -counter) {
                this.amount = -lastVal;
                this.childIndex = i;
                this.onSelectedItem.emit({ item: this.items[this.childIndex], index: this.childIndex, first: false });
                return;
            }
            lastVal = counter;
        }
        return counter;
    };
    Ng2Carouselamos.prototype.scroll = function (forward, elem) {
        this.childIndex += forward ? 1 : -1;
        this.onSelectedItem.emit({ item: this.items[this.childIndex], index: this.childIndex, first: false });
        this.amount = -(this.calcScroll(elem));
    };
    Ng2Carouselamos.prototype.calcScroll = function (elem) {
        var counter = 0;
        for (var i = this.childIndex - 1; i >= 0; i--) {
            var el = elem.children[i];
            var style = el.currentStyle || window.getComputedStyle(el);
            counter += el.offsetWidth + (parseFloat(style.marginLeft) + parseFloat(style.marginRight));
        }
        return counter;
    };
    Ng2Carouselamos.prototype.ngOnChanges = function (changes) {
        if (changes.items && !isEqual(changes.items.previousValue, changes.items.currentValue)) {
            if (changes.items.firstChange) {
                this.onSelectedItem.emit({ item: this.items[this.childIndex], index: this.childIndex, first: true });
            }
            this.amount = 0;
        }
    };
    return Ng2Carouselamos;
}());
export { Ng2Carouselamos };
Ng2Carouselamos.decorators = [
    { type: Component, args: [{
                selector: '[ng2-carouselamos]',
                styles: ["\n    .ng2-carouselamos-container{position:relative;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.ng2-carouselamos-wrapper{overflow:hidden}.ng2-carouselamos{display:-webkit-box;display:-ms-flexbox;display:flex;transition:transform 1s, -webkit-transform 1s}.controls{pointer-events:none;position:absolute;display:-webkit-box;display:-ms-flexbox;display:flex;width:100%;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;top:50%;left:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.controls button{pointer-events:all;background:transparent;border:0}\n  "],
                template: "\n    <div class=\"ng2-carouselamos-container\">\n      <div\n        class=\"ng2-carouselamos-wrapper\"\n        [style.width]=\"width + '%'\"\n        (mousedown)=\"onMousedown($event)\"\n        (touchstart)=\"onTouchdown($event)\"\n        (mousemove)=\"onMousemove($event, list.scrollWidth)\"\n        (touchmove)=\"onTouchmove($event, list.scrollWidth)\"\n        (mouseup)=\"onMouseup($event, list)\"\n        (mouseleave)=\"onMouseup($event, list)\"\n        (touchend)=\"onTouchup($event, list)\"\n      >\n        <div\n          class=\"ng2-carouselamos\"\n          [attr.startPress]=\"startPress\"\n          [style.transition]=\"startPress > 0 ? 'none' : '-webkit-transform 1s'\"\n          [style.webkitTransition]=\"startPress > 0 ? 'none' : '-webkit-transform 1s'\"\n          [style.transform]=\"'translateX('+amount+'px)'\"\n          [style.webkitTransform]=\"'translateX('+amount+'px)'\"\n          #list\n        >\n          <ng-template\n            *ngFor=\"let item of items; let i = index\"\n            [ngTemplateOutlet]=\"$item\"\n            [ngTemplateOutletContext]=\"{$implicit: item, index: i, selectedIndex: childIndex}\"\n          ></ng-template>\n        </div>\n      </div>\n      <div\n        class=\"controls\"\n        *ngIf=\"$prev || $next\"\n      >\n        <button\n          type=\"button\"\n          *ngIf=\"$prev\"\n          (click)=\"scroll(false, list)\"\n          [disabled]=\"amount >= 0\"\n        >\n          <ng-template\n            [ngTemplateOutlet]=\"$prev\"\n          ></ng-template>\n        </button>\n        <button\n          type=\"button\"\n          *ngIf=\"$next\"\n          (click)=\"scroll(true, list)\"\n          [disabled]=\"amount <= -(list.scrollWidth-width)\"\n        >\n            <ng-template\n              [ngTemplateOutlet]=\"$next\"\n            ></ng-template>\n        </button>\n      </div>\n    </div>\n  "
            },] },
];
/** @nocollapse */
Ng2Carouselamos.ctorParameters = function () { return []; };
Ng2Carouselamos.propDecorators = {
    'items': [{ type: Input },],
    'width': [{ type: Input },],
    '$prev': [{ type: Input },],
    '$next': [{ type: Input },],
    '$item': [{ type: Input },],
    'onSelectedItem': [{ type: Output },],
};
//# sourceMappingURL=ng2-carouselamos.component.js.map