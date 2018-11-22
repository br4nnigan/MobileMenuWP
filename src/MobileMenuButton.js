var Hammer = require("hammerjs");
var transition = require("css-transition");

function MobileMenuButton( buttonElement, navContainer ) {

	var api = {
		open: open,
		close: close,
		destroy: destroy
	}
	var hammer = null;
	var isOpen = null;

	var nav = null;
	var button = null;

	function initialize() {

		if ( !(buttonElement instanceof Element && navContainer instanceof Element) ) {
			return false;
		}

		nav = navContainer.querySelector("nav");
		// navContainer.style.height = 0;
		isOpen = false;

		if ( !nav ) {
			return false;
		}

		hammer = new Hammer(buttonElement);
		hammer.on("tap", onButtonClick);

		window.addEventListener("resize", close);
	}

	function destroy() {

		if ( hammer ) {
			hammer.destroy();
			hammer = null;
		}
		window.removeEventListener("resize", close);
	}

	function open() {
		nav.classList.add("nav--open");
		isOpen = true;
	}

	function close() {

		nav.classList.remove("nav--open");
		isOpen = false;
	}

	function onButtonClick(event) {

		return isOpen ? close() : open();
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileMenuButton;
}

