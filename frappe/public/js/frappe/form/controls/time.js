frappe.ui.form.ControlTime = frappe.ui.form.ControlData.extend({
	make_input: function() {
		var me = this;
		this._super();
		this.$input.datepicker({
			language: "en",
			timepicker: true,
			onlyTimepicker: true,
			timeFormat: "hh:ii:ss",
			startDate: frappe.datetime.now_time(true),
			onSelect: function() {
				// ignore micro seconds
				if (moment(me.get_value(), 'hh:mm:ss').format('HH:mm:ss') != moment(me.value, 'hh:mm:ss').format('HH:mm:ss')) {
					me.$input.trigger('change');
				}
			},
			onShow: function() {
				$('.datepicker--button:visible').text(__('Now'));
			},
			keyboardNav: false,
			todayButton: true
		});
		this.datepicker = this.$input.data('datepicker');
		this.datepicker.$datepicker
			.find('[data-action="today"]')
			.click(() => {
				this.datepicker.selectDate(frappe.datetime.now_time(true));
			});
		this.refresh();
	},
	set_input: function(value) {
		this._super(value);
		if(value
			&& ((this.last_value && this.last_value !== this.value)
				|| (!this.datepicker.selectedDates.length))) {

			var date_obj = frappe.datetime.moment_to_date_obj(moment(value, 'HH:mm:ss'));
			this.datepicker.selectDate(date_obj);
		}
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
