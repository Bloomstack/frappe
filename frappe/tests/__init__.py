# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
from werkzeug.wrappers import Request
from werkzeug.test import EnvironBuilder

def set_request(**kwargs):
	builder = EnvironBuilder(**kwargs)
	frappe.local.request = Request(builder.get_environ())

def insert_test_data(doctype, sort_fn=None):
	import frappe.model
	data = get_test_doclist(doctype)
	if sort_fn:
		data = sorted(data, key=sort_fn)

	for doclist in data:
		frappe.insert(doclist)

def get_test_doclist(doctype, name=None):
	"""get test doclist, collection of doclists"""
	import os
	from frappe import conf
	from frappe.modules.utils import peval_doclist
	from frappe.modules import scrub

	doctype = scrub(doctype)
	doctype_path = os.path.join(os.path.dirname(os.path.abspath(conf.__file__)),
		conf.test_data_path, doctype)

	if name:
		with open(os.path.join(doctype_path, scrub(name) + ".json"), 'r') as txtfile:
			doclist = peval_doclist(txtfile.read())

		return doclist

def update_system_settings(args):
	doc = frappe.get_doc('System Settings')
	doc.update(args)
	doc.flags.ignore_mandatory = 1
	doc.save()

def get_system_setting(key):
	return frappe.db.get_single_value("System Settings", key)

global_test_dependencies = ['User']
