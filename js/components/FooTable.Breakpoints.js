(function($, FooTable){

	/**
	 * A comma separated string of breakpoint names that specify when the column will be hidden. You can also specify "all" to make a column permanently display in an expandable detail row.
	 * @type {string}
	 * @default null
	 * @example
	 * hide: "small medium"
	 */
	FooTable.Column.prototype.hide = null;

	/**
	 * An object containing the breakpoints for the plugin.
	 * @type {object.<string, number>}
	 * @default { "xs": 480, "sm": 768, "md": 992, "lg": 1200 }
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
			 * The current breakpoint.
			 * @type {FooTable.Breakpoint}
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
			 * @type {FooTable.Breakpoint}
			 * @private
			 */
			this._previous = null;
			/**
			 * This value is updated each time the current breakpoint changes and contains a space delimited string of the names of breakpoints that should also be hidden.
			 * @type {string}
			 * @private
			 */
			this._hidden = null;
			/**
			 * This value is set once when the {@link FooTable.Breakpoints#array} is generated and contains a space delimited string of all the breakpoint class names.
			 * @type {string}
			 * @private
			 */
			this._classNames = '';

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
			this.calculate();
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
			this.calculate();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('breakpoints_reinit');
		},
		draw: function(){
			this.ft.$table.removeClass(this._classNames).addClass('breakpoint-' + this.current.name);
		},

		/* PUBLIC */
		/**
		 * Calculates the current breakpoint from the {@link FooTable.Breakpoints#array} and sets the {@link FooTable.Breakpoints#current} property.
		 * @instance
		 * @returns {string}
		 */
		calculate: function(){
			var self = this, current = null, hidden = [], breakpoint, prev = null, has_prev, width = self.getWidth();
			for (var i = 0, len = self.array.length; i < len; i++) {
				has_prev = prev instanceof FooTable.Breakpoint;
				breakpoint = self.array[i];
				// if the width is smaller than the smallest breakpoint set that as the current.
				// if the width is larger than the largest breakpoint set that as the current.
				// otherwise if the width is somewhere in between check all breakpoints testing if the width
				// is greater than the current but smaller than the previous.
				if ((!current && i == len -1)
					|| (width >= breakpoint.width && (has_prev ? width <= prev.width : true))) {
					current = breakpoint;
					break;
				}
				if (!current) hidden.push(breakpoint.name);
				prev = breakpoint;
			}
			hidden.push(current.name);
			self.current = current;
			self._hidden = hidden.join(' ');
			return current;
		},
		isHidden: function(name){
			if (FooTable.strings.isNullOrEmpty(name)) return false;
			if (name === 'all') return true;
			return FooTable.strings.containsWord(this._hidden, name);
		},
		/**
		 * Performs a check between the current breakpoint and the previous breakpoint and performs a redraw if they differ.
		 * @instance
		 * @fires FooTable.Breakpoints#breakpoints_changed
		 */
		check: function(){
			var self = this;
			self.calculate();
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
			if (breakpoints == null) breakpoints = { "xs": 480, "sm": 768, "md": 992, "lg": 1200 };
			// Create a nice friendly array to work with out of the breakpoints object.
			for (var name in breakpoints) {
				if (!breakpoints.hasOwnProperty(name)) continue;
				self.array.push(new FooTable.Breakpoint(name, breakpoints[name]));
				self._classNames += 'breakpoint-' + (name + ' ');
			}
			// Sort the breakpoints so the largest is checked first
			self.array.sort(function (a, b) {
				return b.width - a.width;
			});
		}
	});

})(jQuery, FooTable = window.FooTable || {});