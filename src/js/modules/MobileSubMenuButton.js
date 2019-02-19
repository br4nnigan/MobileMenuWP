var Hammer = require("hammerjs");
var transition = require("css-transition");
var Static = require("Static.js");

function MobileSubMenuButton( buttonElement ) {

	var api = {
		open: open,
		close: close,
		destroy: destroy
	};

	var hammer = null;
	var isOpen = null;

	// var menu = null;
	var menuItem = null;
	var menuItemA = null;
	var button = null;

	var transitioning = null;

	var classes = {
		OPEN: "nav-button-more--open"
	};

	function initialize() {

		if ( !(buttonElement instanceof Element) ) {
			return false;
		}
		button = buttonElement;

		menuItem = Static.dom.closest( buttonElement, ".menu-item" );
		if (!menuItem) {
			return false;
		}

		menuItemA = menuItem.querySelector("a");
		if (!menuItemA) {
			return false;
		}

		isOpen = false;
		hammer = new Hammer(buttonElement);
		hammer.on("tap", onButtonClick);

		document.addEventListener( "onBeforeDomChange", close );
		document.addEventListener( "MobileSubMenuButtonOpen", MobileSubMenuButtonOpen );

		window.addEventListener("resize", function () {
			if ( isOpen ) {
				close(0);
			}
		});
	}

	function destroy() {

		if ( hammer ) {
			hammer.destroy();
			hammer = null;
		}
		document.removeEventListener( "onAfterDomChange", close );
	}

	function open( duration ) {

		if ( transitioning ) {
			return;
		}

		document.dispatchEvent(Static.dom.createEvent({
			type: "MobileSubMenuButtonOpen",
			detail: button
		}));

		transitioning = true;
		transition(menuItem, {
			height: menuItem.scrollHeight + "px"
		}, duration || 170, "ease", onTransitionEnd);
		isOpen = true;
		button.classList.add( classes.OPEN );
	}

	function close( duration ) {
		if ( transitioning ) {
			return;
		}
		transitioning = true;
		transition(menuItem, {
			height: menuItemA.offsetHeight + "px"
		}, duration || 170, "", onTransitionEnd);
		isOpen = false;
		button.classList.remove( classes.OPEN );
	}

	function MobileSubMenuButtonOpen(e) {
		if ( e.detail != button ) {
			close();
		}
	}

	function onTransitionEnd() {
		transitioning = false;
	}

	function onButtonClick(event) {

		return isOpen ? close() : open();
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileSubMenuButton;
}

