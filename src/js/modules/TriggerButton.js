var Hammer = require("hammerjs");
var transition = require("css-transition");

function TriggerButton( options ) {

	var hammer = null;

	this.isTriggered = false;

	this.destroy = function() {

		if ( hammer ) {
			hammer.destroy();
			hammer = null;
		}
	};

	function initialize() {

		options = options || {};

		if ( !(options.element instanceof Element) ) {
			return false;
		}

		hammer = new Hammer(options.element);
		hammer.on("tap", onTrigger);
	}

	function onTrigger( event ) {

		this.isTriggered = !this.isTriggered;
		if ( typeof options.onTrigger == "function" ) {

			options.onTrigger.call( this, event );
		}
	}

	initialize();
}
if ( typeof module == "object" ) {
	module.exports = TriggerButton;
}

