## My approach: Cluster articles together based on similarity to determine 'topics'
## Vansh's approach: Match articles to the hierarchy of topics obtained from a textbook



import logging, gensim, bz2
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.WARNING)

import glob
from gensim.corpora.dictionary import Dictionary
from gensim.corpora.textcorpus import TextCorpus
from gensim.corpora.mmcorpus import MmCorpus
import pprint
import copy 
from gensim.models import VocabTransform

## Helper functions/constants
def getWords(fname):
	f = open(fname)
	result = f.read()
	f.close()
	return result.split()

## Corpus class
class Corpus(TextCorpus):
	def get_texts(self):
		return map(getWords, self.input)

## Clusterer class
class Clusterer:
	def __init__(self, folderName="articles"):
		self.folderName = folderName	
		self.TFIDF_FNAME = 'tfidf_model.mm'

		# Get documents in specified folder and make a corpus
		# out of them
		self.docs = self.getDocs()
		self.corpus = Corpus(self.docs) 
		self.processedCorpus = None

		# Serialize the corpus in the appropriate format
		# for the clustering algorithm
		self.serializeCorpus()

	def getDocs(self):
		'''
		Get a list of the filenames of documents our clusterer
		is going to analyze
		'''
		output = []
		targetFiles = "%s/*.txt"%self.folderName
		for fname in glob.glob(targetFiles):
			output.append(fname)
		return output

	def getDictionaries(self):
		'''
		Get GenSim dictionaries (one describing the raw corpus data and the 
		other describing the corpus data with stop words etc filtered out) 
		'''
		docs = self.getDocs()
		raw_dict = Dictionary(map(getWords, docs))
		filtered_dict = copy.deepcopy(raw_dict)
		filtered_dict.filter_extremes()
		return (raw_dict, filtered_dict)

	def serializeCorpus(self):
		'''
		Serialize the corpus in an appropriate format for 
		the clustering algorithm and stores an object
		representing the result.
		'''
		# Get dicts describing corpuses
		raw_dict, filtered_dict = self.getDictionaries()

		# Make a copy of the mapping of words to IDs represented
		# by the filtered dictionary
		raw_to_filtered = {raw_dict.token2id[token]:new_id for new_id, token in filtered_dict.iteritems()}

		# Set up a transformer object
		vt = VocabTransform(raw_to_filtered)

		# Transform and serialize the corpus
		MmCorpus.serialize(self.TFIDF_FNAME, vt[self.corpus], id2word=filtered_dict)

		# Save a handle to the corpus and the filtered dictionary
		self.filtered_dict = filtered_dict
		self.processedCorpus = gensim.corpora.MmCorpus(self.TFIDF_FNAME)

	def run(self):
		'''		
		Runs LDA clustering algorithm
		'''

		if self.processedCorpus is None:
			self.serializeCorpus()

		print "Running LDA"
		# lda = gensim.models.ldamodel.LdaModel(corpus=mm, id2word=id2word, 
		#	num_topics=10, update_every=1, chunksize=1000, passes=1)
		self.lda = gensim.models.ldamodel.LdaModel(corpus=self.processedCorpus, 
			id2word=self.filtered_dict, num_topics=3, iterations=300, chunksize=100,
			passes=20)

		print "LDA Results: "
		topics = self.lda.print_topics()
		printer = pprint.PrettyPrinter()
		for i in range(self.lda.num_topics):
			printer.pprint(self.lda.print_topic(i))
			print "\n"


	def consolidateDocs(self, docs, saveFile):
		'''
		Writes the contents of multiple files (with filenames specified
		in <docs>) in order to the file with name <saveFile>
		'''
		f =  open(saveFile, 'w')
		for doc in docs:
			for line in doc:
				f.write(line)
		f.close()


if __name__ == "__main__":
	c = Clusterer()
	c.run()