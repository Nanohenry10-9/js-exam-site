const Highlighter = {
	highlight: text => {
		text = String.decodeHTML(text);
		text.replace("\r\n", "\n");

		const keywords = [
			"var", "const", "for", "while", "if", "break", "continue", "of", "in", "typeof", "instanceof", "return", "yield", "null", "undefined", "function", "true", "false"
		];

		const special = [
			"document", "window", "Object", "console"
		];

		const methods = [
			"getElementById",
			"createElement",
			"getElementsByClassName",
			"log"
		];

		/*

		This is where the magic happens. "tokenGroups" is a list of regular expression patterns that
		are repeatedly matched against the source text. When a match is found, it gets formatted by
		the specified formatting function and removed from the original string.

		For example, the following:

		{
			pattern: /x/,
			format: match => `<span style="color: red">${match}</span>`
		}

		would make all occurences of the letter 'x' red.

		*/

		const tokenGroups = [
			{
				pattern: /\/\/.*($|\\n)/m,
				format: match => `<span style="color: #888">${match}</span>`
			},
			{
				pattern: /^[a-zA-Z_$]+[a-zA-Z0-9_$]*/,
				format: match => keywords.includes(match)?
								     `<span style="color: #A00; font-style: italic">${match}</span>` :
								     (special.includes(match)?
								         `<span style="color: #00A; font-weight: bold">${match}</span>` :
								         (methods.includes(match)?
								             `<span style="color: #007; font-style: italic">${match}</span>` :
								             `<span style="color: #000">${match}</span>`))
			},
			{
				pattern: /^-?[0-9]+\.?[0-9]*/,
				format: match => `<span style="color: #00A">${match}</span>`
			},
			{
				pattern: /^([\+\-\*\/\^\&\|\?\!<>]|\&\&|\|\||=>)/,
				format: match => `<span style="color: #804">${match}</span>`
			},
			{
				pattern: /^"[^"]*"?/,
				format: match => `<span style="color: #080">${match}</span>`
			},
			{
				pattern: /^(\.|,|;|:|=| |\n)/,
				format: match => `<span style="color: #000">${match}</span>`
			},
			{
				pattern: /^(\(|\)|\[|\]|{|})/,
				format: match => `<span style="color: #000">${match}</span>`
			},

			null // See https://en.wikipedia.org/wiki/Elephant_in_Cairo
		];

		/*

		Here is the "meat" of the algorithm, as implemented below this comment:

		1) Take the next pattern from list
		2) If there are no more patterns, exit with a warning
		3) Check if the start of the string matches the pattern
		4) If not, go to step 1
		5) Remove the match from the string, format it, and add it to the list of tokens
		6) If the string isn't empty, go to step 1
		7) Exit

		*/

		var tokens = [];

		try {
			while (text.length > 0) {
				for (const group of tokenGroups) {
					if (match = group.pattern.exec(text)) {
						tokens.push(group.format(String.encodeHTML(match[0])));
						text = text.slice(match.index + match[0].length);
						break;
					}
				}
			}
		} catch (e) {
			if (!(e instanceof TypeError)) throw e;
			console.warn("[HIGHLIGHTER]: Pattern list exhausted!");
		}

		return tokens.join("") + text; // Append the remaining unrecognised text
	},
	highlightAll: () => {
		Array.from(document.getElementsByClassName("code")).forEach(elem => {
			if (elem.classList.contains("highlighted")) return;
			elem.innerHTML = Highlighter.highlight(elem.innerHTML);
			elem.classList.add("highlighted");
		});
	}
};

const Editors = {
	states: new Map(),
	create: () => {
		Array.from(document.getElementsByClassName("editor")).forEach(elem => {
			const oneLine = elem.classList.contains("one-line");

			const width = elem.getAttribute("width")? parseInt(elem.getAttribute("width")) : elem.clientWidth + 5;
			const height = oneLine? 36 : (elem.getAttribute("height")? parseInt(elem.getAttribute("height")) : elem.clientHeight);
			const id = elem.getAttribute("id");

			elem.style.width = `${width}px`;
			elem.style.height = `${height}px`;

			const wrapper = document.createElement("div");
			wrapper.style.width = `${width - 5}px`;
			wrapper.style.height = `${height - 5}px`;
			wrapper.classList.add("editor-wrapper");
			elem.appendChild(wrapper);

			const textarea = document.createElement("textarea");
			textarea.style.width = `${width - 5}px`;
			textarea.style.height = `${height - 5}px`;
			textarea.autocomplete = "off";
			textarea.autocorrect = "off";
			textarea.autocapitalize = "off";
			textarea.spellcheck = false;
			textarea.placeholder = "// Your code here";
			textarea.setAttribute("tabindex", "-1");
			textarea.setAttribute("id", `${elem.getAttribute("id")}-textarea`);
			textarea.classList.add("editor-input");
			wrapper.appendChild(textarea);

			const overlay = document.createElement("div");
			overlay.style.width = `${width - 5}px`;
			overlay.style.height = `${height - 5}px`;
			overlay.classList.add("editor-overlay");
			wrapper.appendChild(overlay);

			overlay.addEventListener("scroll", () => {
				textarea.scrollTop = overlay.scrollTop;
			});
			textarea.addEventListener("scroll", () => {
				overlay.scrollTop = textarea.scrollTop;
			});

			Editors.states.set(id, {elem: elem, overlay: overlay, input: textarea, width: width, height: height});

			elem.addEventListener("click", () => {
				Editors.states.get(id).focused = true;
			});
			elem.addEventListener("blur", () => {
				Editors.states.get(id).focused = false;
			});
			elem.addEventListener("keydown", event => {
				// Disallow enter (if one-line mode is on) and tab navigation

				if (oneLine && event.keyCode === 13) event.preventDefault();
				if (event.keyCode === 9) event.preventDefault();

				/*

				The following is a bit odd, but effectively it will call Editors.redraw() after at
				least one and at most two frames. During this time the browser has updated the value
				of the textarea element, so it can be processed in JavaScript.

				*/

				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						Editors.redraw(id);
					});
				});
			});

			Editors.redraw(id);
		});
	},
	redraw: id => {
		const editor = Editors.states.get(id);
		editor.overlay.innerHTML = Highlighter.highlight(editor.input.value);
		editor.overlay.scrollTop = editor.input.scrollTop;
	}
};
