from gensim import corpora, models, similarities
import os, random
from os.path import isfile, join


"""
	Script to perform NLP using gensim to find the most relevant text content
	to a given query document/set of text. Used for semantic searching when
	scraping sites such as KhanAcademy, MIT OCW, etc.
"""


def preprocess_doc(doc, stoplist):
	processed = []
	for word in doc:
		w = word.strip().lower()

		# Only keep words that are fully alphabetic for NLP purposes
		if w != '' and w.isalpha() and w not in stoplist:
			processed.append(word)

	return processed


def parse_file(filename, stoplist):
	f = open(filename, 'rb')
	doc = []

	for line in f:
		doc += line.split(' ')

	f.close()

	return preprocess_doc(doc, stoplist)

"""
Create a corpus from a given set of documents (subtitles) and a stoplist used
to remove unnecessary words. Returns documents, a list of strings, subtitles,
a dictionary keyed by name and containing text, dictionary, and corpus, both of
which are gensim objects used in our NLP.
"""
def make_corpus(subtitles, stoplist):
	documents = []
	for video in subtitles:
		subtitles[video] = subtitles[video].split(' ')
		subtitles[video] = preprocess_doc(subtitles[video], stoplist)
		documents.append(subtitles[video])

    # Create a simple bag of words (basic count of occurrences) model for our
    # documents
	all_tokens = sum(documents, [])
	tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)
	documents = [[word for word in doc if word not in tokens_once] for doc in documents]

	# Save the created dictionary and corpus
	dictionary = corpora.Dictionary(documents)
	dictionary.save('./query_dict.dict')

	corpus = [dictionary.doc2bow(doc) for doc in documents]
	corpora.MmCorpus.serialize('./query_corpus.mm', corpus)

	return documents, subtitles, dictionary, corpus

def read_stoplist(stoplist_file):
	s = open(stoplist_file, 'rb')
	stoplist = []
	for word in s:
		stoplist.append(word.strip('\n').strip())
	s.close()

	return stoplist

"""
Do some TFIDF (term frequency inverse document frequency) filtering. Given a
query string, a dictionary, and a tfidf-model based on the associated corpus,
assigns a tfidf score to each of the words in the query string. Then, remove
the 20 percent of words in the query string that have the lowest tfidf score,
and return our updated query string.
"""
def tfidf_filtering(query, dictionary, tfidf_model):
	q_tfidf = tfidf_model[dictionary.doc2bow(query)]
	low_score_words = []
	q_tfidf = sorted(q_tfidf, key=lambda item: item[1])

	for i in range(len(q_tfidf)/5):
		low_score_words.append(dictionary[q_tfidf[i][0]])

	for word in low_score_words:
		query = filter(lambda item: item != word, query)

	return query

"""
Given a dictionary and corpus, create the lsi (Latent Semantic Indexing) model
based on tfidf scoring, and also create the document similarity index. Returns
the tfidf model, the lsi model, and the index.
"""
def create_lsi_tfidf_model(dictionary, corpus):
	tfidf = models.TfidfModel(corpus)
	corpus_tfidf = tfidf[corpus]

	lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=15)
	corpus_lsi = lsi[corpus_tfidf]
	index = similarities.MatrixSimilarity(corpus_lsi)

	return tfidf, lsi, index


"""
Takes in a query string, path to a stoplist file, dictionary of video subtitles
keyed by name, and a list of dictionaries. The list of dictionaries has three
keys - "topic," the topic name (e.g. 'algorithms'), "name," the name of the
video, and "url," the link to the video.

Then, it creates a dictionary and corpus from the given subtitles, and also
creates a tfidf, lsi, and similarity index. Then, it queries the generated
index using the query string, giving a cosine similarity score to every link
in the "links" list. If the score is over the threshold value, provided as a
parameter, we keep the link and append it to a list of dictionaries that we
eventually return.
"""
def get_top_query_hits(query, stoplist_file, subtitles, links, threshold):
	stoplist = read_stoplist(stoplist_file)

	query = preprocess_doc(query.split(), stoplist)
	# query = parse_file(query_file, stoplist)

	# make corpus & dictionary given folder of files
	documents, subtitles, dictionary, corpus = \
		make_corpus(subtitles, stoplist)

	# load in corpus & dictionary
	# dictionary = corpora.Dictionary.load('./hierarchy_dict.dict')
	# corpus = corpora.MmCorpus('./hierarchy_corpus.mm')

	tfidf, lsi, index = create_lsi_tfidf_model(dictionary, corpus)

	query = tfidf_filtering(query, dictionary, tfidf)

	query_lsi = lsi[dictionary.doc2bow(query)]
	sims = index[query_lsi]
	sims = sorted(enumerate(sims), key=lambda item: -item[1])

	final_links = []

	for video in sims:
		if video[1] > threshold:
			i = video[0]

			count = 0
			name = ''
			for s in subtitles:
				if i == count:
					name = s
					break 
				count += 1

			for link in links:
				if link["name"] == name:
					final_links.append(link)
					break

	return final_links