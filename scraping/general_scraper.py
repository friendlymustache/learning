from KhanScraper import get_search_results
from query_helper import get_top_query_hits
from section_text_helper import generate_queries
from ObjectCreator import ObjectCreator

import json
import roman
import sys

FILENAME = "general_scraper.py"

class GeneralScraper: 
	def __init__(self, endpoint, version):
		self.object_creator = ObjectCreator(endpoint=endpoint, version=version)
		self.endpoint = endpoint
		self.version = version

	# Convert from a roman numeral to an integer (needed for section headings)
	def roman_to_int(self, word):
		num = word.upper()
		validRomanNumerals = ["M", "D", "C", "L", "X", "V", "I"]
		for letter in num:
			if letter not in validRomanNumerals:
				return word

		return roman.fromRoman(num)

	# Parse section names to remove chapter numbers, etc
	def clean_section_name(self, name):
		cleaned_name = []
		for word in name:
			w = self.roman_to_int(word)
			if type(w) is not int and not w.isdigit():
				cleaned_name.append(word)

		return ' '.join(cleaned_name)

	def get_topics_and_links(self, book_file, nlp_stoplist, toc_stoplist, topic):
		'''
		Returns a list of dictionaries representing topics. Each topic
		has a name, a parent name, and a list of relevant links (also)

		Parses the provided book file's table of contents to determine 
		different subtopics for the current topic, filtering out 
		subtopics/TOC elements matching any of the words in the 
		file with filename <toc_stoplist>.

		Then searches KhanAcademy for videos matching the provided topic,
		filtering the transcripts of said videos to eliminate words in the
		<nlp_stoplist> file.

		Runs LSA on the text of different sections of the book and video
		transcripts in order to determine which videos are most similar 
		to the contents of a given textbook, keeping only the most similar 
		links.
		'''
		print "Book file: %s, nlp stoplist: %s, toc stoplist: %s, topic: %s"%(book_file, nlp_stoplist, toc_stoplist, topic)

		# Generate queries from the pdf textbook's table of contents
		print "Generating queries from textbook's TOC..."
		queries = generate_queries(book_file, toc_stoplist, topic)
		print "Done"

		# Set up list of topics. The root topic doesn't have any links
		# (we store all links under its subtopics)
		root_topic = {"name" : topic, "parent" : None, "links" : []}
		topics = [root_topic]

		# Loop through each of the sections generated from the textbook's table of
		# contents, adding the links for that section to our output dictionary
		for query in queries:
			search_terms = self.clean_section_name(query["name"])
			parent = query["parent"]

			if parent != topic and len(parent) != 0:
				parent = self.clean_section_name(parent)

			print "Getting links from KA for section %s"%(search_terms)						
			q = query["query"]

			# Get video search results and associated subtitles from Khan Academy
			# First try searching solely for the search topic, then for the 
			# search topic along with the section header
			links, subs = get_search_results(topic, topic)
			links2, subs2 = get_search_results(topic + ' ' + search_terms,\
				topic)

			# Combine the results into one list of dictionaries & subtitles dictionary
			for link in links2:
				names = [L["name"] for L in links]

				if link["name"] not in names:
					links.append(link)

			subs.update(subs2)

			for link in links:
				link["parent"] = parent
				link["section_name"] = search_terms

			# Filter using document similarity techniques with a 0.75 threshold
			links = get_top_query_hits(q, nlp_stoplist, subs, links, 0.75)
			
			# Add the current topic + its links to our list
			new_topic = {"name" : search_terms, "parent" : parent, "links" : links}
			topics.append(new_topic)

		return topics

	def run(self, book_file, nlp_stoplist, toc_stoplist, topic):
		print "Searching Khan Academy for videos on %s, saving results to " \
			"%s version %s"%(topic, self.endpoint, self.version)
		topics = self.get_topics_and_links(book_file, nlp_stoplist, toc_stoplist, topic)

		for topic in topics:
			name = topic["name"]
			parent = topic["parent"]
			links = topic["links"]
			self.object_creator.create_topic_and_links(name, parent, links)


if __name__ == "__main__":
	# Define some important files, such as our pdf textbook and stoplist files
	book_file = "algo.pdf"
	toc_stoplist_file = "toc_stoplist.txt"
	nlp_stoplist_file = "stoplist.txt"

	# Topic we are searching for
	search_topic = "algorithms"

	if len(sys.argv) != 4:
		print "Usage: python %s <%s> <%s> <%s>"%(FILENAME, "topic", "endpoint", "version")
	else:		
		topic = sys.argv[1]
		endpoint = sys.argv[2]
		version = sys.argv[3]

		scraper = GeneralScraper(endpoint, version)
		scraper.run(book_file, nlp_stoplist_file, toc_stoplist_file, search_topic)
