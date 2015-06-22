(function($, FooTable){

	/**
	 * A comma separated string of breakpoint names that specify when the column will be hidden. You can also specify "all" to make a column permanently display in an expandable detail row.
	 * @type {string}
	 * @default null
	 * @example
	 * hide: "phone tablet"
	 */
	FooTable.Column.prototype.hide = null;

	/**
	 * An object containing the breakpoints for the plugin.
	 * @type {object.<string, number>}
	 * @default { "phone": 480, "tablet": 1024 }
	 */
	FooTable.Defaults.prototype.breakpoints = null;

	/**
	 * Whether or not to calculate breakpoints on the width of the parent element rather than the viewport.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Defaults.prototype.useParentWidth = false;

	/**
	 * A function used to override the default getWidth function with a custom one.
	 * @type {function}
	 * @default null
	 * @example <caption>The below shows what the default getWidth function would look like.</caption>
	 * getWidth: function(instance){
	 * 	if (instance.options.useParentWidth == true) return instance.$table.parent().width();
	 * 	return instance.breakpoints.getViewportWidth();
	 * }
	 */
	FooTable.Defaults.prototype.getWidth = null;

	FooTable.Breakpoints = FooTable.Component.extend(/** @lends FooTable.Breakpoints */{
		/**
		 * Contains the logic to calculate and apply breakpoints for the plugin.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @returns {FooTable.Breakpoints}
		 */
		ctor: function(instance){

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options} object.
			 * @protected
			 * @type {FooTable.Instance#options}
			 */
			this.o = instance.options;

			/* PUBLIC */
			/**
			 * The name of the current breakpoint.
			 * @type {string}
			 */
			this.current = null;
			/**
			 * A space separated string of all breakpoint names.
			 * @type {string}
			 */
			this.names = '';
			/**
			 * An array of {@link FooTable.Breakpoint} objects created from parsing the options.
			 * @type {Array.<FooTable.Breakpoint>}
			 */
			this.array = [];

			/* PRIVATE */
			/**
			 * Used when performing a {@link FooTable.Breakpoints#check} this stores the previous breakpoint value to compare to the current.
			 * @type {string}
			 * @private
			 */
			this._previous = null;

			// call the base class constructor
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Provides access to the {@link FooTable.Column} constructor allowing components to modify the object on creation.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 */
		ctor_column: function(column, definition){
			column.hide = FooTable.is.type(definition.hide, 'string') ? definition.hide : null;
		},
		/**
		 * Initializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Breakpoints#breakpoints_init
		 */
		init: function(table, options){
			this._generate(options.breakpoints);
			this.current = this.calculate();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('breakpoints_init');
		},
		/**
		 * Reinitializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @protected
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Breakpoints#breakpoints_reinit
		 */
		reinit: function(options){
			this._generate(options.breakpoints);
			this.current = this.calculate();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('breakpoints_reinit');
		},

		/* PUBLIC */
		/**
		 * Calculates the current breakpoint from the {@link FooTable.Breakpoints#array} and returns its name.
		 * @instance
		 * @returns {string}
		 */
		calculate: function(){
			var self = this, current = null, breakpoint, width = self.getWidth();
			for (var i = 0, len = self.array.length; i < len; i++) {
				breakpoint = self.array[i];
				if (breakpoint && breakpoint.width && width <= breakpoint.width) {
					current = breakpoint;
					break;
				}
			}
			return current === null ? 'default' : current['name'];
		},
		/**
		 * Performs a check between the current breakpoint and the previous breakpoint and performs a redraw if they differ.
		 * @instance
		 * @fires FooTable.Breakpoints#breakpoints_changed
		 */
		check: function(){
			var self = this;
			self.current = self.calculate();
			if (self.current == self._previous) return;
			self.ft.draw();
			self._previous = self.current;
			/**
			 * The breakpoints_changed event is raised when a call to {@link FooTable.Breakpoints#check} determines that the breakpoint has changed.
			 * @event FooTable.Breakpoints#breakpoints_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} ft - The instance of FooTable raising the event.
			 * @param {string} current - The current breakpoint name.
			 * @param {string} previous - The previous breakpoint name.
			 */
			self.ft.raise('breakpoints_changed', [ self.current, self._previous ]);
		},
		/**
		 * Gets the width used to determine breakpoints whether it be from the viewport, parent or a custom function.
		 * @instance
		 * @returns {number}
		 */
		getWidth: function(){
			if (FooTable.is.fn(this.o.getWidth)) return this.o.getWidth(this.ft);
			if (this.o.useParentWidth == true) return this.ft.$table.parent().width();
			return this.getViewportWidth();
		},
		/**
		 * Gets the current viewport width.
		 * @instance
		 * @returns {number}
		 */
		getViewportWidth: function(){
			var ratio = FooTable.is.defined(window.devicePixelRatio) && FooTable.isMobile ? window.devicePixelRatio : 1;
			return (window.innerWidth || (document.body ? document.body.offsetWidth : 0)) / ratio;
		},

		/* PRIVATE */
		/**
		 * Generates a sorted array of breakpoints from the supplied object populating the {@link FooTable.Breakpoints#array} and {@link FooTable.Breakpoints#name} members.
		 * @instance
		 * @param {object.<string, number>} breakpoints - The breakpoints object from the options.
		 * @private
		 */
		_generate: function(breakpoints){
			var self = this;
			if (breakpoints == null) breakpoints = { phone: 480, tablet: 1024 };
			// Create a nice friendly array to work with out of the breakpoints object.
			for (var name in breakpoints) {
				if (!breakpoints.hasOwnProperty(name)) continue;
				self.array.push(new FooTable.Breakpoint(name, breakpoints[name]));
				self.names += (name + ' ');
			}

			// Sort the breakpoints so the smallest is checked first
			self.array.sort(function (a, b) {
				return a.width - b.width;
			});
		}
	});

})(jQuery, FooTable = window.FooTable || {});