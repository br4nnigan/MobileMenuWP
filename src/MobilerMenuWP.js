function MobileMenuWP() {

	var api = {
		destroy: destroy
	}

	var subcomponents = [];

	function initialize() {

		subcomponents.push(Static.map(document.querySelectorAll(".nav-button-more"), function (element) {
			return MobileSubMenuButton( element );
		}));

		var NavContainer = document.querySelector(".nav-container");

		subcomponents.push(Static.map(document.querySelectorAll(".menu--button"), function (element) {
			return MobileMenuButton( element, NavContainer );
		}));
	}

	function destroy() {

		Static.each(subcomponents, function (subcomponent) {
			if ( subcomponent.destroy ) {
				subcomponent.destroy();
			}
		});
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = MobileMenuWP;
}

