// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Role Permission Report"] = {
	"filters": [
		{
			fieldname:"role",
			label: __("Role"),
			fieldtype: "Link",
			options: "Role"
		},
		{
			fieldname:"parent",
			label: __("DocType"),
			fieldtype: "Link",
			options: "DocType"
		},
	]
};
