from KhanScraper import get_search_results
from query_helper import get_top_query_hits
from section_text_helper import generate_queries

import json
import roman

def roman_to_int(word):
	num = word.upper()
	validRomanNumerals = ["M", "D", "C", "L", "X", "V", "I"]
	for letter in num:
		if letter not in validRomanNumerals:
			return word

	return roman.fromRoman(num)

def clean_section_name(name):
	cleaned_name = []
	for word in name:
		w = roman_to_int(word)
		if type(w) is not int and not w.isdigit():
			cleaned_name.append(word)

	return ' '.join(cleaned_name)

out_file = open("output.txt", "wb")

algorithm_book_file = "algo.pdf"
toc_stoplist_file = "toc_stoplist.txt"

search_topic = "algorithms"

stoplist_file = "stoplist.txt"

queries = generate_queries(algorithm_book_file, toc_stoplist_file)


for query in queries:
	search_terms = clean_section_name(query["name"])

	parent = clean_section_name(query["parent"])
	q = query["query"]

	links, subs = get_search_results(search_topic, search_topic)
	links2, subs2 = get_search_results(search_topic + ' ' + search_terms,\
		search_topic)

	for link in links2:
		names = [L["name"] for L in links]

		if link["name"] not in names:
			links.append(link)

	subs.update(subs2)

	for link in links:
		link["parent"] = parent
		link["section_name"] = search_terms

	links = get_top_query_hits(q, stoplist_file, subs, links)

	print links

	out_file.write(json.dumps(links, sort_keys=True, indent=4, \
		separators=(',', ': ')))

	out_file.write('\n')

out_file.close()