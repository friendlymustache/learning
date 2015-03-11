from scrapy.spider import Spider
from scrapy.http import Request
from scrapy.utils.response import get_base_url

from TocScraper.items import TocscraperItem

import re

class Toc_scraperSpider(Spider):

	name = "Toc_scraper"

	allowed_domains = [
		"ocw.mit.edu",
		"search.mit.edu",
		"barnesandnoble.com"
	]

	# need to pass -a topic=? to use this spider
	def __init__(self, *args, **kwargs):
		super(Toc_scraperSpider, self).__init__(*args, **kwargs)
		self.topic = kwargs['topic'].lower().replace(' ', '+')
		self.items = []
		self.bn_url_1 = "http://www.barnesandnoble.com/w/?ean="
		self.bn_url_2 = "&usri="
		self.start_urls = [
			"http://search.mit.edu/search?site=ocw&client=mit&getfields=*"+
			"&output=xml_no_dtd&proxystylesheet=http%3A%2F%2Focw.mit.edu%2F"+
			"search%2Fgoogle-ocw.xsl&requiredfields=WT%252Ecg_s%3ACourse+Home"+
			"|WT%252Ecg_s%3AResource+Home&sectionlimit=WT%252Ecg_s%3ACourse"+
			"+Home|WT%252Ecg_s%3AResource+Home&as_dt=i&oe=utf-8"+
			"&departmentName=web&filter=0&courseName=&q="+
			self.topic+
			"&btnG.x=0&btnG.y=0"
		]

	def start_requests(self):
		return [Request(self.start_urls[0], callback=self.parse)]

	def parse(self, response):
		all_info = response.selector.xpath('//body').xpath('//div')

		info = ''

		# find the div class id which contains all of the course links info
		for i in all_info:
			if 'filetype' in i.xpath('.//@class').extract():
				info = i.extract()
				break

		# now we use regex to extract the top 3 courses
		get_course_reg = re.compile('class="filetype"><\/span> <a href="http:\/\/ocw\.mit\.edu[-a-z\/0-9]*">')
		course_links = get_course_reg.findall(info)

		front_strip_len = len('class="filetype"></span> <a href="')
		course_links = [i[front_strip_len:] for i in course_links]
		course_links = [str(i[:-2]) for i in course_links]

		course_names = []
		for link in course_links:
			index = str.rfind(link[:-1], '/')
			course_names.append(link[index+1:-1])

		# keep the top 3 courses
		course_links = course_links[:3]
		course_names = course_names[:3]

		# append syllabus to end of each url
		syllabuses = []
		for i in range(len(course_links)):
			syllabuses.append(course_links[i] + "syllabus/")
			syllabuses.append(course_links[i] + "Syllabus/")
			item = TocscraperItem()
			item['topic'] = self.topic
			item['course'] = course_names[i]
			item['current_url'] = course_links[i]
			self.items.append(item)

		for url in syllabuses:
			yield Request(url, callback=self.parse_syllabus)

	def parse_syllabus(self, response):
		if response.status != 404:
			url = response.url

			divs = response.selector.xpath('//div')

			info = ''

			for div in divs:
				id_check = div.xpath('./@id').extract()
				if 'course_inner_section' in id_check:
					info = div.extract()

			isbns = []

			get_isbn_reg = re.compile('ISBN: [0-9]{13}')
			isbns = get_isbn_reg.findall(info)
			isbns = [i[len('ISBN: '):] for i in isbns]

			for item in self.items:
				c_name = item['course']
				if c_name in url:
					item['isbns'] = isbns
					break

			# need barnes and noble url here
			for isbn in isbns:
				url = self.bn_url_1 + str(isbn) + self.bn_url_2 + str(isbn)
				yield Request(url, self.parse_bn_toc)
		else:
			print '404 error for url ' + response.url

	def parse_bn_toc(self, response):
		if response.status != 404:
			url = response.url
			isbn = url[-13:]

			divs = response.selector.xpath('//body').xpath('.//div')

			info = ''

			for i in range(len(divs)-1, 0, -1):
				div = divs[i]
				h3 = div.xpath('.//h3').extract()
				h3 = ''.join(h3)
				if u'Table of' in h3:
					info = div.extract()
					break

			tableofcontents = info[info.find(u'Table of'):]

			# now, for a given textbook/isbn, we have its table of contents

			for item in self.items:
				isbns = item['isbns']
				if isbn in isbns:
					if 'tocs' in item.keys():
						item['tocs'].append(tableofcontents)
					else:
						item['tocs'] = [tableofcontents]

			return self.items