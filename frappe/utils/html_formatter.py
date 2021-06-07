import frappe
from frappe.utils.html_utils import sanitize_html

@frappe.whitelist()
def format_html(html):
	"""
		Wrapper around sanitize_html to invoke from JS files.
	"""
	return sanitize_html(html, protocols=['cid', 'http', 'https', 'mailto', 'data'])
