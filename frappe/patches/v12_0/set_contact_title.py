import frappe

def execute():
    frappe.reload_doc("Contacts", "doctype", "Contact")
    contacts = frappe.get_all("Contact",["name","title"])
    for contact in contacts:
        frappe.db.sql("""
                        UPDATE
                            `tab%s`
                        SET
				            contact.title = contact.name
            """% (contact))
