// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

import * as luxon from "luxon";
frappe.provide('frappe.datetime');
frappe.provide('frappe.luxon');
frappe.provide('frappe._luxon');

frappe.luxon = luxon;
frappe._luxon.defaultDateFormat = "yyyy-MM-dd";
frappe._luxon.defaultDateFormat = "yyyy-MM-dd";
frappe._luxon.defaultTimeFormat = "HH:mm:ss";
frappe._luxon.defaultDatetimeFormat = frappe._luxon.defaultDateFormat + " " + frappe._luxon.defaultTimeFormat;

frappe.defaultDateFormat = "YYYY-MM-DD";
frappe.defaultTimeFormat = "HH:mm:ss";
frappe.defaultDatetimeFormat = frappe.defaultDateFormat + " " + frappe.defaultTimeFormat;
moment.defaultFormat = frappe.defaultDateFormat;


$.extend(frappe.datetime, {
	get_luxon_map: function(fmt) {
		return {
			"yyyy-mm-dd": "yyyy-MM-dd",
			"dd-mm-yyyy": "dd-MM-yyyy",
			"dd/mm/yyyy": "dd/MM/yyyy",
			"dd.mm.yyyy": "dd.MM.yyyy",
			"mm/dd/yyyy": "MM/dd/yyyy",
			"mm-dd-yyyy": "MM-dd-yyyy"
		}[fmt];
	},

	convert_to_user_tz: function(date, format=true, luxon=false) {
		// format defaults to true
		if (luxon) {
			return frappe.datetime._convert_to_user_tz(date, format);
		}

		let date_obj = null;

		if (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone && frappe.boot.time_zone.system_time_zone) {
			date_obj = moment.tz(date, frappe.boot.time_zone.system_time_zone).tz(frappe.boot.time_zone.user_time_zone);
 		} else {
			date_obj = moment(date);
		}

		return format ? date_obj.format(frappe.defaultDatetimeFormat) : date_obj;
	},

	_convert_to_user_tz: function(date, format=true) {
		// luxon based fn
		let date_obj = null;

		if (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone && frappe.boot.time_zone.system_time_zone) {
			date_obj = frappe.luxon.DateTime.fromFormat(date, frappe._luxon.defaultDatetimeFormat, {
				zone: frappe.boot.time_zone.system_time_zone
			}).setZone(frappe.boot.time_zone.user_time_zone);
		} else {
			date_obj = frappe.luxon.DateTime.fromFormat(date, frappe._luxon.defaultDatetimeFormat);
		}

		return format ? date_obj.toFormat(frappe._luxon.defaultDatetimeFormat) : date_obj;
	},

	convert_to_system_tz: function(date, format=true, luxon=false) {
		// format defaults to true
		if (luxon) {
			return frappe.datetime._convert_to_system_tz(date, format);
		}

		let date_obj = null;

		if (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone && frappe.boot.time_zone.system_time_zone) {
			date_obj = moment.tz(date, frappe.boot.time_zone.user_time_zone).tz(frappe.boot.time_zone.system_time_zone);
		} else {
			date_obj = moment(date);
		}

		return format ? date_obj.format(frappe.defaultDatetimeFormat) : date_obj;
	},

	_convert_to_system_tz: function(date, format=true) {
		// luxon based fn
		let date_obj = null;

		if (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone && frappe.boot.time_zone.system_time_zone) {
			date_obj = frappe.luxon.DateTime.fromFormat(date, frappe._luxon.defaultDatetimeFormat, {
				zone: frappe.boot.time_zone.user_time_zone
			}).setZone(frappe.boot.time_zone.system_time_zone);
		} else {
			date_obj = frappe.luxon.DateTime.fromFormat(date, frappe._luxon.defaultDatetimeFormat);
		}

		return format ? date_obj.toFormat(frappe._luxon.defaultDatetimeFormat) : date_obj;
	},

	is_timezone_same: function(luxon=false) {
		if (luxon) {
			return frappe.datetime._is_timezone_same();
		}

		if (frappe.boot.time_zone && frappe.boot.time_zone.system_time_zone && frappe.boot.time_zone.user_time_zone) {
			return moment().tz(frappe.boot.time_zone.system_time_zone).utcOffset() === moment().tz(frappe.boot.time_zone.user_time_zone).utcOffset();
		} else {
			return true;
		}
	},

	_is_timezone_same: function() {
		// luxon based fn
		if (frappe.boot.time_zone && frappe.boot.time_zone.system_time_zone && frappe.boot.time_zone.user_time_zone) {
			return frappe.luxon.DateTime.now().setZone(frappe.boot.time_zone.system_time_zone).offset === frappe.luxon.DateTime.now().setZone(frappe.boot.time_zone.user_time_zone).offset
		} else {
			return true;
		}
	},

	str_to_obj: function(d, luxon=false) {
		if (luxon) {
			return frappe.datetime._str_to_obj(d);
		}

		return moment(d, frappe.defaultDatetimeFormat)._d;
	},

	_str_to_obj: function(d) {
		// luxon based fn
		return frappe.luxon.DateTime.fromFormat(d, frappe._luxon.defaultDatetimeFormat);
	},

	obj_to_str: function(d, luxon=false) {
		if (luxon) {
			return frappe.datetime._str_to_obj(d);
		}

		return moment(d).locale("en").format();
	},

	_obj_to_str: function(d) {
		// luxon based fn
		return frappe.luxon.DateTime.toFormat(d, frappe._luxon.defaultDateFormat);
	},

	obj_to_user: function(d, luxon=false) {
		if (luxon) {
			return frappe.datetime._obj_to_user(d);
		}

		return moment(d).format(frappe.datetime.get_user_fmt().toUpperCase());
	},

	_obj_to_user: function(d) {
		// luxon based fn
		let user_fmt = frappe.datetime.get_user_fmt();
		user_fmt = frappe.datetime.get_luxon_map(user_fmt);

		return frappe.luxon.DateTime.toFormat(d, user_fmt);
	},

	get_diff: function(d1, d2, luxon=false) {
		if (luxon) {
			return frappe.datetime._obj_to_user(d);
		}

		return moment(d1).diff(d2, "days");
	},

	get_hour_diff: function(d1, d2) {
		return moment(d1).diff(d2, "hours");
	},

	get_day_diff: function(d1, d2) {
		return moment(d1).diff(d2, "days");
	},

	add_days: function(d, days) {
		return moment(d).add(days, "days").format();
	},

	add_months: function(d, months) {
		return moment(d).add(months, "months").format();
	},

	week_start: function() {
		return moment().startOf("week").format();
	},

	week_end: function() {
		return moment().endOf("week").format();
	},

	month_start: function() {
		return moment().startOf("month").format();
	},

	month_end: function() {
		return moment().endOf("month").format();
	},

	year_start: function(){
		return moment().startOf("year").format();
	},

	year_end: function(){
		return moment().endOf("year").format();
	},

	get_user_fmt: function() {
		return frappe.sys_defaults && frappe.sys_defaults.date_format || "yyyy-mm-dd";
	},

	str_to_user: function(val, only_time=false, luxon=false) {
		if (!val) return "";

		if (luxon) {
			return frappe.datetime._str_to_user(val, only_time);
		}

		if (only_time) {
			return moment(val, frappe.defaultTimeFormat)
				.format(frappe.defaultTimeFormat);
		}

		let user_fmt = frappe.datetime.get_user_fmt().toUpperCase();
		if (typeof val !== "string" || val.indexOf(" ")===-1) {
			return moment(val).format(user_fmt);
		} else {
			return moment(val, "YYYY-MM-DD HH:mm:ss").format(user_fmt + " HH:mm:ss");
		}
	},

	_str_to_user: function(val, only_time) {
		if (!val) return "";

		if (only_time) {
			return frappe.luxon.DateTime.fromFormat(val, frappe._luxon.defaultTimeFormat);
		}

		let user_fmt = frappe.datetime.get_luxon_map(frappe.datetime.get_user_fmt());

		if (typeof val !== "string" || val.indexOf(" ")===-1) {
			return frappe.luxon.DateTime.toFormat(system_fmt + " HH:mm:ss")
		} else {
			return frappe.luxon.DateTime.fromFormat(val, frappe._luxon.defaultDatetimeFormat).toFormat(user_fmt + " HH:mm:ss");
		}
	},

	get_datetime_as_string: function(d) {
		return moment(d).format("YYYY-MM-DD HH:mm:ss");
	},

	user_to_str: function(val, only_time=false, luxon=false) {
		if (luxon) {
			return frappe.datetime._user_to_str(val, only_time);
		}

		if(only_time) {
			return moment(val, frappe.defaultTimeFormat)
				.format(frappe.defaultTimeFormat);
		}

		let user_fmt = frappe.datetime.get_luxon_map(frappe.datetime.get_user_fmt());
		let system_fmt = "YYYY-MM-DD";

		if(val.indexOf(" ")!==-1) {
			user_fmt += " HH:mm:ss";
			system_fmt += " HH:mm:ss";
		}

		// user_fmt.replace("YYYY", "YY")? user might only input 2 digits of the year, which should also be parsed
		return moment(val, [user_fmt.replace("YYYY", "YY"),
			user_fmt]).locale("en").format(system_fmt);
	},

	_user_to_str: function(val, only_time=false) {

		if (only_time) {
			return frappe.luxon.DateTime.fromFormat(val, frappe._luxon.defaultTimeFormat);
		}

		let user_fmt = frappe.datetime.get_luxon_map(frappe.datetime.get_user_fmt());
		let system_fmt = frappe._luxon.defaultDateFormat;

		if (val.indexOf(" ")!==-1) {
			user_fmt += " HH:mm:ss";
			system_fmt += " HH:mm:ss";
		}

		return frappe.luxon.DateTime.fromFormat(val, user_fmt).toFormat(system_fmt);
	},

	user_to_obj: function(d) {
		return frappe.datetime.str_to_obj(frappe.datetime.user_to_str(d));
	},

	global_date_format: function(d) {
		var m = moment(d);
		if(m._f && m._f.indexOf("HH")!== -1) {
			return m.format("Do MMMM YYYY, h:mma")
		} else {
			return m.format('Do MMMM YYYY');
		}
	},

	now_date: function(as_obj=false, luxon=false) {
		return frappe.datetime._date(luxon ? frappe._luxon.defaultDateFormat : frappe.defaultDateFormat, as_obj, luxon);
	},

	now_time: function(as_obj=false, luxon=false) {
		return frappe.datetime._date(luxon ? frappe._luxon.defaultTimeFormat : frappe.defaultTimeFormat, as_obj, luxon);
	},

	now_datetime: function(as_obj=false, luxon=false) {
		return frappe.datetime._date(luxon ? frappe._luxon.defaultDatetimeFormat : frappe.defaultDatetimeFormat, as_obj, luxon);
	},

	_date: function(format, as_obj=false, luxon=false) {
		if (luxon) {
			return frappe.datetime.__date(format, as_obj);
		}

		const time_zone = (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone) || (frappe.sys_defaults && frappe.boot.time_zone.system_time_zone);
		let date = time_zone ? moment.tz(time_zone) : moment();

		return as_obj ? frappe.datetime.moment_to_date_obj(date) : date.format(format);
	},

	__date: function(format, as_obj=false) {
		// luxon based fn
		const time_zone = (frappe.boot.time_zone && frappe.boot.time_zone.user_time_zone) || (frappe.sys_defaults && frappe.boot.time_zone.system_time_zone);
		let date = time_zone ? frappe.luxon.DateTime.now().setZone(time_zone) : frappe.luxon.DateTime.now();

		return as_obj ? frappe.datetime.luxon_to_date_obj(date) : date.toFormat(format);
	},

	moment_to_date_obj: function(moment) {
		const date_obj = new Date();
		const date_array = moment.toArray();
		date_obj.setFullYear(date_array[0]);
		date_obj.setMonth(date_array[1]);
		date_obj.setDate(date_array[2]);
		date_obj.setHours(date_array[3]);
		date_obj.setMinutes(date_array[4]);
		date_obj.setSeconds(date_array[5]);
		date_obj.setMilliseconds(date_array[6]);
		return date_obj;
	},

	luxon_to_date_obj: function(date) {
		// luxon based fn
		const date_obj = new Date();
		date_obj.setFullYear(date.year);
		date_obj.setMonth(date.month);
		date_obj.setDate(date.day);
		date_obj.setHours(date.hour);
		date_obj.setMinutes(date.minute);
		date_obj.setSeconds(date.second);
		date_obj.setMilliseconds(date.millisecond);
		return date_obj;
	},

	nowdate: function(luxon=false) {
		return frappe.datetime.now_date(false, luxon);
	},

	get_today: function(luxon=false) {
		return frappe.datetime.now_date(false, luxon);
	},

	get_time: (timestamp) => {
		// return time with AM/PM
		return moment(timestamp).format('hh:mm A');
	},

	validate: function(d, luxon=false) {
		if (luxon) {
			return frappe.datetime._validate(d);
		}

		return moment(d, [
			frappe.defaultDateFormat,
			frappe.defaultDatetimeFormat,
			frappe.defaultTimeFormat
		], true).isValid();
	},

	_validate: function(d) {
		let _d = null;
		let user_fmt = frappe.datetime.get_luxon_map(frappe.datetime.get_user_fmt());
		let system_fmt = frappe._luxon.defaultDateFormat;

		if(d.indexOf(" ") !== -1) {
			user_fmt += " HH:mm:ss";
			system_fmt += " HH:mm:ss";
		}

		for (let format of [user_fmt, system_fmt]) {
			_d = frappe.luxon.DateTime.fromFormat(d, format);
			if (!_d.invalid) {
				return true;
			}
		}

		return false;
	},
});

// Proxy for dateutil and get_today
Object.defineProperties(window, {
	'dateutil': {
		get: function() {
			console.warn('Please use `frappe.datetime` instead of `dateutil`. It will be deprecated soon.');
			return frappe.datetime;
		}
	},
	'date': {
		get: function() {
			console.warn('Please use `frappe.datetime` instead of `date`. It will be deprecated soon.');
			return frappe.datetime;
		}
	},
	'get_today': {
		get: function() {
			console.warn('Please use `frappe.datetime.get_today` instead of `get_today`. It will be deprecated soon.');
			return frappe.datetime.get_today;
		}
	}
});
