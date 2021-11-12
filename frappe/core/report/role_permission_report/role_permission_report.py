# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	filters = frappe._dict(filters or {})
	columns = get_columns(filters)
	data = get_data(filters)
	return columns, data

def get_columns(filters):
	columns = [
		{
			"label": _("Role"),
			"fieldtype": "Link",
			"fieldname": "role",
			"options": "Role",
			"width": 120
		},
		{
			"label": _("DocType"),
			"fieldtype": "Link",
			"fieldname": "parent",
			"options": "DocType",
			"width": 150
		},
		{
			"label": _("Level"),
			"fieldtype": "readonly",
			"fieldname": "permlevel",
			"width": 80
		},
		{
			"label": _("Read"),
			"fieldtype": "readonly",
			"fieldname": "read",
			"width": 80
		},
		{
			"label": _("Write"),
			"fieldtype": "readonly",
			"fieldname": "write",
			"width": 80
		},
		{
			"label": _("Create"),
			"fieldtype": "readonly",
			"fieldname": "create",
			"width": 80
		},
		{
			"label": _("Delete"),
			"fieldtype": "readonly",
			"fieldname": "delete",
			"width": 80
		},
		{
			"label": _("Submit"),
			"fieldtype": "readonly",
			"fieldname": "submit",
			"width": 80
		},
		{
			"label": _("Cancel"),
			"fieldtype": "readonly",
			"fieldname": "cancel",
			"width": 80
		},
		{
			"label": _("Amend"),
			"fieldtype": "readonly",
			"fieldname": "amend",
			"width": 80
		},
		{
			"label": _("Set User Permissions"),
			"fieldtype": "readonly",
			"fieldname": "set_user_permissions",
			"width": 130,
		}
	]

	return columns

def get_conditions(filters):
	conditions = {}

	if filters.role:
		conditions["role"] = filters.role
	
	if filters.parent:
		conditions["parent"] = filters.parent

	return conditions

def get_data(filters):
	conditions = get_conditions(filters)

	perms = frappe.get_all('DocPerm', fields='*', filters=conditions, order_by='role')
	custom_perms = frappe.get_all('Custom DocPerm', fields='*', filters=conditions, order_by='role')

	doctypes_with_custom_perms = set([custom_perm.parent for custom_perm in custom_perms])
	
	for p in perms:
		if p.parent not in doctypes_with_custom_perms:
			custom_perms.append(p)

	return custom_perms
