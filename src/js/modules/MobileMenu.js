var Static = require("Static.js");
var MobileSubMenuButton = require("./MobileSubMenuButton");
var TriggerButton = require("./TriggerButton");

function MobileMenu() {

	var api = {
		destroy: destroy,
		open: open,
		close: close
	};

	var nav = null;
	var subcomponents = [];

	function initialize() {

		subcomponents.push(Static.map(document.querySelectorAll(".nav-button-more"), function (element) {
			return new MobileSubMenuButton( element );
		}));

		nav = document.querySelector(".nav-container nav");

		subcomponents.push(Static.map(document.querySelectorAll(".menu-button"), function (element) {
			return new TriggerButton({
				element: element,
				onTrigger: function (event) {
					nav.classList.toggle( "nav--open" );
				}
			});
		}));

		window.addEventListener("resize", onResize);
	}

	function onResize() {
		close();
	}

	function open() {
		nav.classList.add( "nav--open" );
	}

	function close() {
		nav.classList.remove( "nav--open" );
	}

	function destroy() {

		window.removeEventListener("resize", onResize);

		Static.each(subcomponents, function (subcomponent) {
			if ( subcomponent.destroy ) {
				subcomponent.destroy();
			}
		});
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileMenu;
}

