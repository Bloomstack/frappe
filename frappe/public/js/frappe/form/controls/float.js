frappe.ui.form.ControlFloat = frappe.ui.form.ControlInt.extend({
	bind_change_event: function() {
		let me = this;
		this.$input && this.$input.on("change", this.change || function(e) {
			me.parse_validate_and_set_in_model(me.get_input_value(), e);
		});

		this.$input && this.$input.on("click", function(e) {
			me.set_formatted_input(me.get_input_value(), false);
		})

		this.$input && this.$input.on("blur", function(e) {
			me.set_formatted_input(me.get_input_value(), true);
		})
	},

	parse: function(value) {
		value = this.eval_expression(value);
		return isNaN(parseFloat(value)) ? null : flt(value, this.get_precision());
	},

	format_for_input: function(value, label) {
		let number_format = this.df.fieldtype==="Float" && this.df.options && this.df.options.trim() ? this.get_number_format() : null;
		let formatted_value = format_number(value, number_format, label ? this.get_display_precision(): this.get_precision());

		return isNaN(parseFloat(value)) ? "" : formatted_value;
	},

	get_number_format: function() {
		var currency = frappe.meta.get_field_currency(this.df, this.get_doc());
		return get_number_format(currency);
	},

	get_precision: function() {
		// round based on field precision or float precision, else don't round
		return this.df.precision || cint(frappe.boot.sysdefaults.float_precision, null);
	},

	get_display_precision: function() {
		// round based on field precision or display float precision, else don't round
		return this.df.precision || cint(frappe.boot.sysdefaults.display_float_precision, null);
	},

	set_formatted_input: function(value, label=true) {
		this.$input && this.$input.val(this.format_for_input(value, label));
	}
});

frappe.ui.form.ControlPercent = frappe.ui.form.ControlFloat;
