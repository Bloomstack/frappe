frappe.ui.form.ControlCurrency = frappe.ui.form.ControlFloat.extend({
	format_for_input: function(value, label) {
		let formatted_value = format_number(value, this.get_number_format(), label ? this.get_display_precision(): this.get_precision());
		return isNaN(parseFloat(value)) ? "" : formatted_value;
	},

	get_precision: function() {
		// round based on field precision or float precision, else don't round
		return this.df.precision || cint(frappe.boot.sysdefaults.currency_precision || 2, null);
	},

	get_display_precision: function() {
		// round based on field precision or display float precision, else don't round
		return this.df.display_precision || cint(frappe.boot.sysdefaults.display_currency_precision || 2, null);
	},
});
