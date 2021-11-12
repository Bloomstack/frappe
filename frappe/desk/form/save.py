# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.desk.form.load import run_onload
from frappe.client import attach_file

@frappe.whitelist()
def savedocs(doc, action):
	"""save / submit / update doclist"""
	try:
		doc = json.loads(doc)

		__unsaved_attachments = doc.pop("__unsaved_attachments", [])
		__rollover_attachments = []
		if doc.get("__rollover_attachments") and doc.get("__rollover_attachments").get("fileid"):
			__rollover_attachments = doc.get("__rollover_attachments").get("fileid")
			doc.pop("__rollover_attachments")
		doc = frappe.get_doc(doc)
		set_local_name(doc)

		# action
		doc.docstatus = {"Save":0, "Submit": 1, "Update": 1, "Cancel": 2}[action]

		if doc.docstatus==1:
			doc.submit()
		else:
			try:
				doc.save()
			except frappe.NameError as e:
				doctype, name, original_exception = e if isinstance(e, tuple) else (doc.doctype or "", doc.name or "", None)
				frappe.msgprint(frappe._("{0} {1} already exists").format(doctype, name))
				raise

		# update recent documents
		run_onload(doc)
		save_attachments(doc, __unsaved_attachments)
		doc.load_from_db()
		send_updated_docs(doc)
		attach_rollover_attachments(doc, __rollover_attachments)
	except Exception:
		frappe.errprint(frappe.utils.get_traceback())
		raise

@frappe.whitelist()
def cancel(doctype=None, name=None, workflow_state_fieldname=None, workflow_state=None):
	"""cancel a doclist"""
	try:
		doc = frappe.get_doc(doctype, name)
		if workflow_state_fieldname and workflow_state:
			doc.set(workflow_state_fieldname, workflow_state)
		doc.cancel()
		send_updated_docs(doc)

	except Exception:
		frappe.errprint(frappe.utils.get_traceback())
		frappe.msgprint(frappe._("Did not cancel"))
		raise

def send_updated_docs(doc):
	from .load import get_docinfo
	get_docinfo(doc)

	d = doc.as_dict()
	if hasattr(doc, 'localname'):
		d["localname"] = doc.localname

	frappe.response.docs.append(d)

def set_local_name(doc):
	def _set_local_name(d):
		if doc.get('__islocal') or d.get('__islocal'):
			d.localname = d.name
			d.name = None

	_set_local_name(doc)
	for child in doc.get_all_children():
		_set_local_name(child)

	if doc.get("__newname"):
		doc.name = doc.get("__newname")

def save_attachments(doc, __unsaved_attachments):
	for attachment in __unsaved_attachments:
		attach_file(
			filename=attachment.get("attachment", {}).get("name"),
			filedata=attachment.get("attachment", {}).get("dataurl"),
			doctype=doc.doctype,
			docname=doc.name,
			docfield=attachment.get("fieldname"),
			is_private=attachment.get("attachment", {}).get("is_private"),
			decode_base64=True
		)

def attach_rollover_attachments(doc, attachments):
	for attachment in attachments:
		filedoc = frappe.get_doc("File", attachment)
		new_filedoc = frappe.copy_doc(filedoc, ignore_no_copy=True)
		new_filedoc.attached_to_doctype = doc.doctype
		new_filedoc.attached_to_name = doc.name
		new_filedoc.save(ignore_permissions=True)
