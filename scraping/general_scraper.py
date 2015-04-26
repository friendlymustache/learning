from KhanScraper import get_search_results
from query_helper import get_top_query_hits
from section_text_helper import generate_queries

import json
import roman

# Convert from a roman numeral to an integer (needed for section headings)
def roman_to_int(word):
	num = word.upper()
	validRomanNumerals = ["M", "D", "C", "L", "X", "V", "I"]
	for letter in num:
		if letter not in validRomanNumerals:
			return word

	return roman.fromRoman(num)

# Parse section names to remove chapter numbers, etc
def clean_section_name(name):
	cleaned_name = []
	for word in name:
		w = roman_to_int(word)
		if type(w) is not int and not w.isdigit():
			cleaned_name.append(word)

	return ' '.join(cleaned_name)


# Define some important files, such as our pdf textbook and stoplist files
out_file = open("output.txt", "wb")

algorithm_book_file = "algo.pdf"
toc_stoplist_file = "toc_stoplist.txt"

stoplist_file = "stoplist.txt"

# Topic we are searching for
search_topic = "algorithms"

# Generate queries from the pdf textbook's table of contents
queries = generate_queries(algorithm_book_file, toc_stoplist_file)

# Loop through each of the sections genereated from the textbook's table of
# contents
for query in queries:
	search_terms = clean_section_name(query["name"])
	parent = clean_section_name(query["parent"])
	q = query["query"]

	# Get video search results from Khan Academy and associated subtitles
	links, subs = get_search_results(search_topic, search_topic)
	links2, subs2 = get_search_results(search_topic + ' ' + search_terms,\
		search_topic)

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
	links = get_top_query_hits(q, stoplist_file, subs, links, 0.75)

	print links

	# Dump all of the links for this topic to a json and output to a file
	out_file.write(json.dumps(links, sort_keys=True, indent=4, \
		separators=(',', ': ')))

	out_file.write('\n')

out_file.close()