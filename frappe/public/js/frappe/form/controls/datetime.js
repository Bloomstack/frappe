frappe.ui.form.ControlDatetime = frappe.ui.form.ControlDate.extend({
	set_date_options: function() {
		this._super();
		this.today_text = __("Now");
		this.date_format = frappe.defaultDatetimeFormat;
		$.extend(this.datepicker_options, {
			timepicker: true,
			timeFormat: "hh:ii:ss"
		});
	},
	get_now_date: function() {
		return frappe.datetime.now_datetime(true);
	},
	refresh_input: function() {
		this._super();

		let timezone = this.get_timezone();
		if (timezone && this.disp_status != "None") {
			this.set_description(timezone);
		}
	},
	get_timezone: function() {
		return frappe.sys_defaults.time_zone;
	}
});
