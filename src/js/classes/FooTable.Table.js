(function ($, F) {

	/**
	 * An array of all currently loaded instances of the plugin.
	 * @protected
	 * @readonly
	 * @type {Array.<FooTable.Table>}
	 */
	F.instances = [];

	F.Table = F.Class.extend(/** @lends FooTable.Table */{
		/**
		 * This class is the core of the plugin and drives the logic of all components.
		 * @constructs
		 * @this FooTable.Table
		 * @extends FooTable.Class
		 * @param {(HTMLTableElement|jQuery)} element - The element or jQuery table object to bind the plugin to.
		 * @param {object} options - The options to initialize the plugin with.
		 * @param {function} [ready] - A callback function to execute once the plugin is initialized.
		 * @returns {FooTable.Table}
		 */
		construct: function (element, options, ready) {
			//BEGIN MEMBERS
			/**
			 * The timeout ID for the resize event.
			 * @instance
			 * @private
			 * @type {?number}
			 */
			this._resizeTimeout = null;
			/**
			 * The ID of the FooTable instance.
			 * @instance
			 * @type {number}
			 */
			this.id = F.instances.push(this);
			/**
			 * Whether or not the plugin and all components and add-ons are fully initialized.
			 * @instance
			 * @type {boolean}
			 */
			this.initialized = false;
			/**
			 * The jQuery table object the plugin is bound to.
			 * @instance
			 * @type {jQuery}
			 */
			this.$el = (F.is.jq(element) ? element : $(element)).first(); // ensure one table, one instance
			/**
			 * The options for the plugin. This is a merge of user defined options and the default options.
			 * @instance
			 * @type {object}
			 */
			this.o = $.extend(true, {}, F.defaults, options);
			/**
			 * An array of all CSS classes on the table that do not start with "footable".
			 * @instance
			 * @protected
			 * @type {Array.<string>}
			 */
			this.classes = [];
			/**
			 * All components for this instance of the plugin. These are executed in the order they appear in the array for the initialize phase and in reverse order for the destroy phase of the plugin.
			 * @instance
			 * @protected
			 * @type {object}
			 * @prop {Array.<FooTable.Component>} internal - The internal components for the plugin. These are executed either before all other components in the initialize phase or after them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.Component>} core - The core components for the plugin. These are executed either after the internal components in the initialize phase or before them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.Component>} custom - The custom components for the plugin. These are executed either after the core components in the initialize phase or before them in the destroy phase of the plugin.
			 */
			this.components = {
				internal: F.components.internal.load(this),//[this.breakpoints, this.columns, this.editor, this.rows],
				core: F.components.core.load(this),
				custom: F.components.load(this)
			};
			/**
			 * The breakpoints component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Breakpoints}
			 */
			this.breakpoints = this.use(FooTable.Breakpoints);
			/**
			 * The columns component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Columns}
			 */
			this.columns = this.use(FooTable.Columns);
			/**
			 * The rows component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Rows}
			 */
			this.rows = this.use(FooTable.Rows);

			//END MEMBERS
			this._construct(ready);
		},
		/**
		 * Once all properties are set this performs the actual initialization of the plugin calling the {@link FooTable.Table#_preinit} and
		 * {@link FooTable.Table#_init} methods as well as raising the {@link FooTable.Table#"ready.ft.table"} event.
		 * @this FooTable.Table
		 * @instance
		 * @param {function} [ready] - A callback function to execute once the plugin is initialized.
		 * @private
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Table#"ready.ft.table"
		 */
		_construct: function(ready){
			var self = this;
			this._preinit().then(function(){
				return self._init();
			}).always(function(arg){
				if (F.is.error(arg)){
					console.error('FooTable: unhandled error thrown during initialization.', arg);
				} else {
					/**
					 * The postinit.ft.table event is raised after the plugin has been initialized and the table drawn.
					 * Calling preventDefault on this event will stop the ready callback being executed.
					 * @event FooTable.Table#"postinit.ft.table"
					 * @param {jQuery.Event} e - The jQuery.Event object for the event.
					 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
					 */
					return self.raise('ready.ft.table').then(function(){
						if (F.is.fn(ready)) ready.call(self, self);
					});
				}
			});
		},
		/**
		 * The preinit method is called prior to the plugins actual initialization and provides itself and it's components an opportunity to parse any additional option values.
		 * @instance
		 * @private
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Table#"preinit.ft.table"
		 */
		_preinit: function(){
			var self = this;
			/**
			 * The preinit.ft.table event is raised before any components.
			 * Calling preventDefault on this event will disable the entire plugin.
			 * @event FooTable.Table#"preinit.ft.table"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			return this.raise('preinit.ft.table').then(function(){
				var classes = self.$el.attr('class').match(/\S+/g),
					data = self.$el.data() || {};

				self.o.ajax = F.checkFnValue(self, data.ajax, self.o.ajax);
				self.o.stopPropagation = F.is.boolean(data.stopPropagation)
					? data.stopPropagation
					: self.o.stopPropagation;

				for (var i = 0, len = classes.length; i < len; i++){
					if (!F.str.startsWith(classes[i], 'footable')) self.classes.push(classes[i]);
				}
				var $loader = $('<div/>', { 'class': 'footable-loader' }).append($('<span/>', {'class': 'fooicon fooicon-loader'}));
				self.$el.hide().after($loader);
				return self.execute(false, false, 'preinit', data).always(function(){
					self.$el.show();
					$loader.remove();
				});
			});
		},
		/**
		 * Initializes this instance of the plugin and calls the callback function if one is supplied once complete.
		 * @this FooTable.Table
		 * @instance
		 * @private
		 * @return {jQuery.Promise}
		 * @fires FooTable.Table#"init.ft.table"
		 */
		_init: function(){
			var self = this;
			/**
			 * The init.ft.table event is raised before any components are initialized.
			 * Calling preventDefault on this event will disable the entire plugin.
			 * @event FooTable.Table#"init.ft.table"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			return self.raise('init.ft.table').then(function(){
				var $thead = self.$el.children('thead'),
					$tbody = self.$el.children('tbody'),
					$tfoot = self.$el.children('tfoot');
				self.$el.addClass('footable footable-' + self.id);
				if (F.is.hash(self.o.on)) self.$el.on(self.o.on);
				if ($tfoot.length == 0) self.$el.append($tfoot = $('<tfoot/>'));
				if ($tbody.length == 0) self.$el.append('<tbody/>');
				if ($thead.length == 0) self.$el.prepend($thead = $('<thead/>'));
				return self.execute(false, true, 'init').then(function(){
					self.$el.data('__FooTable__', self);
					if ($tfoot.children('tr').length == 0) $tfoot.remove();
					if ($thead.children('tr').length == 0) $thead.remove();

					/**
					 * The postinit.ft.table event is raised after any components are initialized but before the table is
					 * drawn for the first time.
					 * Calling preventDefault on this event will disable the initial drawing of the table.
					 * @event FooTable.Table#"postinit.ft.table"
					 * @param {jQuery.Event} e - The jQuery.Event object for the event.
					 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
					 */
					return self.raise('postinit.ft.table').then(function(){
						return self.draw();
					}).always(function(){
						$(window).off('resize.ft'+self.id, self._onWindowResize)
							.on('resize.ft'+self.id, { self: self }, self._onWindowResize);
						self.initialized = true;
					});
				});
			});
		},
		/**
		 * Destroys this plugin removing it from the table.
		 * @this FooTable.Table
		 * @instance
		 * @fires FooTable.Table#"destroy.ft.table"
		 */
		destroy: function () {
			var self = this;
			/**
			 * The destroy.ft.table event is called before all core components.
			 * Calling preventDefault on this event will prevent the entire plugin from being destroyed.
			 * @event FooTable.Table#"destroy.ft.table"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			return self.raise('destroy.ft.table').then(function(){
				return self.execute(true, true, 'destroy').then(function () {
					self.$el.removeData('__FooTable__').removeClass('footable-' + self.id);
					if (F.is.hash(self.o.on)) self.$el.off(self.o.on);
					self.initialized = false;
				});
			}).fail(function(err){
				if (F.is.error(err)){
					console.error('FooTable: unhandled error thrown while destroying the plugin.', err);
				}
			});
		},
		/**
		 * Raises an event on this instance supplying the args array as additional parameters to the handlers.
		 * @this FooTable.Table
		 * @instance
		 * @param {string} eventName - The name of the event to raise, this can include namespaces.
		 * @param {Array} [args] - An array containing additional parameters to be passed to any bound handlers.
		 * @returns {jQuery.Event}
		 */
		raise: function(eventName, args){
			var self = this,
				debug = F.__debug__ && (F.is.emptyArray(F.__debug_options__.events) || F.arr.any(F.__debug_options__.events, function(name){ return F.str.contains(eventName, name); }));
			args = args || [];
			args.unshift(this);
			return $.Deferred(function(d){
				var evt = $.Event(eventName);
				if (self.o.stopPropagation == true){
					self.$el.one(eventName, function (e) {e.stopPropagation();});
				}
				if (debug) console.log('FooTable:'+eventName+': ', args);
				self.$el.trigger(evt, args);
				if (evt.isDefaultPrevented()){
					if (debug) console.log('FooTable: default prevented for the "'+eventName+'" event.');
					d.reject(evt);
				}	else d.resolve(evt);
			});
		},
		/**
		 * Attempts to retrieve the instance of the supplied component type for this instance.
		 * @this FooTable.Table
		 * @instance
		 * @param {object} type - The content type to retrieve for this instance.
		 * @returns {(*|null)}
		 */
		use: function(type){
			var components = this.components.internal.concat(this.components.core, this.components.custom);
			for (var i = 0, len = components.length; i < len; i++){
				if (components[i] instanceof type) return components[i];
			}
			return null;
		},
		/**
		 * Performs the drawing of the table.
		 * @this FooTable.Table
		 * @instance
		 * @protected
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Table#"predraw.ft.table"
		 * @fires FooTable.Table#"draw.ft.table"
		 * @fires FooTable.Table#"postdraw.ft.table"
		 */
		draw: function () {
			var self = this;
			// when drawing the order that the components are executed is important so chain the methods but use promises to retain async safety.
			return self.execute(false, true, 'predraw').then(function(){
				/**
				 * The predraw.ft.table event is raised after all core components and add-ons have executed there predraw functions but before they execute there draw functions.
				 * @event FooTable.Table#"predraw.ft.table"
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
				 */
				return self.raise('predraw.ft.table').then(function(){
					return self.execute(false, true, 'draw').then(function(){
						/**
						 * The draw.ft.table event is raised after all core components and add-ons have executed there draw functions.
						 * @event FooTable.Table#"draw.ft.table"
						 * @param {jQuery.Event} e - The jQuery.Event object for the event.
						 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
						 */
						return self.raise('draw.ft.table').then(function(){
							return self.execute(false, true, 'postdraw').then(function(){
								/**
								 * The postdraw.ft.table event is raised after all core components and add-ons have executed there postdraw functions.
								 * @event FooTable.Table#"postdraw.ft.table"
								 * @param {jQuery.Event} e - The jQuery.Event object for the event.
								 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
								 */
								return self.raise('postdraw.ft.table');
							});
						});
					});
				});
			}).fail(function(err){
				if (F.is.error(err)){
					console.error('FooTable: unhandled error thrown during a draw operation.', err);
				}
			});
		},
		/**
		 * Executes the specified method with the optional number of parameters on all components and waits for the promise from each to be resolved before executing the next.
		 * @this FooTable.Table
		 * @instance
		 * @protected
		 * @param {boolean} reverse - Whether or not to execute the component methods in the reverse order to what they were registered in.
		 * @param {boolean} enabled - Whether or not to execute the method on enabled components only.
		 * @param {string} methodName - The name of the method to execute.
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any number of additional parameters for the method.
		 * @returns {jQuery.Promise}
		 */
		execute: function(reverse, enabled, methodName, param1, paramN){
			var self = this, args = Array.prototype.slice.call(arguments);
			reverse = args.shift();
			enabled = args.shift();
			var internal = enabled ? F.arr.get(self.components.internal, function(c){ return c.enabled; }) : self.components.internal.slice(0),
				core = enabled ? F.arr.get(self.components.core, function(c){ return c.enabled; }) : self.components.core.slice(0),
				custom = enabled ? F.arr.get(self.components.custom, function(c){ return c.enabled; }) : self.components.custom.slice(0);

			args.unshift(reverse ? custom.reverse() : internal);
			return self._execute.apply(self, args).then(function(){
				args.shift();
				args.unshift(reverse ? core.reverse() : core);
				return self._execute.apply(self, args).then(function(){
					args.shift();
					args.unshift(reverse ? internal.reverse() : custom);
					return self._execute.apply(self, args);
				});
			});
		},
		/**
		 * Executes the specified method with the optional number of parameters on all supplied components waiting for the result of each before executing the next.
		 * @this FooTable.Table
		 * @instance
		 * @private
		 * @param {Array.<FooTable.Component>} components - The components to call the method on.
		 * @param {string} methodName - The name of the method to execute
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any additional parameters for the method.
		 * @returns {jQuery.Promise}
		 */
		_execute: function(components, methodName, param1, paramN){
			if (!components || !components.length) return $.when();
			var self = this, args = Array.prototype.slice.call(arguments),
				component;
			components = args.shift();
			methodName = args.shift();
			component = components.shift();

			if (!F.is.fn(component[methodName]))
				return self._execute.apply(self, [components, methodName].concat(args));

			return $.Deferred(function(d){
				try {
					var result = component[methodName].apply(component, args);
					if (F.is.promise(result)){
						return result.then(d.resolve, d.reject);
					} else {
						d.resolve(result);
					}
				} catch (err) {
					d.reject(err);
				}
			}).then(function(){
				return self._execute.apply(self, [components, methodName].concat(args));
			});
		},
		/**
		 * Listens to the window resize event and performs a check to see if the breakpoint has changed.
		 * @this window
		 * @instance
		 * @private
		 * @fires FooTable.Table#"resize.ft.table"
		 */
		_onWindowResize: function (e) {
			var self = e.data.self;
			if (self._resizeTimeout != null) { clearTimeout(self._resizeTimeout); }
			self._resizeTimeout = setTimeout(function () {
				self._resizeTimeout = null;
				/**
				 * The resize event is raised a short time after window resize operations cease.
				 * @event FooTable.Table#"resize.ft.table"
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
				 */
				self.raise('resize.ft.table').then(function(){
					self.breakpoints.check();
				});
			}, 300);
		}
	});

})(jQuery, FooTable);