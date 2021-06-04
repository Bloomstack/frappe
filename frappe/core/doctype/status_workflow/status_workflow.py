# -*- coding: utf-8 -*-
# Copyright (c) 2021, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json, os
from frappe.utils import nowdate
from frappe import _
from frappe.model.document import Document

class StatusWorkflow(Document):
	def autoname(self):
		self.name = self.document_type+ "-" + self.status

	def validate(self):
		self.validate_standard()
	

	def validate_standard(self):
		if self.is_standard and not frappe.conf.developer_mode:
			frappe.throw(_('Cannot edit Standard Status Workflow. To edit, please disable this and duplicate it'))
