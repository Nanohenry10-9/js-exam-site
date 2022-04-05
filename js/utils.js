/*

These are some extensions to pre-existing JavaScript libraries that are used relatively often in
the code. This is technically bad practise since this could overwrite pre-defined methods, but it
doesn't matter in such a small project.

*/

Array.shuffle = array => {
	array = array.slice();

	var currentIndex = array.length, randomIndex;

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
};

Array.zip = (a, b) => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

String.decodeHTML = str => {
	const txt = document.createElement("textarea");
	txt.innerHTML = str;
	return txt.value;
};
String.encodeHTML = str => str.replace(/[\u00A0-\u9999<>\&]/g, i => `&#${i.charCodeAt(0)};`);

Math.clamp = (x, a, b) => Math.min(Math.max(x, a), b);

/*

And here is a little shortcut for the bazillion lines of code that have to be written for each
element that is generated in JavaScript. Plus, it allows nesting, which makes it easy to create
both complex and dynamic structures.

*/

const DOM = {
	createElement: function({type, id, classes, children, handlers, extraAttrs}) {
		const elem = document.createElement(type);
		if (id) elem.id = id;
		if (classes) elem.classList.add(...classes);
		(children || []).forEach(child => {
			if (typeof child == "string") {
				elem.innerHTML += child;
			} else if (typeof child == "object") {
				elem.appendChild(child);
			}
		});

		if (handlers) Object.entries(handlers).forEach(handler => elem.addEventListener(handler[0], () => handler[1](elem)));
		if (extraAttrs) Object.entries(extraAttrs).forEach(attr => elem.setAttribute(attr[0], attr[1]));

		return elem;
	}
};
