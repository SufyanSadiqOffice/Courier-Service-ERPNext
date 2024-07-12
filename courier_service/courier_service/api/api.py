


import frappe
import json
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
    for account in cust.custom_icris_account :
        icris_accounts.append(account.icris_account)
    
    return icris_accounts    



@frappe.whitelist()
def get_service_types(customer,imp_exp_field) :
    cust = frappe.get_doc('Customer',customer)
    service_types = []

    if imp_exp_field == 'Import' :
        if cust.custom_express_plus == 1 :
            ser_doc = frappe.get_doc("Service Type","Import Express Plus")
            service_types.append(ser_doc.name)
        if cust.custom_express_imp == 1 :
            ser_doc = frappe.get_doc("Service Type","Import Express")
            service_types.append(ser_doc.name)

        if cust.custom_express_saver_imp == 1 :
            ser_doc = frappe.get_doc("Service Type","Import Express Saver")
            service_types.append(ser_doc.name)

        if cust.custom_expedited_imp == 1 :
            ser_doc = frappe.get_doc("Service Type","Import Expedited")
            service_types.append(ser_doc.name)

        if cust.custom_express_freight_imp == 1 :
            ser_doc = frappe.get_doc("Service Type","Import Express Freight")
            service_types.append(ser_doc.name)        

    elif imp_exp_field == 'Export' :
        if cust.custom_express_plus_exp == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Express Plus")
            service_types.append(ser_doc.name)
        if cust.custom_express == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Express")
            service_types.append(ser_doc.name)

        if cust.custom_express_saver == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Express Saver")
            service_types.append(ser_doc.name)

        if cust.custom_expedited == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Expedited")
            service_types.append(ser_doc.name)

        if cust.custom_express_freight == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Express Freight")
            service_types.append(ser_doc.name)   

        if cust.custom_express_freight_midday == 1 :
            ser_doc = frappe.get_doc("Service Type","Export Express Freight Midday")
            service_types.append(ser_doc.name)            

    # for account in cust.service_types :
    #     service_types.append(account.service_type)
    
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



@frappe.whitelist()
def get_credit_balance(customer, company) :

    booking_list = frappe.get_list("Booking",
                    filters={
                        'customer' : customer,
                        'company' : company,
                        'docstatus' : 1
                    }, fields=['name','amount_after_discount'],
                    ignore_permissions = True)

    total_credit_limit = 0
    credit_limit_used = 0
    balance_before_ship = 0

    if booking_list :
        for booking in booking_list :
            credit_limit_used = credit_limit_used + booking.amount_after_discount


    cust_doc = frappe.get_doc('Customer',customer)
    if cust_doc.credit_limits :
        for row in cust_doc.credit_limits :
            if row.company == company :
                total_credit_limit = row.credit_limit
                break


    balance_before_ship = total_credit_limit - credit_limit_used

    if balance_before_ship <= 0 :
        frappe.throw("Customer's Balance Credit Limit is zero.")
            
    else :
        return balance_before_ship
    









@frappe.whitelist()
def get_full_tariff(service_type) :

    full_tariff = []

    full_tariff_list = frappe.db.get_list("Full Tariff",
                       filters={
                           'service_type' : service_type
                       })
    if full_tariff_list:
        for x in full_tariff_list :
            full_tariff.append(x.name)
    
    return full_tariff


@frappe.whitelist()
def first_check_buying_rate(full_tariff , icris_account) :
    full_tariff_doc = frappe.get_doc("Full Tariff",full_tariff)
    rate = []

    if full_tariff_doc.based_on == 'Zone' :
        rate = frappe.db.exists("Buying Rate", 
                        {
                            "service_type" : full_tariff_doc.service_type , 
                            "icris_account" : icris_account , 
                            "based_on" : full_tariff_doc.based_on ,
                            "zone" : full_tariff_doc.zone ,
                            "mode_of_transportation" : full_tariff_doc.mode_of_transportation ,
                            "package_type" : full_tariff_doc.package_type ,
                            "import__export" : full_tariff_doc.import__export ,
                            "valid_from" : full_tariff_doc.valid_from ,
                            "expiry_date" : full_tariff_doc.expiry_date ,

                        })
    else :
        rate = frappe.db.exists("Buying Rate", 
                        {
                            "service_type" : full_tariff_doc.service_type , 
                            "icris_account" : icris_account , 
                            "based_on" : full_tariff_doc.based_on ,
                            "country" : full_tariff_doc.country ,
                            "mode_of_transportation" : full_tariff_doc.mode_of_transportation ,
                            "package_type" : full_tariff_doc.package_type ,
                            "import__export" : full_tariff_doc.import__export ,
                            "valid_from" : full_tariff_doc.valid_from ,
                            "expiry_date" : full_tariff_doc.expiry_date ,

                        })

    if rate :
        return 1
    else :
        return 2




@frappe.whitelist()
def check_for_existing_rate(full_tariff , icris_account , weight_slab , rate_type) :
    
    full_tariff_doc = frappe.get_doc("Full Tariff",full_tariff)
    rate = []

    if full_tariff_doc.based_on == 'Zone' :
        rate = frappe.db.exists(rate_type, 
                        {
                            "service_type" : full_tariff_doc.service_type , 
                            "icris_account" : icris_account , 
                            "based_on" : full_tariff_doc.based_on ,
                            "zone" : full_tariff_doc.zone ,
                            "mode_of_transportation" : full_tariff_doc.mode_of_transportation ,
                            "package_type" : full_tariff_doc.package_type ,
                            "import__export" : full_tariff_doc.import__export ,
                            "valid_from" : full_tariff_doc.valid_from ,
                            "expiry_date" : full_tariff_doc.expiry_date ,

                        })
    else :
        rate = frappe.db.exists(rate_type, 
                        {
                            "service_type" : full_tariff_doc.service_type , 
                            "icris_account" : icris_account , 
                            "based_on" : full_tariff_doc.based_on ,
                            "country" : full_tariff_doc.country ,
                            "mode_of_transportation" : full_tariff_doc.mode_of_transportation ,
                            "package_type" : full_tariff_doc.package_type ,
                            "import__export" : full_tariff_doc.import__export ,
                            "valid_from" : full_tariff_doc.valid_from ,
                            "expiry_date" : full_tariff_doc.expiry_date ,

                        })

    if rate :
        return rate
    else :
        create_rate(full_tariff_doc , icris_account , weight_slab , False, rate_type)
        # return 0
        

@frappe.whitelist()
def create_rate(full_tariff , icris_account , weight_slab , exist , rate_type) :

    weight_slab = json.loads(weight_slab)
    full_tariff_doc = frappe.get_doc("Full Tariff",full_tariff)
    new_sell_rate = frappe.new_doc(rate_type)
    new_sell_rate.icris_account = icris_account
    new_sell_rate.mode_of_transportation = full_tariff_doc.mode_of_transportation
    new_sell_rate.service_type = full_tariff_doc.service_type
    new_sell_rate.package_type = full_tariff_doc.package_type
    new_sell_rate.import__export = full_tariff_doc.import__export
    new_sell_rate.valid_from = full_tariff_doc.valid_from
    new_sell_rate.expiry_date = full_tariff_doc.expiry_date
    new_sell_rate.based_on = full_tariff_doc.based_on
    new_sell_rate.package_rate = full_tariff_doc.package_rate
    new_sell_rate.full_tariff = full_tariff_doc.name

    if full_tariff_doc.based_on == 'Zone' :
        new_sell_rate.zone = full_tariff_doc.zone
    else :    
        new_sell_rate.country = full_tariff_doc.country


    for slab in weight_slab:
        from_weight = slab['from_weight']
        to_weight = slab['to_weight']
        percentage = slab['percentage']

        for rate in new_sell_rate.package_rate:
            if from_weight <= rate.weight <= to_weight:
                rate.rate = rate.rate * (1 - percentage / 100)


    if exist != False :
        frappe.delete_doc(rate_type, exist)

    new_sell_rate.insert()
    frappe.msgprint("Rate Created.")
    # return 0

