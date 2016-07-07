export default function (current, start, time, lowerMargin, wrapperSize, options) {
	let distance = current - start;
	let speed = Math.abs(distance) / time;

	let {deceleration, itemHeight, swipeBounceTime, bounceTime} = options;
	let duration = options.swipeTime;

	let destination = current + speed / deceleration * (distance < 0 ? -1 : 1);

	destination = Math.round(destination / itemHeight) * itemHeight;

	if (destination < lowerMargin) {
		destination = wrapperSize ? lowerMargin - (wrapperSize / 4 * speed) : lowerMargin;
		duration = swipeBounceTime - bounceTime;
	} else if (destination > 0) {
		destination = wrapperSize ? wrapperSize / 4 * speed : 0;
		duration = swipeBounceTime - bounceTime;
	}

	return {
		destination: Math.round(destination),
		duration
	};
};