window.addEventListener("load", () => {
	Views.show({
		onChange: viewIndex => {
			if (viewIndex === 1) {
				Timer.start({
					duration: 5 * 60,
					onFinish: () => {
						Views.last();
					}
				});
			} else if (viewIndex === Views.list.length - 1) {
				Timer.stop(); Timer.hide();
				
				document.getElementById("result-title").innerHTML = `Here's how you did, ${document.getElementById("name-input").value}...`;

				const score = Questions.getScore();
				const timeSpent = Timer.getElapsed();

				document.getElementById("result-score").innerHTML = score.score;
				document.getElementById("result-score-subtitle").innerHTML = `${score.points} / ${score.total}`;
				document.getElementById("result-time").innerHTML = Timer.formatTime(timeSpent);
				document.getElementById("result-time-subtitle").innerHTML = timeSpent < 60? "Excellent!" : (timeSpent < 2 * 60? "Good!" : (timeSpent < 4 * 60? "OK." : "Could be faster!"));
				document.getElementById("result-table-container").appendChild(Questions.generateResultTable());

				Highlighter.highlightAll();
			}
		}
	});

	Highlighter.highlightAll();
});
