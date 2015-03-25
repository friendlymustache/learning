__author__ = 'Vishal'

'''
    Script to search Khan Academy for links to videos about a given topic
    Searches KhanAcademy using their built in search feature
    Usage: python KhanScraper.py [this is what i want to search for]
    Ex: python KhanScraper.py laplace transform
'''

import urllib2
import sys
import json

if len(sys.argv) == 1:
    print "Usage: python KhanScraper.py searchterm"
    quit()

#the following block combines the command line arguments into a url that we can use to search khanacademy.org
x = 2
searchTerm = sys.argv[1]
while x < len(sys.argv):
    searchTerm += "+" + sys.argv[x]
    x += 1
urlToSearch = "https://www.khanacademy.org/search?page_search_query=" +  searchTerm + "&kind=Video"

#now we scan the url for the line that contains our results
baseHTML = urllib2.urlopen(urlToSearch).read().split("\n")
results = ""
for x in baseHTML:
    if x.startswith("        results: "):
        results = x
        break
if results == "":
    print "No results found."
    quit()
#results now has the result block, so we'll parse that

#we're parsing the html in order to get the links to the videos
results = results.split("\"relativeUrl\": \"")
x = 1
maxX = len(results)
videoLinks = []
while x < maxX:
    videoLinks.append("https://www.khanacademy.org" + results[x].split("\", ")[0])
    x += 1
#now videoLinks is an array that stores the links to the video pages
#we loop through these links and get the information for each youtube link
output = []
for x in videoLinks:
    baseHTML = urllib2.urlopen(x.replace(" ", "")).read().split("\n")
    #for each link, we loop through until we find the name and video
    for y in baseHTML:
        if y.startswith("        <meta name=\"title\" content"):
            tempOut = y.split("\"")[3]
        if y.startswith("        <link rel=\"video_src"):
            tOut = {}
            tOut["name"] = tempOut
            tOut["url"] = y.split("\"")[3]
            output.append(tOut)
            #output[tempOut] = y.split("\"")[3]
            #output.append((tempOut, y.split("\"")[3]))
            break

print json.dumps(output, sort_keys=True, indent=4, separators=(',', ': '))
