import frappe

def execute():
	frappe.reload_doc("contacts", "doctype", "contact")
	frappe.db.sql("""
		UPDATE `tabContact`
		SET title = name
	""")
