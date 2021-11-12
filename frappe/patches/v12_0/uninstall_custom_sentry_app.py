import frappe

def execute():
	if "sentry" in frappe.get_installed_apps() and frappe.get_all("DocType", {"name": "Sentry Settings", "Module": "Sentry"}):
		sentry_dsn = frappe.db.get_single_value("Sentry Settings", "sentry_dsn")
		from frappe.installer import remove_app
		remove_app(app_name="sentry", yes=True, no_backup=True)
		frappe.reload_doc("Integrations", "doctype", "Sentry Settings", force=True)
		if sentry_dsn:
			frappe.db.set_value("Sentry Settings", "Sentry Settings", "enabled", 1)
			frappe.db.set_value("Sentry Settings", "Sentry Settings", "sentry_dsn", sentry_dsn)