# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Rates(Document):
	
	def before_save(self) :
		if self.expiry_date :
			if str(self.expiry_date) <= str(self.valid_from) :
				frappe.throw("Expiry Date must be greater than Valid From Date")

