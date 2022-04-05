const Timer = {
	start: null,
	end: null,
	interval: null,
	element: null,
	finished: false,

	/*

	    formatTime(90) ==> 1:30
	formatDuration(90) ==> 1 minute and 30 seconds

	*/

	formatTime: (t) => {
		const pad = x => {
			if (x < 10) return `0${x}`;
			return x;
		};
		
		t = Math.max(Math.floor(t), 0);
		return `${Math.floor(t / 60)}:${pad(t % 60)}`;
	},
	formatDuration: (t) => {
		t = Math.max(Math.floor(t), 0);
		const m = Math.floor(t / 60);
		const s = t % 60;

		if (m === 0) return `${s} second${s === 1? "" : "s"}`;
		if (s === 0) return `${m} minute${m === 1? "" : "s"}`;
		return `${m} minute${m === 1? "" : "s"} and ${s} second${s === 1? "" : "s"}`;
	},
	getRemaining: () => (Timer.end - Date.now()) / 1000,
	getElapsed: () => (Date.now() - Timer.start) / 1000,
	start: ({duration, onFinish}) => {
		Timer.element = DOM.createElement({
			type: "p",
			id: "timer",
			classes: ["timer", "card"]
		});
		
		document.body.appendChild(Timer.element);
		
		setTimeout(() => {
			Timer.element.classList.add("visible");
		}, 1000);

		Timer.start = Date.now();
		Timer.end = Date.now() + duration * 1000;
		
		const update = () => {
			const t = Timer.getRemaining();
			if (t <= 0) {
				clearInterval(Timer.interval);
				Timer.finished = true;
				onFinish();
			} else {
				Timer.element.innerHTML = Timer.formatTime(t);
			}
		};
		
		Timer.interval = setInterval(update, 100);
		update();
	},
	stop: () => {
		clearInterval(Timer.interval);
	},
	hide: () => {
		Timer.element.classList.remove("visible");
	}
};
