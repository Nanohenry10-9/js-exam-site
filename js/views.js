const Views = {
	index: 0,

	_update: () => {
		Views.list.forEach((view, index) => {
			if (index === 0) {
				view.style.top = `${-Views.index * 100}%`;
				view.style.left = "0";
			} else if (index === Views.list.length - 1) {
				view.style.top = `${((Views.list.length - 1) - Views.index) * 100}%`;
				view.style.left = "0";
			} else {
				view.style.top = `${(Views.index === 0? 1 : (Views.index === Views.list.length - 1? -1 : 0)) * 100}%`;
				view.style.left = `${(index - Math.clamp(Views.index, 1, Views.list.length - 2)) * 100}%`;
			}
		});
		if (Views.onChangeHandler) {
			Views.onChangeHandler(Views.index);
		}
	},
	next: () => {
		if (Views.index === Views.list.length - 1) return;
		Views.index++;
		Views._update();
	},
	last: () => {
		Views.index = Views.list.length - 1;
		Views._update();
	},
	jumpTo: destination => {
		Views.index = destination;
		Views._update();
	},
	show: ({onChange}) => {
		Views.onChangeHandler = onChange;

		const container = document.getElementById("view-container");
		container.innerHTML = "";

		Views.list.forEach((view, index) => {
			view.style.position = "absolute";
			container.appendChild(view);
		});

		Views._update();
		
		Editors.create();
	},
	
	list: [
		DOM.createElement({
			type: "div",
			id: "welcome-view",
			classes: ["view"],
			children: [
				DOM.createElement({
					type: "div",
					classes: ["view-content", "card"],
					children: [
						DOM.createElement({
							type: "p",
							classes: ["view-title"],
							children: ["Welcome!"]
						}),
						DOM.createElement({
							type: "p",
							classes: ["view-instructions"],
							children: ["Please enter your name."]
						}),
						DOM.createElement({
							type: "input",
							id: "name-input",
							classes: ["view-text-input"],
							extraAttrs: {
								type: "text",
								placeholder: "Name",
								tabindex: "-1"
							}
						}),
						DOM.createElement({
							type: "p",
							classes: ["view-instructions", "justified"],
							children: [`You will have <b>5 minutes</b> to complete this exam, which consists of <b>${Questions.generators.length} questions</b>. Once you have moved onto a new question, you cannot go back. Answers will only be checked at the end.`],
						}),
						DOM.createElement({
							type: "p",
							children: ["Good luck!"]
						}),
						DOM.createElement({
							type: "div",
							classes: ["button"],
							children: ["Begin exam"],
							handlers: {
								click: () => Views.next()
							}
						})
					]
				})
			]
		}),
		...Questions.generateViews(),
		DOM.createElement({
			type: "div",
			id: "finish-view",
			classes: ["view"],
			children: [
				DOM.createElement({
					type: "div",
					classes: ["view-content", "card"],
					children: [
						DOM.createElement({
							type: "p",
							id: "result-title",
							classes: ["view-title"]
						}),
						DOM.createElement({
							type: "div",
							id: "results",
							children: [
								DOM.createElement({
									type: "div",
									id: "result-box",
									children: [
										DOM.createElement({
											type: "div",
											classes: ["result-box-element"],
											children: [
												DOM.createElement({
													type: "p",
													classes: ["result-box-title"],
													children: ["Completion time"]
												}),
												DOM.createElement({
													type: "p",
													id: "result-time",
													classes: ["result-box-content"],
													children: ["123"]
												}),
												DOM.createElement({
													type: "p",
													id: "result-time-subtitle",
													classes: ["result-box-subtitle"],
													children: ["Good!"]
												})
											]
										}),
										DOM.createElement({
											type: "div",
											classes: ["result-box-element"],
											children: [
												DOM.createElement({
													type: "p",
													classes: ["result-box-title"],
													children: ["Score"]
												}),
												DOM.createElement({
													type: "p",
													id: "result-score",
													classes: ["result-box-content"],
													children: ["123"]
												}),
												DOM.createElement({
													type: "p",
													id: "result-score-subtitle",
													classes: ["result-box-subtitle"],
													children: ["2 / 6"]
												})
											]
										})
									]
								}),
								DOM.createElement({
									type: "div",
									id: "result-table-container",
									children: []
								})
							]
						})
					]
				})
			]
		}),
	]
};
