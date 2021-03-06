# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe
import frappe.utils
from frappe.utils.oauth import get_oauth2_authorize_url, login_via_oauth2, login_via_oauth2_id_token
from frappe.integrations.oauth2 import get_token
from werkzeug.datastructures import ImmutableMultiDict
import json

@frappe.whitelist(allow_guest=True)
def login_via_google(code, state):
	login_via_oauth2("google", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def login_via_github(code, state):
	login_via_oauth2("github", code, state)

@frappe.whitelist(allow_guest=True)
def login_via_facebook(code, state):
	login_via_oauth2("facebook", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def login_via_frappe(code, state):
	login_via_oauth2("frappe", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def login_via_office365(code, state):
	login_via_oauth2_id_token("office_365", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def login_via_salesforce(code, state):
	login_via_oauth2("salesforce", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def login_via_fairlogin(code, state):
	login_via_oauth2("fairlogin", code, state, decoder=decoder_compat)

@frappe.whitelist(allow_guest=True)
def get_login_url(redirect_to=None, social_login_key_name="bloomstack"):

	client = frappe.get_cached_doc("OAuth Client", {"app_name": "Frappe"})
	if not redirect_to and client:
		redirect_to = "{0}/api/method/frappe.integrations.oauth2.authorize?client_id={1}&response_type=code&scope=openid&prompt=none&redirect_uri={2}".format(
      		frappe.utils.get_url(), client.get("client_id"), client.get("default_redirect_uri")
    	)

	if redirect_to:
		redirect_to = redirect_to.replace("&amp;", "&")
	return get_oauth2_authorize_url(social_login_key_name, redirect_to)

@frappe.whitelist(allow_guest=True)
def get_token_for_client(grant_type, client_name, redirect_uri, code):
	"""
	:API endpoint to retrieve the client id from client name and call get_token for Oauth Flow
	:param grant_type: one of authorization_code, refresh_token, password.
	:param client_name: Client that you need token for.
	:param redirect_uri: Will be redirected to post recieving the token.
	:param code: one time token generated by aws.
	:returns: Bearer token.
	"""
	clients = frappe.db.get_all('OAuth Client', filters={'app_name': client_name},fields=['client_id'])
	client_id = clients[0].client_id if clients else None
	if not client_id:
		return frappe.AuthenticationError
	form_dict = frappe.request.form.to_dict()
	form_dict["client_id"] = client_id
	form_dict = ImmutableMultiDict(form_dict)
	frappe.request.form = form_dict
	get_token()

@frappe.whitelist(allow_guest=True)
def custom(code, state):
	"""
	Callback for processing code and state for user added providers

	process social login from /api/method/frappe.integrations.custom/<provider>
	"""
	path = frappe.request.path[1:].split("/")
	if len(path) == 4 and path[3]:
		provider = path[3]
		# Validates if provider doctype exists
		if frappe.db.exists("Social Login Key", provider):
			login_via_oauth2(provider, code, state, decoder=decoder_compat)

def decoder_compat(b):
	# https://github.com/litl/rauth/issues/145#issuecomment-31199471
	return json.loads(bytes(b).decode("utf-8"))
