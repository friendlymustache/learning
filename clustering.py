## My approach: Cluster articles together based on similarity to determine 'topics'
## Vansh's approach: Match articles to the hierarchy of topics obtained from a textbook

TFIDF_FNAME = 'tfidf_model.mm'

import logging, gensim, bz2
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.WARNING)

import glob
import os
from gensim.models.tfidfmodel import TfidfModel
from gensim.corpora.dictionary import Dictionary
from gensim.corpora.textcorpus import TextCorpus
from gensim.corpora.mmcorpus import MmCorpus
import pprint
import copy 
from gensim.models import VocabTransform
import pdb

## Helper functions/constants


def getDocs():
	os.chdir("articles")
	output = []
	for fname in glob.glob("*.txt"):
		output.append(fname)
	return output

def buildCorpus(docs, saveFile):
	f =  open(saveFile, 'w')
	for doc in docs:
		for line in doc:
			f.write(line)
	f.close()


def getWords(fname):
	f = open(fname)
	result = f.read()
	f.close()
	return result.split()

class Corpus(TextCorpus):
	def get_texts(self):
		return map(getWords, self.input)	

docs = getDocs()
# tfidf = TfidfModel(docs)
# print "Built TFIDF model on corpus"
dictionary = Dictionary(map(getWords, docs))


# filter the dictionary
old_dict = dictionary
new_dict = copy.deepcopy(old_dict)
new_dict.filter_extremes()

# now transform the corpus
corpus = Corpus(docs)
old2new = {old_dict.token2id[token]:new_id for new_id, token in new_dict.iteritems()}
vt = VocabTransform(old2new)
MmCorpus.serialize(TFIDF_FNAME, vt[corpus], id2word=new_dict)






# corpus = Corpus(docs)
# tfidf = TfidfModel(corpus)
# tfidf.save(TFIDF_FNAME)

# MmCorpus.serialize(TFIDF_FNAME, corpus)
mm = gensim.corpora.MmCorpus(TFIDF_FNAME)
# print mm
id2word = new_dict


print "Running LDA"
# lda = gensim.models.ldamodel.LdaModel(corpus=mm, id2word=id2word, 
#	num_topics=10, update_every=1, chunksize=1000, passes=1)
lda = gensim.models.ldamodel.LdaModel(corpus=mm, 
	id2word=id2word, num_topics=20, iterations=100, chunksize=100)
print "LDA Results: "
topics = lda.print_topics()

# pdb.set_trace()
printer = pprint.PrettyPrinter()
for i in range(lda.num_topics):
	printer.pprint(lda.print_topic(i))
