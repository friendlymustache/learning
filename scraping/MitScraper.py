__author__ = 'Vishal'

http://search.mit.edu/search?site=ocw&client=mit&output=xml_no_dtd&proxystylesheet=http%3A%2F%2Focw.mit.edu%2Fsearch%2Fgoogle-ocw.xsl&proxyreload=1&as_dt=i&as_q=algorithm+theory%20&as_eq=&as_epq=&sectionlimit=WT%252Ecg_s:Video%20Lectures&requiredfields=WT%252Ecg_s:Video%20Lectures&getfields=*&partialfields=&as_occt=&num=100&oe=utf-8&sort=&btnG=Search&filter=0&q=
if len(sys.argv) == 1:
    print "Usage: python MitScraper.py searchterm"
    quit()

#the following block combines the command line arguments into a url that we can use to search mitopencourseware
x = 2
searchTerm = sys.argv[1]
while x < len(sys.argv):
    searchTerm += "+" + sys.argv[x]
    x += 1
urlPt1 = "http://search.mit.edu/search?site=ocw&client=mit&output=xml_no_dtd&proxystylesheet=http%3A%2F%2Focw.mit.edu%2Fsearch%2Fgoogle-ocw.xsl&proxyreload=1&as_dt=i&as_q="
urlPt2 = "%20&as_eq=&as_epq=&sectionlimit=WT%252Ecg_s:Video%20Lectures&requiredfields=WT%252Ecg_s:Video%20Lectures&getfields=*&partialfields=&as_occt=&num=100&oe=utf-8&sort=&btnG=Search&filter=0&q="
urlToSearch = urlPt1 +  searchTerm + urlPt2

#now we scan the url for the line that contains our results
baseHTML = urllib2.urlopen(urlToSearch).read().split("\n")

