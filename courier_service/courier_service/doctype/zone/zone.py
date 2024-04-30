# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Zone(Document):
	# pass
    def before_save(self) :
        if self.is_single_country == 1 :
            self.zone = self.country
            self.name = self.country
    
    
