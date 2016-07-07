let elementStyle = document.createElement('div').style;

let vendor = (() => {
	let transformNames = {
		webkit: 'webkitTransform',
		Moz: 'MozTransform',
		O: 'OTransform',
		ms: 'msTransform',
		standard: 'transform'
	};

	for (let key in transformNames) {
		if (elementStyle[transformNames[key]] !== undefined) {
			return key;
		}
	}

	return false;
})();

function prefixStyle(style) {
	if (vendor === false) {
		return false;
	}

	if (vendor === 'standard') {
		return style;
	}

	return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}

export function addEvent(el, type, fn, capture) {
	el.addEventListener(type, fn, !!capture);
};

export function removeEvent(el, type, fn, capture) {
	el.removeEventListener(type, fn, !!capture);
};

export function offset(el) {
	let left = 0;
	let top = 0;

	while (el) {
		left -= el.offsetLeft;
		top -= el.offsetTop;
		el = el.offsetParent;
	}

	return {
		left,
		top
	};
};

let transform = prefixStyle('transform');

export const hasPerspective = prefixStyle('perspective') in elementStyle;

export const hasTouch = 'ontouchstart' in window;

export const style = {
	transform,
	transitionTimingFunction: prefixStyle('transitionTimingFunction'),
	transitionDuration: prefixStyle('transitionDuration'),
	transitionDelay: prefixStyle('transitionDelay'),
	transformOrigin: prefixStyle('transformOrigin'),
	transitionEnd: prefixStyle('transitionEnd')
};

const TOUCH_EVENT = 1;
export const eventType = {
	touchstart: TOUCH_EVENT,
	touchmove: TOUCH_EVENT,
	touchend: TOUCH_EVENT
};