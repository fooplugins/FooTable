(function ($, FooTable) {

	/**
	 * Contains all the available options for the FooTable plugin.
	 * @constructor
	 * @returns {FooTable.Defaults}
	 */
	FooTable.Defaults = function () {
		/**
		 * Whether or not FooTable is to use ajax.
		 * @type {boolean}
		 * @default false
		 */
		this.ajaxEnabled = false;
		/**
		 * The function that retrieves the ajax data for the table. This must return a {@link jQuery.Promise} object.
		 * @type {jQuery.Promise}
		 * @default Empty Promise
		 * @example <caption>The below shows an example of how to use this option.</caption>
		 * ajax: function(requestData){
		 * 	return jQuery.ajax({
		 * 		url: 'http://example.com/my-endpoint',
		 * 		data: requestData
		 * 	});
		 * }
		 * @see {@link http://api.jquery.com/Types/#Promise}
		 */
		this.ajax = $.when();
		/**
		 * The namespace appended to all events raised by the plugin.
		 * @type {string}
		 * @default "footable"
		 */
		this.namespace = 'footable';
		/**
		 * An object in which the string keys represent one or more space-separated event types and optional namespaces, and the values represent a handler function to be called for the event(s).
		 * @type {object.<string, function>}
		 * @default null
		 * @example <caption>This example shows how to pass an object containing the events and handlers.</caption>
		 * on: {
		 * 	click: function(e){
		 * 		// do something whenever the table is clicked
		 * 	},
		 * 	"init.footable": function(e, instance){
		 * 		// do something when FooTable initializes
		 * 	},
		 * 	"init.footable reinit.footable": function(e, instance){
		 * 		// do something when FooTable initializes or reinitializes
		 * 	}
		 * }
		 */
		this.on = null;
	};

	/**
	 * Contains all the default options for the plugin.
	 * @type {FooTable.Defaults}
	 */
	FooTable.defaults = new FooTable.Defaults();

})(jQuery, FooTable = window.FooTable || {});