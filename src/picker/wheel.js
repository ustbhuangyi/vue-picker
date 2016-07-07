import {
	EventEmitter,
	hasPerspective,
	hasTouch,
	eventType,
	style,
	isBadAndroid,
	ease,
	offset,
	addEvent,
	removeEvent
} from '../util';

import momentum from './momentum';

const TOUCH_EVENT = 1;

export default class Wheel extends EventEmitter {
	constructor(el, options) {
		super();
		this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.querySelector('.wheel-scroll');
		this.items = this.wrapper.querySelectorAll('.wheel-item');
		this.scrollerStyle = this.scroller.style;

		this.options = {
			selectedIndex: 0,
			rotate: 25,
			swipeTime: 2500,
			bounceTime: 700,
			adjustTime: 400,
			swipeBounceTime: 1200,
			resizePolling: 60,
			deceleration: 0.001,
			momentumLimitTime: 300,
			momentumLimitDistance: 15
		};

		Object.assign(this.options, options);

		this.translateZ = hasPerspective ? ' translateZ(0)' : '';

		this._init();

		this.refresh();

		this.scrollTo(this.y);

		this.enable();
	}

	_init() {
		this._addEvents();
	}

	_addEvents() {
		let eventOperation = addEvent;
		this._handleEvents(eventOperation);
	}

	_removeEvents() {
		let eventOperation = removeEvent;
		this._handleEvents(eventOperation);
	}

	_handleEvents(eventOperation) {
		let target = this.options.bindToWrapper ? this.wrapper : window;

		eventOperation(window, 'orientationchange', this);
		eventOperation(window, 'resize', this);

		if (this.options.click) {
			eventOperation(this.wrapper, 'click', this, true);
		}

		if (hasTouch) {
			eventOperation(this.wrapper, 'touchstart', this);
			eventOperation(target, 'touchmove', this);
			eventOperation(target, 'touchcancel', this);
			eventOperation(target, 'touchend', this);
		}

		eventOperation(this.scroller, style.transitionEnd, this);
	}

	_start(e) {
		let _eventType = eventType[e.type];
		if (_eventType !== TOUCH_EVENT) {
			return;
		}

		if (!this.enabled || (this.initiated && this.initiated !== _eventType)) {
			return;
		}

		this.initiated = _eventType;

		if (isBadAndroid) {
			e.preventDefault();
		}

		this.moved = false;
		this.distY = 0;
		this._transitionTime();
		this.startTime = +new Date();
		this.target = e.target;

		if (this.isInTransition) {
			this.isInTransition = false;
			let pos = this.getComputedPosition();
			this._translate(Math.round(pos.y));
			this.target = this.items[Math.round(-pos.y / this.itemHeight)];
		}

		let point = e.touches ? e.touches[0] : e;
		this.startY = this.y;
		this.pointY = point.pageY;

		this.trigger('beforeScrollStart');
	}

	_move(e) {
		if (!this.enabled || eventType[e.type] !== this.initiated) {
			return;
		}

		if (this.options.preventDefault) {
			e.preventDefault();
		}

		let point = e.touches ? e.touches[0] : e;
		let deltaY = point.pageY - this.pointY;
		this.pointY = point.pageY;
		this.distY += deltaY;

		let absDistY = Math.abs(this.distY);
		let timestamp = +new Date();
		// We need to move at least 15 pixels for the scrolling to initiate
		if (timestamp - this.startTime > this.options.momentumLimitTime && (absDistY < this.options.momentumLimitDistance)) {
			return;
		}

		let newY = this.y + deltaY;
		// Slow down if outside of the boundaries
		if (newY > 0 || newY < this.maxScrollY) {
			newY = this.y + deltaY / 3;
		}

		if (!this.moved) {
			this.moved = true;
			this.trigger('scrollStart');
		}

		this._translate(newY);

		if (timestamp - this.startTime > this.options.momentumLimitTime) {
			this.startTime = timestamp;
			this.startY = this.y;
		}

		let scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
		let pY = this.pointY - scrollTop;
		if (pY < this.options.momentumLimitDistance || pY > document.documentElement.clientHeight - this.options.momentumLimitDistance) {
			this._end(e);
		}
	}

	_end(e) {
		if (!this.enabled || eventType[e.type] !== this.initiated) {
			return;
		}
		this.initiated = false;

		e.preventDefault();
		// reset if we are outside of the boundaries
		if (this.resetPosition(this.options.bounceTime, ease.bounce)) {
			return;
		}

		// ensures that the last position is rounded
		let newY = Math.round(this.y);
		let absDistY = Math.abs(newY - this.startY);
		let easing = ease.swipe;
		let time = 0;
		// we scrolled less than 15 pixels
		if (!this.moved) {
			time = this.options.adjustTime;
			if (this.target.className === 'wheel-scroll') {
				let index = Math.abs(Math.round(newY / this.itemHeight));
				let _offset = Math.round((this.pointY + offset(this.target).top - this.itemHeight / 2) / this.itemHeight);
				this.target = this.items[index + _offset];
			}
			this.scrollToElement(this.target, time, easing);

			this.trigger('scrollCancel');

			return;
		}

		this.isInTransition = false;
		this.endTime = +new Date();
		this.scrollTo(newY);

		let duration = this.endTime - this.startTime;
		// start momentum animation if needed
		if (duration < this.options.momentumLimitTime && absDistY > this.options.momentumLimitDistance) {
			let momentumY = momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight, this.options);
			newY = momentumY.destination;
			time = momentumY.duration;
		} else {
			newY = Math.round(newY / this.itemHeight) * this.itemHeight;
			time = this.options.adjustTime;
		}

		if (newY !== this.y) {
			// change easing function when scroller goes out of the boundaries
			if (newY > 0 || newY < this.maxScrollY) {
				easing = ease.swipeBounce;
			}
			this.scrollTo(newY, time, easing);
			return;
		}

		this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0;
		this.trigger('scrollEnd');
	}

	_resize() {
		if (!this.enabled) {
			return;
		}

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(() => {
			this.refresh();
		}, this.options.resizePolling);
	}

	_transitionTime(time = 0) {
		this.scrollerStyle[style.transitionDuration] = time + 'ms';

		if (!isBadAndroid) {
			for (let i = 0; i < this.itemLen; i++) {
				this.items[i].style[style.transitionDuration] = time + 'ms';
			}
		}

		if (!time && isBadAndroid) {
			this.scrollerStyle[style.transitionDuration] = '0.001s';

			if (!isBadAndroid) {
				for (let i = 0; i < this.itemLen; i++) {
					this.items[i].style[style.transitionDuration] = '0.001s';
				}
			}
		}
	}

	_transitionTimingFunction(easing) {
		this.scrollerStyle[style.transitionTimingFunction] = easing;

		if (!isBadAndroid) {
			for (let i = 0; i < this.itemLen; i++) {
				this.items[i].style[style.transitionTimingFunction] = easing;
			}
		}
	}

	_transitionEnd(e) {
		if (e.target !== this.scroller || !this.isInTransition) {
			return;
		}

		this._transitionTime();
		if (!this.resetPosition(this.options.bounceTime, ease.bounce)) {
			this.isInTransition = false;
			this.trigger('scrollEnd');
		}
	}

	_translate(y) {
		this.scrollerStyle[style.transform] = 'translateY(' + y + 'px)' + this.translateZ;

		if (!isBadAndroid) {
			for (let i = 0; i < this.itemLen; i++) {
				let deg = this.options.rotate * (y / this.itemHeight + i);
				this.items[i].style[style.transform] = 'rotateX(' + deg + 'deg)';
			}
		}

		this.y = y;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	refresh() {
		// force reflow
		/* eslint-disable no-unused-vars */
		let rf = this.wrapper.offsetHeight;

		this.wrapperHeight = parseInt(this.wrapper.style.height) || this.wrapper.clientHeight;
		this.items = this.wrapper.querySelectorAll('.wheel-item');
		this.options.itemHeight = this.itemHeight = this.items.length ? this.items[0].clientHeight : 0;
		this.selectedIndex = this.options.selectedIndex;
		this.y = -this.selectedIndex * this.itemHeight;
		this.itemLen = this.items.length;
		this.maxScrollY = -this.itemHeight * (this.itemLen - 1);
		this.endTime = 0;
		this.scrollOffset = offset(this.scroller);

		this.trigger('refresh');

		this.resetPosition();
	}

	resetPosition(time = 0, easeing = ease.bounce) {
		let y = this.y;

		if (y > 0) {
			y = 0;
		} else if (y < this.maxScrollY) {
			y = this.maxScrollY;
		}

		if (y === this.y) {
			return false;
		}

		this.scrollTo(y, time, easeing);

		return true;
	}

	goTo(selectIndex) {
		this.y = -selectIndex * this.itemHeight;
		this.scrollTo(this.y);
	}

	scrollTo(y, time, easing = ease.bounce) {
		this.isInTransition = time > 0 && this.y !== y;

		this._transitionTimingFunction(easing.style);
		this._transitionTime(time);
		this._translate(y);

		if (y > 0) {
			this.selectedIndex = 0;
		} else if (y < this.maxScrollY) {
			this.selectedIndex = this.itemLen - 1;
		} else {
			this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0;
		}
	}

	scrollToElement(el, time, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if (!el || el.className !== 'wheel-item') {
			return;
		}

		let pos = offset(el);
		pos.top -= this.scrollOffset.top;
		if (pos.top > 0 || pos.top < this.maxScrollY) {
			return;
		}
		pos.top = Math.round(pos.top / this.itemHeight) * this.itemHeight;

		this.scrollTo(pos.top, time, easing);
	}

	getComputedPosition() {
		let matrix = window.getComputedStyle(this.scroller, null);
		matrix = matrix[style.transform].split(')')[0].split(', ');
		let x = +(matrix[12] || matrix[4]);
		let y = +(matrix[13] || matrix[5]);

		return {
			x,
			y
		};
	}

	getSelectedIndex() {
		return this.selectedIndex;
	}

	destroy() {
		this._removeEvents();

		this.trigger('destroy');
	}

	handleEvent(e) {
		switch (e.type) {
			case 'touchstart':
				this._start(e);
				break;
			case 'touchmove':
				this._move(e);
				break;
			case 'touchend':
			case 'touchcancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'click':
				if (!e._constructed) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};
