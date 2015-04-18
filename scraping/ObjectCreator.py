import requests
import sys
import json

class ObjectCreator:
	'''
	A class intended to make API requests to create topics and links
	'''
	def __init__(self, **kwargs):

		endpoint = kwargs.pop("endpoint", "http://localhost:3000/")
		version = kwargs.pop("version", 0)
		self.endpoint = "%sv/%s/"%(endpoint, version)
		self.version = 0

	def create_topic(self, name, parent_name=None):
		create_endpoint = "%stopics"%(self.endpoint)
		data = {"parent_name" : parent_name, "name" : name}
		res = requests.post(create_endpoint, params=data)

	def create_link(self, title, url, parent_topic_name):
		create_endpoint = "%slinks"%(self.endpoint)
		data = {"title" : title, "url" : url, "parent_name" : parent_topic_name}
		res = requests.post(create_endpoint, params=data)

if __name__ == "__main__":
	o = ObjectCreator(version=1)
	o.create_topic("Version 1 only")
	o.create_link("V1 link.", "www.google.com", "Version 1 only")

