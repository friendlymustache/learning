# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

from scrapy.item import Item, Field


class TocscraperItem(Item):
	topic = Field()
	course = Field()
	isbns = Field()
	tocs = Field()
	current_url = Field()
