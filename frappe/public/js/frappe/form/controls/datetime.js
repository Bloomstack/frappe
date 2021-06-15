frappe.ui.form.ControlDatetime = frappe.ui.form.ControlDate.extend({
	make_input: function() {
		this._super();
		this.set_date_options();
		this.set_datepicker();
		this.set_t_for_today();
	},
	set_formatted_input: function(value) {
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
		// webformTODO:
		let lang = 'en';
		let sysdefaults = frappe.boot.sysdefaults;

		frappe.boot.user && (lang = frappe.boot.user.language);
		if(!$.fn.datepicker.language[lang]) {
			lang = 'en';
		}

		let date_format = sysdefaults && sysdefaults.date_format ? sysdefaults.date_format : 'yyyy-MM-dd';

		let now_date = new Date();

		this.today_text = __("Now");
		this.date_format = frappe._luxon.defaultDatetimeFormat;
		this.datepicker_options = {
			language: lang,
			autoClose: true,
			todayButton: true,
			dateFormat: date_format,
			startDate: now_date,
			keyboardNav: false,
			timepicker: true,
			timeFormat: "hh:ii:ss",
			onSelect: () => {
				this.$input.trigger('change');
			},
			onShow: () => {
				this.datepicker.$datepicker
					.find('.datepicker--button:visible')
					.text(this.today_text);

				this.update_datepicker_position();
			}
		};
	},
	set_t_for_today: function() {
		var me = this;
		this.$input.on("keydown", function(e) {
			if(e.which===84) { // 84 === t
				if(me.df.fieldtype=='Date') {
					me.set_value(frappe.datetime.nowdate(true));
				} if(me.df.fieldtype=='Datetime') {
					me.set_value(frappe.datetime.now_datetime(false, true));
				} if(me.df.fieldtype=='Time') {
					me.set_value(frappe.datetime.now_time(false, true));
				}
				return false;
			}
		});
	},
	parse: function(value) {
		if (value) {
			value = frappe.datetime.user_to_str(value, false, true);

			if (!frappe.datetime.is_timezone_same(true)) {
				value = frappe.datetime.convert_to_system_tz(value, true, true);
			}

			return value;
		}
	},
	format_for_input: function(value) {
		if (value) {
			if (!frappe.datetime.is_timezone_same(true)) {
				value = frappe.datetime.convert_to_user_tz(value, true, true);
			}

			value = frappe.datetime.str_to_user(value, false, true);
			return value;
		}
		return "";
	},
	validate: function(value) {
		if (value && !frappe.datetime.validate(value, true)) {
			frappe.msgprint(__("DateTime {0} must be in format: {1}", [value, frappe._luxon.defaultDatetimeFormat]));
			return '';
		}
		return value;
	},
	get_now_date: function() {
		return frappe.datetime.now_datetime(true);
	},
	set_description: function() {
		const { description } = this.df;

		if (!description) {
			this.df.description = frappe.boot.time_zone.user_time_zone;
		} else if (!description.includes(frappe.boot.time_zone.user_time_zone)) {
			this.df.description += '<br>' + frappe.boot.time_zone.user_time_zone;
		}

		this._super();
	}
});
