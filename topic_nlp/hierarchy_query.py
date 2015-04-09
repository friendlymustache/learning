from gensim import corpora, models, similarities
import os, random
from os.path import isfile, join


def parse_file(filename, stoplist):
	f = open(filename, 'rb')
	words = []

	for line in f:
		ws = line.split(' ')
		for word in ws:
			w = word.strip()
			if w != '' and not w.isdigit() and w.isalpha() and \
					w not in stoplist:
				words.append(w)

	f.close()

	return words

def make_corpus(corpus_location, stoplist):
	files = os.listdir(corpus_location)
	corpus_files = [join(corpus_location, f) for f in files \
		if isfile(join(corpus_location, f))]

	for i in range(len(files)):
		print str(i) + ": " + files[i]

	documents = []
	for f in corpus_files:
		doc_words = parse_file(f, stoplist)
		documents.append(doc_words)

	all_tokens = sum(documents, [])
	tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)
	documents = [[word for word in doc if word not in tokens_once] for doc in documents]

	dictionary = corpora.Dictionary(documents)
	dictionary.save('./hierarchy_dict.dict')

	corpus = [dictionary.doc2bow(doc) for doc in documents]
	corpora.MmCorpus.serialize('./hierarchy_corpus.mm', corpus)

	return dictionary, corpus


query_file = "algorithm_query.txt"
stoplist_file = "stoplist.txt"
corpus_location = os.getcwd() + "/../test_data/"

s = open(stoplist_file, 'rb')
stoplist = []
for word in s:
	stoplist.append(word.strip('\n').strip())
s.close()

query = parse_file(query_file, stoplist)
print len(query)

dictionary, corpus = make_corpus(corpus_location, stoplist)
# dictionary = corpora.Dictionary.load('./hierarchy_dict.dict')
# corpus = corpora.MmCorpus('./hierarchy_corpus.mm')

tfidf = models.TfidfModel(corpus)
corpus_tfidf = tfidf[corpus]

lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=10)
corpus_lsi = lsi[corpus_tfidf]
index = similarities.MatrixSimilarity(corpus_lsi)

sample_query = random.sample(query, len(query))
print len(sample_query)
sample_query = dictionary.doc2bow(sample_query)
query_lsi = lsi[sample_query]
sims = index[query_lsi]
sims = sorted(enumerate(sims), key=lambda item: -item[1])
print(sims)