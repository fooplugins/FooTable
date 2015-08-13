(function(F){

	/**
	 * The value used by the filtering component during filter operations. Must be a string and can be set using the data-filter-value attribute on the cell itself.
	 * If this is not supplied it is set to the result of the toString method called on the value for the cell. Added by the {@link FooTable.Filtering} component.
	 * @type {string}
	 * @default null
	 */
	F.Cell.prototype.filterValue = null;

	// this is used to define the filtering specific properties on cell creation
	F.Cell.prototype.__filtering_define__ = function(valueOrElement){
		this.filterValue = this.column.filterValue.call(this.column, valueOrElement);
	};

	// this is used to update the filterValue property whenever the cell value is changed
	F.Cell.prototype.__filtering_val__ = function(value){
		if (F.is.defined(value)){
			// set only
			this.filterValue = this.column.filterValue.call(this.column, value);
		}
	};

	// overrides the public define method and replaces it with our own
	F.Cell.extend('define', function(valueOrElement){
		this._super(valueOrElement);
		this.__filtering_define__(valueOrElement);
	});
	// overrides the public val method and replaces it with our own
	F.Cell.extend('val', function(value){
		var val = this._super(value);
		this.__filtering_val__(value);
		return val;
	});
})(FooTable);