import frappe

def execute():
	frappe.reload_doctype('System Settings')
	doc = frappe.get_single('System Settings')

	doc.float_precision = 9
	doc.currency_precision = 9

	doc.display_float_precision = 2
	doc.display_currency_precision = 2

	doc.flags.ignore_mandatory = True
	doc.flags.ignore_permissions = True

	doc.save()
