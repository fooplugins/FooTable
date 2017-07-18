(function(F){
	// this is used to define the filtering specific properties on column creation
	F.Column.prototype.__export_define__ = function(definition){
		this.stringify = F.checkFnValue(this, definition.stringify, this.stringify);
	};

	// overrides the public define method and replaces it with our own
	F.Column.extend('define', function(definition){
		this._super(definition); // call the base so we don't have to redefine any previously set properties
		this.__export_define__(definition); // then call our own
	});

	/**
	 * @summary Return the supplied value as a string.
	 * @memberof FooTable.Column#
	 * @function stringify
	 * @returns {string}
	 */
	F.Column.prototype.stringify = function(value, options, rowData){
		return value + "";
	};

	if (F.is.defined(F.DateColumn)){
		// override the base method for DateColumns
		F.DateColumn.prototype.stringify = function(value, options, rowData){
			return F.is.object(value) && F.is.boolean(value._isAMomentObject) && value.isValid() ? value.format(this.formatString) : '';
		};
	}

	// override the base method for ObjectColumns
	F.ObjectColumn.prototype.stringify = function(value, options, rowData){
		return F.is.object(value) ? JSON.stringify(value) : "";
	};

	// override the base method for ArrayColumns
	F.ArrayColumn.prototype.stringify = function(value, options, rowData){
		return F.is.array(value) ? JSON.stringify(value) : "";
	};

})(FooTable);