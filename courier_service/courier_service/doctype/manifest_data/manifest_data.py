# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document
from frappe.utils.file_manager import get_file
import json


class ManifestData(Document):
	def before_submit(self):
		if self.manifest_data:
			filename = self.manifest_data
			dict1 = {}
			name = frappe.db.get("File", {"file_url": self.manifest_data}).name
			content = frappe.get_doc("File", name).get_content()
			arrays = []
			current_row = []
			current_word = ""
			for char in content:
				if char == '\n':
					current_row.append(current_word.strip())
					arrays.append(current_row)
					current_row = []
					current_word = ""
				elif char == ' ' :
					if current_word :
						current_row.append(current_word.strip())
						current_word = ""
				else :
					current_word =  current_word + char

			for row in arrays:
				frappe.msgprint(str(row))	
				