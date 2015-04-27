import requests
import sys
import json

class ObjectCreator:
	'''
	A class intended to make API requests to create topics and links
	'''
	def __init__(self, **kwargs):

		endpoint = kwargs.pop("endpoint", "http://localhost:3000")
		version = kwargs.pop("version", 0)
		self.endpoint = "%s/v/%s/"%(endpoint, version)
		self.version = 0
		print "Created object creator with endpoint: %s"%(self.endpoint)

	def create_topic(self, name, parent_name=None):
		print "Creating topic with name %s and parent %s"%(name, parent_name)
		create_endpoint = "%stopics"%(self.endpoint)
		data = {"parent_name" : parent_name, "name" : name}
		res = requests.post(create_endpoint, params=data)

	def create_link(self, title, url, parent_topic_name):
		print "Creating link. Title: %s, url: %s, parent topic: %s"%(title, url, parent_topic_name)
		create_endpoint = "%slinks"%(self.endpoint)
		data = {"title" : title, "url" : url, "parent_name" : parent_topic_name}
		res = requests.post(create_endpoint, params=data)

	def create_topic_and_links(self, name, parent_name, links):
		'''
		Creates a topic with the specified name under the specified parent.
		Also takes a list of links (represented as dictionaries), and 
		creates and saves each link under the current topic
		'''

		self.create_topic(name, parent_name)
		for link in links:
			title = link["name"]
			url = link["url"]			
			self.create_link(title, url, name)


if __name__ == "__main__":
	o = ObjectCreator(version=1)
	o.create_topic("Version 1 only")
	o.create_link("V1 link.", "www.google.com", "Version 1 only")

