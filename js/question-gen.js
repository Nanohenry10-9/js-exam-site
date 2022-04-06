const Sandbox = {
	wrap: (code, ret, customWindow) => `"use strict";return(function(window,console,alert,location,document){${code};if(typeof ${ret}==="undefined"){return null}return ${ret}})`,
	run: (code, ret, customWindow) => {
		try {
			return {
				error: false,
				value: new Function(Sandbox.wrap(code, ret, {}))()(customWindow, customWindow.console, customWindow.alert, customWindow.location, customWindow.document)
			};
		} catch (e) {
			return {
				error: true,
				value: e.name,
				fullError: e.name? `${e.name}: ${e.message}` : null
			};
		}
	}
};

const Questions = {
	generators: [
		() => {
			const options = [
				"A container to store numbers, text, and many other things.",
				"An unknown value that needs to be solved from an equation.",
				"An element on a webpage that can be modified by the user."
			];

			return {
				type: "multichoice",
				prompt: "What is a variable in the context of JavaScript?",
				options: Array.shuffle(options),
				solution: options[0],
				check: answer => ({
					actual: answer,
					expected: options[0],
					correct: answer === options[0]
				})
			};
		},
		() => {
			const options = [
				"It can be used to separate statements, but it's not always mandatory.",
				"It separates elements in an array.",
				"It is needed at the end of each line."
			];

			return {
				type: "multichoice",
				prompt: "What is the role of <span class= \"code\">;</span> in JavaScript?",
				options: Array.shuffle(options),
				solution: options[0],
				check: answer => ({
					actual: answer,
					expected: options[0],
					correct: answer === options[0]
				})
			};
		},
		() => {
			const options = [
				"<span class= \"code\">==</span> will first convert the compared values to comparable types, while <span class= \"code\">===</span> will compare them directly.",
				"<span class= \"code\">===</span> performs comparison, while <span class= \"code\">==</span> performs assignment.",
				"There is no difference."
			];
			
			return {
				type: "multichoice",
				prompt: "What is the difference between <span class= \"code\">==</span> and <span class= \"code\">===</span>?",
				options: Array.shuffle(options),
				solution: options[0],
				check: answer => ({
					actual: answer,
					expected: options[0],
					correct: answer === options[0]
				})
			};
		},
		() => {
			const value = Math.random() < 0.5? 123 : "abc";
			const varName = typeof(value) === "number"? "num" : "txt";
			
			return {
				type: "coding-oneline",
				prompt: `Define a <b>variable</b> called <span class="code">${varName}</span> with value <span class="code">${JSON.stringify(value)}</span>.`,
				solution: `var ${varName} = ${JSON.stringify(value)};`,
				check: code => {
					const ret = Sandbox.run(code, varName, {});
					return {
						actual: ret,
						expected: value,
						correct: ret.value === value
					}
				}
			};
		},
		() => {
			const arrName = "arr";
			const values = Array.shuffle(["abc", 123, true]);
			
			const equal = (arr1, arr2) => arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
			
			return {
				type: "coding-oneline",
				prompt: `Define an <b>array</b> called <span class="code">${arrName}</span> with values ${values.map(val => `<span class="code">${JSON.stringify(val)}</span>`).join(", ")}, in that order.`,
				solution: `var ${arrName} = [${values.map(val => JSON.stringify(val)).join(", ")}];`,
				check: code => {
					const ret = Sandbox.run(code, arrName, {});
					return {
						actual: ret,
						expected: values,
						correct: equal(ret.value || [], values)
					};
				}
			};
		},
		() => {
			const retValue = Math.random() < 0.5? 123 : "abc";
			const funcName = typeof(retValue) === "number"? "numFunc" : "txtFunc";
			
			return {
				type: "coding",
				prompt: `Define a <b>function</b> called <span class="code">${funcName}</span> that returns the value <span class="code">${JSON.stringify(retValue)}</span>.`,
				solution: `function ${funcName}() {\n    return ${JSON.stringify(retValue)};\n}`,
				check: code => {
					const ret = Sandbox.run(`${code};if(typeof ${funcName}==="undefined"){return null}const __retval=${funcName}()`, "__retval", {});
					return {
						actual: ret,
						expected: retValue,
						correct: ret.value === retValue
					};
				}
			};
		},
		() => {
			const rangeStart = Math.floor(Math.random() * 2 + 1);
			const rangeEnd = Math.floor(Math.random() * 10 + rangeStart + 6);

			const range = [...Array(rangeEnd - rangeStart + 1).keys()].map(x => x + rangeStart);
			
			const equal = (arr1, arr2) => arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
			
			return {
				type: "coding",
				prompt: `Print all integers from ${rangeStart} to ${rangeEnd} using <span class="code">console.log()</span>.`,
				solution: `for (var i = ${rangeStart}; i <= ${rangeEnd}; i++) {\n    console.log(i);\n}`,
				check: code => {
					var outputs = [];
					const customLog = value => outputs.push(value);

					Sandbox.run(`${code};`, null, {console: {log: customLog}});
					return {
						actual: outputs,
						expected: range,
						correct: equal(outputs, range)
					};
				}
			};
		}
	],
	_last: [],
	_userAnswers: [],

	generateAll: () => {
		Questions._last = Questions.generators.map(generator => generator());
		Questions._userAnswers = new Array(Questions._last.length);
		return Questions._last;
	},
	generateViews: () => {
		return Questions.generateAll().map((question, index) => {
			if (question.type === "coding" || question.type === "coding-oneline") {
				return DOM.createElement({
					type: "div",
					id: `question-view-${index + 1}`,
					classes: ["view"],
					children: [
						DOM.createElement({
							type: "div",
							classes: ["view-content", "card"],
							children: [
								DOM.createElement({
									type: "p",
									classes: ["view-title"],
									children: [`Question ${index + 1}<span class="total-questions"> / ${Questions._last.length}</span>`]
								}),
								DOM.createElement({
									type: "p",
									classes: ["view-prompt"],
									children: [question.prompt]
								}),
								question.type === "coding-oneline"?
									DOM.createElement({
										type: "div",
										id: `code-editor-${index + 1}`,
										classes: ["editor", "one-line"]
									})
									:
									DOM.createElement({
										type: "div",
										id: `code-editor-${index + 1}`,
										classes: ["editor"],
										extraAttrs: {
											height: 86
										}
									}),
								DOM.createElement({
									type: "div",
									classes: ["button"],
									children: [index === Questions._last.length - 1? "End exam" : "Next question"],
									handlers: {
										click: () => {
											const editor = document.getElementById(`code-editor-${index + 1}-textarea`);
											Questions.storeAnswer(index, editor.value);
											Views.next();
										}
									}
								})
							]
						})
					]
				});
			} else if (question.type === "multichoice") {
				return DOM.createElement({
					type: "div",
					id: `question-view-${index + 1}`,
					classes: ["view"],
					children: [
						DOM.createElement({
							type: "div",
							classes: ["view-content", "card"],
							children: [
								DOM.createElement({
									type: "p",
									classes: ["view-title"],
									children: [`Question ${index + 1}<span class="total-questions"> / ${Questions._last.length}</span>`]
								}),
								DOM.createElement({
									type: "p",
									classes: ["view-prompt"],
									children: [question.prompt]
								}),
								...question.options.map(option => {
									return DOM.createElement({
										type: "div",
										classes: ["button"],
										children: [option],
										handlers: {
											click: () => {
												Questions.storeAnswer(index, option);
												Views.next();
											}
										}
									});
								}),
								DOM.createElement({
									type: "div",
									classes: ["button", "grey"],
									children: ["Skip question"],
									handlers: {
										click: () => {
											Views.next();
										}
									}
								})
							]
						})
					]
				});
			}
		});
	},
	storeAnswer: (index, value) => {
		Questions._userAnswers[index] = value;
	},
	getAnswer: index => {
		return Questions._userAnswers[index];
	},
	getQuestionsAndAnswers: () => {
		return Questions._last.map((question, index) => ({
			question: question,
			userAnswer: Questions.getAnswer(index)
		}));
	},
	getScore: () => {
		const allQuestions = Questions.getQuestionsAndAnswers();
		const points = allQuestions.map(question => question.question.check(question.userAnswer).correct).filter(x => x).length;
		const total = allQuestions.length;
		return {
			points: points,
			total: total,
			score: (10 * points / total).toFixed(1)
		};
	},
	generateResultTable: () => {
		const format = (question, answer) => {
			if (!answer) {
				return DOM.createElement({
					type: "span",
					classes: ["none-answer"],
					children: ["(None)"]
				});
			}
			if (question.question.type === "coding" || question.question.type === "coding-oneline") {
				return DOM.createElement({
					type: "span",
					classes: ["code"],
					children: [answer]
				});
			}
			return answer;
		};
		const formatAnswer = question => format(question, question.userAnswer);
		const formatSolution = question => format(question, question.question.solution);

		const verdict = question => {
			const result = question.question.check(question.userAnswer);

			if (result.correct) {
				return DOM.createElement({
					type: "div",
					classes: ["verdict-green"],
					children: ["Correct"]
				});
			} else {
				if (question.question.type === "coding" || question.question.type === "coding-oneline") {
					if (result.actual?.error) {
						return DOM.createElement({
							type: "div",
							classes: ["verdict-red"],
							children: ["Error in code"],
							extraAttrs: {
								title: "Testing your code caused an error"
							}
						});
					}
					return DOM.createElement({
						type: "div",
						classes: ["verdict-red"],
						children: ["Wrong result"],
						extraAttrs: {
							title: "Your code produced the wrong result or gave no answer at all"
						}
					});
				}
				
				return DOM.createElement({
					type: "div",
					classes: ["verdict-red"],
					children: ["Wrong answer"]
				});
			}
		};

		return DOM.createElement({
			type: "table",
			classes: ["result-table"],
			children: [
				DOM.createElement({
					type: "tr",
					classes: ["result-table-header"],
					children: [
						DOM.createElement({
							type: "td",
							children: ["Question"]
						}),
						DOM.createElement({
							type: "td",
							children: ["Your answer"]
						}),
						DOM.createElement({
							type: "td",
							children: ["Verdict"]
						}),
						DOM.createElement({
							type: "td",
							children: ["Correct/suggested solution"]
						})
					]
				}),
				...Questions.getQuestionsAndAnswers().map(question => DOM.createElement({
					type: "tr",
					classes: ["result-table-content"],
					children: [
						DOM.createElement({
							type: "td",
							children: [question.question.prompt]
						}),
						DOM.createElement({
							type: "td",
							children: [formatAnswer(question)]
						}),
						DOM.createElement({
							type: "td",
							children: [verdict(question)]
						}),
						DOM.createElement({
							type: "td",
							children: [formatSolution(question)]
						})
					]
				}))
			]
		});
	}
};
