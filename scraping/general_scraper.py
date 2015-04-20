from KhanScraper import get_search_results
from query_helper import get_top_query_hits
from section_text_helper import generate_queries

import json

out_file = open("output.txt", "wb")

algorithm_book_file = "algo.pdf"
toc_stoplist_file = "toc_stoplist.txt"

search_topic = "algorithms"

stoplist_file = "stoplist.txt"

queries = generate_queries(algorithm_book_file, toc_stoplist_file)


for query in queries:
	# print 'a'

	# need to clean these up to not include chapter numbers
	search_terms = ' '.join(query["name"][1:])

	parent = query["parent"]
	q = query["query"]

	links, subs = get_search_results(search_topic)
	links2, subs2 = get_search_results(search_topic + ' ' + search_terms)

	for link in links2:
		names = [L["name"] for L in links]

		if link["name"] not in names:
			links.append(link)

	subs.update(subs2)

	print "length of links"
	print len(links)

	for link in links:
		link["parent"] = parent

	links = get_top_query_hits(q, stoplist_file, subs, links)

	print links

	out_file.write(json.dumps(links, sort_keys=True, indent=4, \
		separators=(',', ': ')))

	out_file.write('\n')

out_file.close()