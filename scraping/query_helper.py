from gensim import corpora, models, similarities
import os, random
from os.path import isfile, join


stoplist_file = "stoplist.txt"


def preprocess_doc(doc, stoplist):
	processed = []
	for word in doc:
		w = word.strip().lower()
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

def make_corpus(subtitles, stoplist):
	documents = []
	for video in subtitles:
		subtitles[video] = subtitles[video].split(' ')
		subtitles[video] = preprocess_doc(subtitles[video], stoplist)
		documents.append(subtitles[video])

	all_tokens = sum(documents, [])
	tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)
	documents = [[word for word in doc if word not in tokens_once] for doc in documents]

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

def tfidf_filtering(query, dictionary, tfidf_model):
	q_tfidf = tfidf_model[dictionary.doc2bow(query)]
	low_score_words = []
	q_tfidf = sorted(q_tfidf, key=lambda item: item[1])

	print len(query)

	for i in range(len(q_tfidf)/5):
		low_score_words.append(dictionary[q_tfidf[i][0]])

	for word in low_score_words:
		query = filter(lambda item: item != word, query)

	print len(query)

	return query

def create_lsi_tfidf_model(dictionary, corpus):
	tfidf = models.TfidfModel(corpus)
	corpus_tfidf = tfidf[corpus]

	lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=15)
	corpus_lsi = lsi[corpus_tfidf]
	index = similarities.MatrixSimilarity(corpus_lsi)

	return tfidf, lsi, index

# used by khan academy scraper directly
def get_top_query_hits(query_file, stoplist_file, subtitles, links):
	stoplist = read_stoplist(stoplist_file)

	# query = preprocess_doc(query, stoplist)
	query = parse_file(query_file, stoplist)

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
		if video[1] > 0.8:
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