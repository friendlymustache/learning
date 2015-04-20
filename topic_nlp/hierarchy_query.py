from gensim import corpora, models, similarities
import os, random
from os.path import isfile, join


query_file = "algorithm_query.txt"
stoplist_file = "stoplist.txt"
corpus_location = os.getcwd() + "/../articles/test_data/"


def parse_file(filename, stoplist):
	f = open(filename, 'rb')
	words = []

	for line in f:
		ws = line.split(' ')
		for word in ws:
			w = word.strip().lower()
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


s = open(stoplist_file, 'rb')
stoplist = []
for word in s:
	stoplist.append(word.strip('\n').strip())
s.close()

query = parse_file(query_file, stoplist)
# query = list(set(query))

# out = open('test_out.txt', 'wb')
# out.write('\n'.join(query))

# make corpus & dictionary given folder of files
dictionary, corpus = make_corpus(corpus_location, stoplist)

# load in corpus & dictionary
# dictionary = corpora.Dictionary.load('./hierarchy_dict.dict')
# corpus = corpora.MmCorpus('./hierarchy_corpus.mm')

tfidf = models.TfidfModel(corpus)
corpus_tfidf = tfidf[corpus]

lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=15)
corpus_lsi = lsi[corpus_tfidf]
index = similarities.MatrixSimilarity(corpus_lsi)


# tfidf filtering

q_tfidf = tfidf[dictionary.doc2bow(query)]
low_score_words = []
q_tfidf = sorted(q_tfidf, key=lambda item: item[1])

print len(query)

for i in range(len(q_tfidf)/5):
	low_score_words.append(dictionary[q_tfidf[i][0]])

for word in low_score_words:
	# print word
	query = filter(lambda item: item != word, query)

print len(query)


query_lsi = lsi[dictionary.doc2bow(query)]
sims = index[query_lsi]
sims = sorted(enumerate(sims), key=lambda item: -item[1])
print(sims)
