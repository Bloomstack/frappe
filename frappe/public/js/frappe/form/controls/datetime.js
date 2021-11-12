frappe.ui.form.ControlDatetime = frappe.ui.form.ControlDate.extend({
	set_formatted_input: function(value) {
		if (this.timepicker_only) return;
		if (!this.datepicker) return;
		if (!value) {
			this.datepicker.clear();
			return;
		} else if (value === "Today") {
			value = this.get_now_date();
		}

		this.$input && this.$input.val(this.format_for_input(value));
	},
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
	parse: function(value) {
		if (value) {
			value = frappe.datetime.user_to_str(value, false);

			if (!frappe.datetime.is_system_time_zone()) {
				value = frappe.datetime.convert_to_system_tz(value, true);
			}

			return value;
		}
	},
	format_for_input: function(value) {
		if (!value) return "";

		if (!frappe.datetime.is_system_time_zone()) {
			value = frappe.datetime.convert_to_user_tz(value, true);
		}

		return frappe.datetime.str_to_user(value, false);
	},
	set_description: function() {
		this._super();
		const time_zone = this.get_user_time_zone();
		this.set_new_description(time_zone);
	},
	get_user_time_zone: function() {
		return frappe.boot.time_zone ? frappe.boot.time_zone.user_time_zone : frappe.sys_defaults.time_zone;
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
