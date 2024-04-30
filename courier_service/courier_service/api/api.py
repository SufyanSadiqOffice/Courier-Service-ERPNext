


import frappe
from frappe.model.mapper import get_mapped_doc



@frappe.whitelist()
def get_address(customer):
    add = []
    add_list = frappe.get_list('Dynamic Link',
                    filters = {
                        'parenttype' : 'Address',
                        'link_name' : customer, 
                    }, fields = ['parent'],
                    ignore_permissions = True)
    if add_list:
        for x in add_list :
            add.append(x.parent)
        return add


@frappe.whitelist()
def get_cities(country) :
    city = []
    # frappe.msgprint(1)
    city_list = frappe.get_list('City',
                    filters = {
                        'country' : country,
                    },fields = ['name'],
                    ignore_permissions = True)
    if city_list:
        for x in city_list :
            city.append(x.name)
        return city


@frappe.whitelist()
def get_postal_codes(country) :
    postal_codes = []
    postal_codes_list = frappe.get_list('Postal Codes',
                    filters = {
                        # 'city' : city,
                        'country' : country,
                    },fields = ['name'],
                    ignore_permissions = True)
    if postal_codes_list:
        for x in postal_codes_list :
            postal_codes.append(x.name)
        return postal_codes
    

@frappe.whitelist()
def get_icris_accounts(customer) :
    cust = frappe.get_doc('Customer',customer)
    icris_accounts = []
    for account in cust.icris_account :
        icris_accounts.append(account.icris_account)
    
    return icris_accounts    



@frappe.whitelist()
def get_service_types(customer) :
    cust = frappe.get_doc('Customer',customer)
    service_types = []
    for account in cust.service_types :
        service_types.append(account.service_type)
    
    return service_types   



@frappe.whitelist()
def get_email_table(email_id):
    cont = []
    email_list = frappe.get_list('Contact Email',
                    filters = {
                        'parenttype' : 'Contact',
                        'email_id' : email_id, 
                    }, fields = ['parent'],
                    ignore_permissions = True)
    if email_list:
        for x in email_list :
            cont.append(x.parent)
        return cont
        


@frappe.whitelist()
def get_customer(contact):
    cust_list_1 = []
    cont_doc = frappe.get_doc('Contact',contact)
    for y in cont_doc.links :
        cust_list_1.append(y.link_name)

    cust_list = tuple(cust_list_1)

    return cust_list
        
        
@frappe.whitelist()
def get_customer_doc(customer):
    cust = frappe.get_doc('Customer',customer)
    # frappe.msgprint(str(cust.name))
    name = cust.name
    return name




@frappe.whitelist()
def ic_label(add_charge_type,add_charge_check):
    add_charge_doc = frappe.get_doc('Additional Charges',add_charge_type)
    return add_charge_doc.amount
        


@frappe.whitelist()
def duty_tax(add_charge_type , impexp):
    add_charge_doc = frappe.get_doc('Additional Charges',add_charge_type)
    if impexp == 'Import' :
        return add_charge_doc.import_amount
    elif impexp == 'Export' :
        return add_charge_doc.export_amount       
                


@frappe.whitelist()
def area(add_charge_type, weight):
    add_charge_doc = frappe.get_doc('Additional Charges',add_charge_type)
    amount_per_kg = float(add_charge_doc.amount_per_kg)
    weight = float(weight)
    w = amount_per_kg * weight
    
    return max(add_charge_doc.amount_per_shipment, w)

        

@frappe.whitelist()
def add_handling( add_charge_type ,name) :
    add_charge_doc = frappe.get_doc('Additional Charges',add_charge_type)
    booking_doc = frappe.get_doc('Booking',name)
    # frappe.msgprint(str(booking_doc.name))

    actual_weight = 0
    no_of_pkg_for_avg = 0
    single_pkg_no = 0
    avg = 0
    for row in booking_doc.parcel_information :
        pkg_doc = frappe.get_doc("Package Types",row.packaging_type)
        if pkg_doc.package == 1 :
            no_of_pkg_for_avg = no_of_pkg_for_avg + row.total_identical_parcels
            actual_weight = actual_weight + row.actual_weight
            if row.actual_weight_per_parcel > add_charge_doc.max_weight :
                single_pkg_no = single_pkg_no + row.total_identical_parcels


    if no_of_pkg_for_avg > 0 :
        avg = actual_weight / no_of_pkg_for_avg         

    if avg > add_charge_doc.max_avg_weight :
        return max(no_of_pkg_for_avg*add_charge_doc.amount , add_charge_doc.minimum_amount )
    
    else :
        if single_pkg_no > 0 :
            return max(single_pkg_no*add_charge_doc.amount , add_charge_doc.minimum_amount )



@frappe.whitelist()
def make_sales_invoice(source_name, target_doc=None, ignore_permissions=False) :
    doclist = get_mapped_doc(
		"Booking",
		source_name,
		{
			"Booking": {
				"doctype": "Sales Invoice",
				"field_map": {
					"customer": "customer",
				},
				# "validation": {"docstatus": ["=", 1]},
			},
		},
		target_doc,
		ignore_permissions=ignore_permissions,
	)

    return doclist













