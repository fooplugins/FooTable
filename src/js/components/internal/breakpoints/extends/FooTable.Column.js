(function(F){
	/**
	 * A space delimited string of breakpoint names that specify when the column will be hidden. You can also specify "all" to make a column permanently display in an expandable detail row.
	 * @type {string}
	 * @default null
	 * @example <caption>The below shows how this value would be set</caption>
	 * breakpoints: "md"
	 */
	F.Column.prototype.breakpoints = null;

	F.Column.prototype.__breakpoints_define__ = function(definition){
		this.breakpoints = F.is.emptyString(definition.breakpoints) ? null : definition.breakpoints;
	};

	F.Column.extend('define', function(definition){
		this._super(definition);
		this.__breakpoints_define__(definition);
	});
})(FooTable);