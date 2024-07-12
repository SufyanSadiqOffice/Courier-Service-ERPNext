# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate


class Booking(Document):





	def before_submit(self) :
		if self.customer and self.company :
			credit_limit_used = 0.00
			total_credit_limit = 0.00
			booking_list = frappe.get_list('Booking',
								filters = {
									'customer': self.customer,
									'company': self.company,
									'docstatus': 1
								},
								fields = ['name', 'amount_after_discount']
							)
			if booking_list :
				for booking in booking_list :
					credit_limit_used = credit_limit_used + booking.amount_after_discount
			
			cust_doc = frappe.get_doc('Customer',self.customer)
				
			if cust_doc.credit_limits :
				for row in cust_doc.credit_limits :
					if row.company == self.company :
						total_credit_limit = row.credit_limit 
						break

			balance_before_ship = total_credit_limit - credit_limit_used
			if balance_before_ship <= 0 :
				frappe.throw("Customer's Balance Credit Limit is zero." )
			else : 
				self.balance_credit_limit_before_shipment = balance_before_ship

		if self.amount_after_discount > self.balance_credit_limit_before_shipment :
			frappe.throw("Your credit limit is not enough to make this shipment")
		else :
			self.balance_credit_limit_after_shipment = self.balance_credit_limit_before_shipment - self.amount_after_discount





	def before_save(self):


		self.extended_area_surcharge = 0
		self.remote_area_surcharge = 0
		self.add_handling_charges = 0
		self.lps = 0



		weight_temp = 0.0
		declare_temp = 0.0
		pdl = frappe.get_doc('Package Dimensions Limitation','Package Dimensions Limitation')



		for row in self.parcel_information :

			numbers = [row.length , row.width , row.height ]
			numbers.sort(reverse=True)
			row.length = numbers[0]
			row.width = numbers[1]
			row.height = numbers[2]
			girth = 0

			if row.length > pdl.max_length :
				frappe.throw("Maximum length per package is 270 cm.")

			else :
				girth = (row.width*2) + (row.height*2)
				if (girth + row.length) > pdl.max_girth :
					frappe.throw("Maximum size per package should not be Greater than 400cm in Length and Girth[(2 x width) + (2 x height)] combined.")	



			row.total_weight = row.weight_per_parcel * row.total_identical_parcels
			row.dim_weight = row.length * row.width * row.height / 5000
			row.total_dim_weight =  ( row.length * row.width * row.height / 5000 ) * row.total_identical_parcels
			row.actual_weight_per_parcel = max( row.weight_per_parcel , row.dim_weight )
			row.actual_weight = max( row.total_weight , row.total_dim_weight )


			weight_temp = weight_temp + row.actual_weight
			if row.declare_value :
				declare_temp = declare_temp + row.declare_value
		
		self.total_actual_weight = weight_temp
		self.weight = weight_temp
		self.total_declare_value = declare_temp




		if self.customer and self.company :
			credit_limit_used = 0.00
			total_credit_limit = 0.00
			booking_list = frappe.get_list('Booking',
								filters = {
									'customer': self.customer,
									'company': self.company,
									'docstatus': 1
								},
								fields = ['name', 'amount_after_discount']
							)
			if booking_list :
				for booking in booking_list :
					credit_limit_used = credit_limit_used + booking.amount_after_discount
			
			cust_doc = frappe.get_doc('Customer',self.customer)
				
			if cust_doc.credit_limits :
				for row in cust_doc.credit_limits :
					if row.company == self.company :
						total_credit_limit = row.credit_limit 
						break

			balance_before_ship = total_credit_limit - credit_limit_used
			if balance_before_ship <= 0 :
				frappe.throw("Customer's Balance Credit Limit is zero." )
			else : 
				self.balance_credit_limit_before_shipment = balance_before_ship


		total_add_ch = 0
		max_ovr_lmt = 0
		lps = 0
		add_handling = 0
		ex_area = 0
		rem_area = 0
		sat_del = 0

		if self.ic_label == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Import Control Label')
			if add_charge_doc :
				total_add_ch = total_add_ch + add_charge_doc.amount
				self.ic_label = 1

		if self.return_electronic_label == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Return Electronic Label')
			if add_charge_doc :
				total_add_ch = total_add_ch + add_charge_doc.amount

		if self.shipping_bill_charges == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Shipping Bill Charges')
			if add_charge_doc :
				if self.imp__exp == 'Import' :
					self.sbc = add_charge_doc.import_amount
				elif self.imp__exp == 'Export' :
					self.sbc = add_charge_doc.export_amount  

		if self.duty_tax_forwarding == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Duty & Tax Forwarding')
			if add_charge_doc :
				total_add_ch = total_add_ch + add_charge_doc.amount

		if self.residential_surcharge == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Residential Surcharge')
			if add_charge_doc :
				total_add_ch = total_add_ch + add_charge_doc.amount

		if self.saturday_delivery == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Saturday Delivery')
			if add_charge_doc :
				total_add_ch = total_add_ch + add_charge_doc.amount
				sat_del = add_charge_doc.amount

		if self.direct_delivery == 1 :
			add_charge_doc = frappe.get_doc('Additional Charges','Direct Delivery')
			if add_charge_doc :
				pkg_count = 0
				for x in self.parcel_information :
					pkg = frappe.get_doc('Package Types', x.packaging_type)
					if pkg.package == 1 :
						pkg_count = pkg_count + x.total_identical_parcels
				total_add_ch = total_add_ch + add_charge_doc.amount*pkg_count

		if self.signature_options == 1 :
			if self.select_signature_option == 'Delivery Confirmation Signature' :
				add_charge_doc = frappe.get_doc('Additional Charges','Delivery Confirmation Signature')
				if add_charge_doc :
					total_add_ch = total_add_ch + add_charge_doc.amount
			
			else :
				add_charge_doc = frappe.get_doc('Additional Charges','Delivery Confirmation Adult Signature')
				if add_charge_doc :
					total_add_ch = total_add_ch + add_charge_doc.amount



		# Extended / Remote Area
		dest_postal_code = self.consignee_postal_code
		c_doc = frappe.get_doc("Customer",self.customer)
		pc_list = frappe.get_list('Postal Codes',
						   filters = {
							   'country' : self.consignee_country,
							   'postal_code' : self.consignee_postal_code , 
						   }, ignore_permissions = True
						   , fields=['name'])
						
		if pc_list :
			pc_doc = frappe.get_doc('Postal Codes',pc_list[0].name)
			# pc_doc = frappe.get_doc('Postal Codes',dest_postal_code)
			if pc_doc :
				if pc_doc.area == 'Extended' :
					if c_doc.custom_extended_area_surcharge == 1:
						self.extended_area_surcharge = 1
						add_charge_doc = frappe.get_doc('Additional Charges','Extended Area Surcharge')
						amount_per_kg = float(add_charge_doc.amount_per_kg)
						weight = float(self.weight)
						w = amount_per_kg * weight
						total_add_ch = total_add_ch + max(add_charge_doc.amount_per_shipment, w)
						ex_area = ex_area + max(add_charge_doc.amount_per_shipment, w)

				elif pc_doc.area == 'Remote' :
					if c_doc.custom_remote_area_surcharge == 1:
						self.remote_area_surcharge = 1
						add_charge_doc = frappe.get_doc('Additional Charges','Remote Area Surcharge')
						amount_per_kg = float(add_charge_doc.amount_per_kg)
						weight = float(self.weight)
						w = amount_per_kg * weight
						total_add_ch = total_add_ch + max(add_charge_doc.amount_per_shipment, w)
						rem_area = rem_area + max(add_charge_doc.amount_per_shipment, w)


		# Maximum Over Limit
		if c_doc.custom_over_maximum_limit == 1 :
			add_charge_type = 'Over Maximum Limits Fee'			
			add_charge_doc = frappe.get_doc('Additional Charges', add_charge_type)
			actual_weight = 0
			no_of_pkg_for_avg = 0
			single_pkg_no = 0
			single_pkg_no_for_dim = 0
			avg = 0

			for row in self.parcel_information:
				if row.packaging_type:
					pkg_doc = frappe.get_doc("Package Types", row.packaging_type)
				else:
					frappe.throw("Complete Package Details.")
					
				if pkg_doc.package == 1:
					no_of_pkg_for_avg += row.total_identical_parcels
					actual_weight += row.actual_weight
					if row.actual_weight_per_parcel > add_charge_doc.max_weight:
						single_pkg_no += row.total_identical_parcels
						row.max_over_limit = 1
					elif ( (row.length + ((2 * row.width) + (2 * row.height))) > add_charge_doc.max_length_plus_girth ) or (row.length > add_charge_doc.max_length) :
						single_pkg_no_for_dim += row.total_identical_parcels
						row.max_over_limit = 1

			if single_pkg_no > 0:
				total_add_ch = total_add_ch + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
				self.maximum_over_limit = 1
				max_ovr_lmt = max_ovr_lmt + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
			if single_pkg_no_for_dim > 0:
				total_add_ch = total_add_ch + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
				self.maximum_over_limit = 1
				max_ovr_lmt = max_ovr_lmt + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)


		# LPS
		if c_doc.custom_large_package_surcharge == 1 :
			add_charge_type = 'Large Package Surcharge'
			add_charge_doc = frappe.get_doc('Additional Charges', add_charge_type)
			actual_weight = 0
			no_of_pkg_for_avg = 0
			single_pkg_no = 0
			single_pkg_no_for_dim = 0
			avg = 0
		
			for row in self.parcel_information:
				if row.max_over_limit != 1 :
					if row.packaging_type:
						pkg_doc = frappe.get_doc("Package Types", row.packaging_type)
					else:
						frappe.throw("Complete Package Details.")
						
					if pkg_doc.package == 1:
						no_of_pkg_for_avg += row.total_identical_parcels
						actual_weight += row.actual_weight
						if row.actual_weight_per_parcel > add_charge_doc.max_weight:
							single_pkg_no += row.total_identical_parcels
							row.lps = 1
						elif (row.length + ((2 * row.width) + (2 * row.height))) > add_charge_doc.max_length_plus_girth:
							single_pkg_no_for_dim += row.total_identical_parcels
							row.lps = 1

			if single_pkg_no > 0:
				total_add_ch = total_add_ch + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
				self.lps = 1
				lps = lps + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
			if single_pkg_no_for_dim > 0:
				total_add_ch = total_add_ch + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)
				self.lps = 1
				lps = lps + max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount)




		# Add Handling	
		if c_doc.custom_additional_handling_charges == 1:
			add_charge_doc = frappe.get_doc('Additional Charges','Additional Handling Charges')
			actual_weight = 0
			no_of_pkg_for_avg = 0
			single_pkg_no = 0
			avg = 0
			for row in self.parcel_information :
				if row.max_over_limit != 1 and row.lps != 1 :
					pkg_doc = frappe.get_doc("Package Types",row.packaging_type)
					if pkg_doc.package == 1 :
						no_of_pkg_for_avg = no_of_pkg_for_avg + row.total_identical_parcels
						actual_weight = actual_weight + row.actual_weight
						if (row.actual_weight_per_parcel > add_charge_doc.max_weight) or (row.length > add_charge_doc.max_length) or (row.width > add_charge_doc.max_width) or (row.height > add_charge_doc.max_width) :
							single_pkg_no = single_pkg_no + row.total_identical_parcels
							row.add_handling = 1

			if no_of_pkg_for_avg > 0 :
				avg = actual_weight / no_of_pkg_for_avg         

			if avg > add_charge_doc.max_weight :
				total_add_ch = total_add_ch +  max(no_of_pkg_for_avg*add_charge_doc.amount , add_charge_doc.minimum_amount )
				add_handling = add_handling + max(no_of_pkg_for_avg*add_charge_doc.amount , add_charge_doc.minimum_amount )
				self.add_handling_charges = 1

			else :
					if single_pkg_no > 0 :
						total_add_ch = total_add_ch +  max(single_pkg_no*add_charge_doc.amount , add_charge_doc.minimum_amount )
						add_handling = add_handling + max(no_of_pkg_for_avg*add_charge_doc.amount , add_charge_doc.minimum_amount )
						self.add_handling_charges = 1


			
			
			self.total_additional_charges = total_add_ch


		#Insurance On Declare Value
		if c_doc.custom_insurance_of_declared_value == 1:
			if self.total_declare_value > 0 :
				dec_doc = frappe.get_doc('Additional Charges','Declare Value')
				self.insurance = max((self.total_declare_value * dec_doc.percentage / 100) , dec_doc.minimum_amount)


		# Zone
		if self.imp__exp == 'Export':
			country = frappe.get_list('Country Names',
								filters = {
									'countries': self.consignee_country,
								},
								fields = ['parent'],
								ignore_permissions=True)
			self.zone = country[0].parent if country else None
		else:
			country = frappe.get_list('Country Names',
								filters = {
									'countries': self.consignee_country,
								},
								fields = ['parent'],
								ignore_permissions=True)
			self.zone = country[0].parent if country else None

		# Calculate Rate
		if self.zone and self.weight :
			amount = 0.0
			env_weight = 0.0
			doc_weight = 0.0
			pack_weight = 0.0
			count = 0
			pack_types = set()
			packaging_type_weights = {}
			last_row_rate = {}
			today = nowdate()
			for row in self.parcel_information :
				signal = 0
				country_zone_signal = 0

				rate_list = frappe.get_list('Selling Rate',
								filters={
									'country': self.consignee_country,
									'import__export': self.imp__exp,
									'mode_of_transportation': self.mode_of_transportation,
									'service_type': self.service_type,
									'package_type': row.packaging_type,
									'icris_account' : self.icris_account,
								},fields = ['valid_from','expiry_date','name'],
								order_by='valid_from DESC')
				if rate_list :
					for rate_entry in rate_list:
						if str(rate_entry.valid_from) <= str(today) :
							if rate_entry.expiry_date :
								if str(rate_entry.expiry_date) >= str(today) :
									rate_doc = frappe.get_doc('Selling Rate', rate_entry.name)
									signal = 1
									break
							else :
								rate_doc = frappe.get_doc('Selling Rate', rate_entry.name)
								signal = 1
								break
									
						if signal == 1:		
							for x in rate_doc.package_rate:
								if x.weight >= row.actual_weight_per_parcel:
									amount = amount + (x.rate * row.total_identical_parcels)
									country_zone_signal = 1
									count = 1
									break
								else :
									last_row_rate = x
							if count == 0:
								amount = amount + (last_row_rate.rate * row.total_identical_parcels)
								country_zone_signal = 1

						# else :
						# 	frappe.throw("Selling Rate List for <b>'{}'</b> is not Available for Today's Date to <b>{}</b> in <b>{}</b> through <b>{}</b> with <b>{}</b> service.".format(row.packaging_type, self.imp__exp, self.zone, self.mode_of_transportation, self.service_type))
					

				if country_zone_signal == 0 :
					rate_list = frappe.get_list('Selling Rate',
								filters={
									'zone': self.zone,
									'import__export': self.imp__exp,
									'mode_of_transportation': self.mode_of_transportation,
									'service_type': self.service_type,
									'package_type': row.packaging_type,
									'icris_account' : self.icris_account,
								},fields = ['valid_from','expiry_date','name'],
								order_by='valid_from DESC')
					if rate_list :
						for rate_entry in rate_list:
							if str(rate_entry.valid_from) <= str(today) :
								if rate_entry.expiry_date :
									if str(rate_entry.expiry_date) >= str(today) :
										rate_doc = frappe.get_doc('Selling Rate', rate_entry.name)
										signal = 1
										break
								else :
									rate_doc = frappe.get_doc('Selling Rate', rate_entry.name)
									signal = 1
									break
									
						if signal == 1:		
							for x in rate_doc.package_rate:
								if x.weight >= row.actual_weight_per_parcel:
									amount = amount + (x.rate * row.total_identical_parcels)
									count = 1
									break
								else :
									last_row_rate = x
							if count == 0:
								amount = amount + (last_row_rate.rate * row.total_identical_parcels)
						else :
							frappe.throw("Selling Rate List for <b>'{}'</b> is not Available for Today's Date to <b>{}</b> in <b>{}</b> through <b>{}</b> with <b>{}</b> service.".format(row.packaging_type, self.imp__exp, self.zone, self.mode_of_transportation, self.service_type))
					else :
						frappe.throw("No Selling Rate List Available!")
			
			self.amount = amount	



		# FSC	/  Optional Services
		if self.amount or self.amount==0 :
			# total_opt_ser = 0
			# for row in self.optional_services:
			# 	ser_type = row.optional_services
			# 	opt_ser_doc = frappe.get_doc('Optional Services',ser_type)
			# 	if opt_ser_doc.charge_based_on == 'Amount' :

			# 		if opt_ser_doc.charge_depends_on == 'Per Shipment' :
			# 			row.amount = max(opt_ser_doc.amount, opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 		elif opt_ser_doc.charge_depends_on == 'Per Package' :
			# 			pkg_count = 0
			# 			for x in self.parcel_information :
			# 				pkg = frappe.get_doc('Package Types', x.packaging_type)
			# 				if pkg.package == 1 :
			# 					pkg_count = pkg_count + x.total_identical_parcels
			# 			row.amount = max( (opt_ser_doc.amount*pkg_count) , opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 		elif opt_ser_doc.charge_depends_on == 'Per KG' :		
			# 			row.amount = max( (opt_ser_doc.amount*self.weight) , opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 	elif opt_ser_doc.charge_based_on == 'Percentage' :
			# 		if opt_ser_doc.percentage_on == 'Amount After Discount' :
			# 			row.amount = max((self.amount_after_discount * opt_ser_doc.percentage / 100),opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 		elif opt_ser_doc.percentage_on == 'Amount Before Discount' :			
			# 			row.amount = max((self.amount * opt_ser_doc.percentage / 100),opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 		elif opt_ser_doc.percentage_on == 'Weight' :			
			# 			row.amount = max((self.weight * opt_ser_doc.percentage / 100),opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# 		elif opt_ser_doc.percentage_on == 'Declare Value' :			
			# 			row.amount = max((self.total_declare_value * opt_ser_doc.percentage / 100),opt_ser_doc.minimum_amount)
			# 			total_opt_ser = total_opt_ser + row.amount
			# self.total_optional_service_charges = total_opt_ser
			# self.total_amount_with_services = self.total_optional_service_charges + self.amount


			fsc_doc = frappe.get_doc('Additional Charges','Fuel Surcharge')
			if fsc_doc :
				self.fsc = (self.amount + add_handling + ex_area + rem_area + lps + sat_del + max_ovr_lmt) * fsc_doc.percentage /100.0
			else :
				self.fsc = 0	

			self.freight = self.amount + self.total_additional_charges + self.fsc + self.sbc + self.insurance


			if self.discount_based_on == 'Percentage' :
				self.amount_after_discount = self.freight - (self.freight*self.discount_percentage)/100.0
			elif self.discount_based_on == 'Amount' :
				self.amount_after_discount = self.freight - self.discount_amount

		



		if self.amount_after_discount or self.amount_after_discount==0 :
			self.uls_selling_amount = self.amount_after_discount + self.total_additional_charges
			if self.ups_given_discount_in_percentage or self.ups_given_discount_in_percentage==0:
				self.ups_buying_amount = self.uls_selling_amount - (self.uls_selling_amount*self.ups_given_discount_in_percentage)/100.0



		if self.amount_after_discount > self.balance_credit_limit_before_shipment :
			frappe.throw("Your credit limit is not enough to make this shipment")
		else :
			self.balance_credit_limit_after_shipment = self.balance_credit_limit_before_shipment - self.amount_after_discount
				

		# self.submit()




	def after_insert(self) :
		self.submit()

