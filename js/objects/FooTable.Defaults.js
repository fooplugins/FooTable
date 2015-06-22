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
		 * Whether or not events raised using the {@link FooTable.Instance#raise} method are propagated up the DOM. By default this is set to true and all events can only be listened for on the
		 * table itself. The reason for this if you have nested tables, the parent table would receive all the events raised by it's children and any handlers bound to both the parent and child
		 * would be triggered which is not the desired behavior.
		 * @type {boolean}
		 * @default true
		 */
		this.stopPropagation = true;
		/**
		 * The namespace appended to all events raised by the plugin.
		 * @type {string}
		 * @default NULL
		 */
		this.namespace = null;
		/**
		 * An object in which the string keys represent one or more space-separated event types and optional namespaces, and the values represent a handler function to be called for the event(s).
		 * @type {object.<string, function>}
		 * @default NULL
		 * @example <caption>This example shows how to pass an object containing the events and handlers.</caption>
		 * on: {
		 * 	click: function(e){
		 * 		// do something whenever the table is clicked
		 * 	},
		 * 	"init": function(e, instance){
		 * 		// do something when FooTable initializes
		 * 	},
		 * 	"init reinit": function(e, instance){
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