frappe.provide('frappe.contacts')

$.extend(frappe.contacts, {
	clear_address_and_contact: function (frm) {
		frm.fields_dict['address_html'] && $(frm.fields_dict['address_html'].wrapper).html("");
		frm.fields_dict['contact_html'] && $(frm.fields_dict['contact_html'].wrapper).html("");
	},

	paginate_address: function (frm) {
		$('div[title="contact_html"]').append("<div class='contact_pagination'><p>Hello</p></div>");
		let no_of_addresses = frm.doc.__onload.addr_list.length;
		let address_per_page = 3;
		let count = Math.ceil(no_of_addresses/address_per_page);
		if($('body').has('.address_pagination').length) {
			$('.address_pagination').empty();
		}
		else {
			$('div[title="address_html"]').append("<div class='address_pagination'></div>");
		}
		for(var i=1; i<=count; i++){
		  $(".address_pagination").append("<div class='page_number'>"+i+"</div>");
		}
		$(".page_number:first-child").addClass('active');
		$("div[data-fieldname='address_html'] .address-box").filter(function(index) {
			return index < address_per_page;
		}).addClass('active');

		$('body').on('click',`.page_number`,function(){
			var page_index = $(this).index();
			var start=page_index*address_per_page;
			$('div[data-fieldname="address_html"] .address-box').removeClass('active');
			$(`.page_number`).removeClass('active');
			$(`.page_number`).eq(page_index).addClass('active');
			for(var j=0;j<address_per_page;j++){
			  $('div[data-fieldname="address_html"] .address-box').eq(start+j).addClass('active');
			}
		});
	},

	paginate_contacts: function (frm) {
		let no_of_contacts = frm.doc.__onload.contact_list.length;
		let contact_per_page = 3;
		let count = Math.ceil(no_of_contacts/contact_per_page);
		if($('body').has('.contact_pagination').length) {
			$('.contact_pagination').empty();
		}
		else {
			$('div[data-fieldname="contact_html"]').append("<div class='contact_pagination'></div>");
		}
		for(var i=1; i<=count; i++){
		  $(".contact_pagination").append("<div class='contact_page_number'>"+i+"</div>");
		}
		$(".contact_page_number:first-child").addClass('active');
		$("div[data-fieldname='contact_html'] .contact-box").filter(function(index) {
			return index < contact_per_page;
		}).addClass('active');

		$('body').on('click',`.contact_page_number`,function(){
			var page_index = $(this).index();
			var start=page_index*contact_per_page;
			$('div[data-fieldname="contact_html"] .contact-box').removeClass('active');
			$(`.contact_page_number`).removeClass('active');
			$(`.contact_page_number`).eq(page_index).addClass('active');
			for(var j=0;j<contact_per_page;j++){
			  $('div[data-fieldname="contact_html"] .contact-box').eq(start+j).addClass('active');
			}
		});
	},

	render_address_and_contact: function (frm) {
		let address_fields = [
			{
				fieldtype: "Data",
				label: "Search Address",
				fieldname: "search_address",
				change: () => {
					if (layout_for_address.get_values().search_address) {
						frappe.call({
							"method": "frappe.contacts.address_and_contact.get_addresses",
							"args":{
								"doc": frm.doc,
								"search_keyword": layout_for_address.get_values().search_address
							},
							callback: function (res) {
								frappe.contacts.clear_address_and_contact(frm);
								if(res.message) {
									frm.doc.__onload.addr_list = res.message
									frappe.contacts.render_address_and_contact(frm);
									frm.refresh_field("address_html")
								}
							}
						})
					}
					else {
						frappe.contacts.render_address_and_contact(frm)
					}
				}
			}
		];
		var layout_for_address = new frappe.ui.FieldGroup({
			body: frm.get_field('address_html').$wrapper,
			fields:address_fields,
		});
		// render address
		if (frm.fields_dict['address_html'] && "addr_list" in frm.doc.__onload) {
			$(frm.fields_dict['address_html'].wrapper)
				.html(frappe.render_template("address_list",
					frm.doc.__onload))
				.find(".btn-address").on("click", function () {
					frappe.new_doc("Address");
				});
				layout_for_address.make();
			}
			
		frappe.contacts.paginate_address(frm);
		$(document).on('click', '.btn-address-link', function () {
			frappe.prompt({
					label: "Link Address",
					fieldname: "address",
					fieldtype: "Link",
					options: "Address",
					reqd: 1,
					get_query: () => {
						let addr_list = frm.doc.__onload.addr_list.map(addr => addr.name);
						return {
							filters: {
								"name": ["not in", addr_list]
							}
						}
					}
				},
				(data) => {
					frappe.call({
						method: "bloomstack_core.utils.link_address_or_contact",
						args: {
							"ref_doctype": "Address",
							"ref_name": data.address,
							"link_doctype": frm.doctype,
							"link_name": frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}, __("Select Address"));
		})

		$(document).on('click', '.address-box a.unlink_address', function () {
			var name = $(this).attr('data_address_name');
			frappe.confirm(
				`Are you sure you want to unlink this address with ${cur_frm.docname}?`,
				function () {
					frappe.call({
						method: "bloomstack_core.utils.unlink_address_or_contact",
						args: {
							"ref_doctype": "Address",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}
			);
		});

		$(document).on('click', '.address-box a.delete_address', function () {
			var name = $(this).attr('data_address_name');
			frappe.confirm(
				`If this address is linked to any other entity in the system, it will instead remove the address from ${cur_frm.docname}.<br><br>
					Are you sure you want to delete this address?`,
				function () {
					frappe.call({
						method: "bloomstack_core.utils.delete_address_or_contact",
						args: {
							"ref_doctype": "Address",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}
			);
		});

		let contact_fields = [
			{
				fieldtype: "Data",
				label: "Search Contact",
				fieldname: "search_contact",
				change: () => {
					if (layout_for_contacts.get_values().search_contact) {
						frappe.call({
							"method": "frappe.contacts.address_and_contact.get_contacts",
							"args":{
								"doc": frm.doc,
								"search_keyword": layout_for_contacts.get_values().search_contact
							},
							callback: function (res) {
								frappe.contacts.clear_address_and_contact(frm);
								if(res.message) {
									frm.doc.__onload.contact_list = res.message
									frappe.contacts.render_address_and_contact(frm);
									frm.refresh_field("contact_html")
								}
							}
						})
					}
					else {
						frappe.contacts.render_address_and_contact(frm)
					}
				}
			}
		];
		var layout_for_contacts = new frappe.ui.FieldGroup({
			body: frm.get_field('contact_html').$wrapper,
			fields: contact_fields,
		});
		// render contact
		if (frm.fields_dict['contact_html'] && "contact_list" in frm.doc.__onload) {
			$(frm.fields_dict['contact_html'].wrapper)
				.html(frappe.render_template("contact_list",
					frm.doc.__onload))
				.find(".btn-contact").on("click", function () {
					frappe.new_doc("Contact");
				}, 
				);
				layout_for_contacts.make()
		}
		frappe.contacts.paginate_contacts(frm);
		$(document).on('click', '.btn-contact-link', function () {
			frappe.prompt({
					label: "Link Contact",
					fieldname: "contact",
					fieldtype: "Link",
					options: "Contact",
					reqd: 1,
					get_query: () => {
						let contact_list = frm.doc.__onload.contact_list.map(contact => contact.name);
						return {
							filters: {
								"name": ["not in", contact_list]
							}
						}
					}
				},
				(data) => {
					frappe.call({
						method: "bloomstack_core.utils.link_address_or_contact",
						args: {
							"ref_doctype": "Contact",
							"ref_name": data.contact,
							"link_doctype": frm.doctype,
							"link_name": frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}, __("Select Contact"));
		});

		$(document).on('click', '.contact-box a.unlink_contact', function () {
			var name = $(this).attr('data_contact_name');
			frappe.confirm(
				`Are you sure you want to unlink this contact with ${cur_frm.docname}?`,
				function () {
					frappe.call({
						method: "bloomstack_core.utils.unlink_address_or_contact",
						args: {
							"ref_doctype": "Contact",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}
			);
		});

		$(document).on('click', '.contact-box a.delete_contact', function () {
			var name = $(this).attr('data_contact_name');
			frappe.confirm(
				`If this contact is linked to any other entity in the system, it will instead remove the contact from ${cur_frm.docname}.<br><br>
							Are you sure you want to delete this contact?`,
				function () {
					frappe.call({
						method: "bloomstack_core.utils.delete_address_or_contact",
						args: {
							"ref_doctype": "Contact",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload()
						}
					})
				}
			);
		});

	}
})