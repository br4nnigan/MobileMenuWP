function TriggerButton( options ) {

	this.isTriggered = false;

	this.destroy = function() {

		if ( !(options.element instanceof Element) ) {
			return false;
		}
		options.element.removeEventListener("click", onTrigger);
	};

	function initialize() {

		options = options || {};

		if ( !(options.element instanceof Element) ) {
			return false;
		}
		options.element.addEventListener("click", onTrigger);
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

