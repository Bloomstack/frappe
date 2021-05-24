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
		const { description } = this.df;
		const { time_zone } = frappe.sys_defaults;
		let timezone = null;
		if (!frappe.datetime.is_timezone_same()) {
			if (!description) {
				timezone = time_zone;
			} else if (!description.includes(time_zone)) {
				timezone += '<br>' + time_zone;
			}
		}

		return timezone;
	}
});
