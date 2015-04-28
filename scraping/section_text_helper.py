from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfdevice import PDFDevice
from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams, LTTextBox, LTTextLine, LTFigure, LTImage


# Get all of the text from a given object (pdf page) and return it
def parse_lt_objs (lt_objs, page_number, text=[]):
    """Iterate through the list of LT* objects and capture the text or image data contained in each"""
    text_content = [] 

    for lt_obj in lt_objs:
        if isinstance(lt_obj, LTTextBox) or isinstance(lt_obj, LTTextLine):
            # text
            text_content.append(lt_obj.get_text())
        # elif isinstance(lt_obj, LTImage):
        #     # an image, so save it to the designated folder, and note it's place in the text 
        #     saved_file = save_image(lt_obj, page_number, images_folder)
        #     if saved_file:
        #         # use html style <img /> tag to mark the position of the image within the text
        #         text_content.append('<img src="'+os.path.join(images_folder, saved_file)+'" />')
        #     else:
        #         print >> sys.stderr, "Error saving image on page", page_number, lt_obj.__repr__
        # elif isinstance(lt_obj, LTFigure):
        #     # LTFigure objects are containers for other LT* objects, so recurse through the children
        #     text_content.append(parse_lt_objs(lt_obj.objs, page_number, images_folder, text_content))

    return '\n'.join(text_content)

"""
This function takes in a list that contains tuples (representing a table of
contents) and parses it, also returning a list of tuples. The first item in
each tuple is the level of the chapter/section, and the second item is its
name. The toc_stoplist is a list of words, like preface, etc that we do not
want in our table of contents.
"""
def parse_table_of_contents(outlines, toc_stoplist):
    toc = []

    for i in range(len(outlines)):
        item = outlines[i]
        name = item[1].split(' ')
        name = [str(j) for j in name]

        keep = True
        done = False

        for w in name:
            word = w.lower().strip()

            # If these specific words are found, we are done with relevant
            # sections
            if 'appendix' in word or 'bibliography' in word or 'index' in word:
                done = True
            if word in toc_stoplist:
                keep = False

        if done:
            break

        if keep:
            toc.append((item[0], name))

    return toc

# This function just reads in a stoplist for the table of contents
def read_in_toc_stoplist(stoplist_file):
    s = open(stoplist_file, 'rb')
    stoplist = []
    for word in s:
        stoplist.append(word.strip('\n').strip())
    s.close()

    return stoplist

"""
Takes in document, interpreter, device (all three of which are just pdfminer
objects for parsing PDFs), and start_term and end_term. This function searches
through a given pdf textbook and looks for start_term and end_term, both of
which are lists of keywords, and returns the associated section of text from
the pdf file.
"""
def get_section_text(document, interpreter, device, start_term, \
                        end_term):

    # If the start/end terms contain a number, we append the word "chapter"
    # when looking through the pdf textbook
    chapter_start = any([word.isdigit() for word in start_term])
    chapter_end = any([word.isdigit() for word in end_term])

    start_keywords = start_term[:]
    end_keywords = end_term[:]

    if chapter_start:
        start_keywords.append('Chapter')
    if chapter_end:
        end_keywords.append('Chapter')

    found_start = False
    start_page = -1

    text_content = []

    # Loop through the pdf file; if start_keywords found, save that location,
    # and if it is found again within 5 pages, we know we have found the
    # section, and we add all of the text until we find end_keywords
    for num, page in enumerate(PDFPage.create_pages(document)):
        interpreter.process_page(page)
        layout = device.get_result()
        text = parse_lt_objs(layout._objs, (num+1))

        if not found_start and all([keyword in text for keyword in start_keywords]):
            if start_page == -1:
                start_page = num
                text_content.append(text)
            elif num - start_page < 5:
                found_start = True
            else:
                start_page = num
                text_content = [text]

        if found_start and all([keyword in text for keyword in end_keywords]):
            break

        if found_start:
            text_content.append(text)

    return ''.join(text_content).encode('utf-8')

"""
Call this function with the path to a pdf file and the path to a stoplist file.
It pulls the table of contents from the pdf file, parses the table of contents,
and, for each chapter in the table of contents, gets that section of text from
the pdf textbook. It ultimately returns a list of dictionaries. Each dictionary
has a "name" field, which is just the name of the section, "parent," which is
the section that is one level up from that section in the table of contents,
and "query," which is the actual text of that section from the pdf file.
"""
def generate_queries(pdf_file, toc_stoplist_file, search_topic):
    # Open a PDF document.
    fp = open(pdf_file, 'rb')
    parser = PDFParser(fp)
    document = PDFDocument(parser, '')

    # Get the outlines of the document.
    outlines = document.get_outlines()
    toc = []

    print "Getting document outlines"
    for (level,title,dest,a,se) in outlines:
        toc.append((level, title))

    toc_stoplist = read_in_toc_stoplist(toc_stoplist_file)

    toc = parse_table_of_contents(toc, toc_stoplist)

    toc = toc[:3]

    rsrcmgr = PDFResourceManager()

    # Set parameters for analysis.
    laparams = LAParams()
    # Create a PDF page aggregator object.
    device = PDFPageAggregator(rsrcmgr, laparams=laparams)

    interpreter = PDFPageInterpreter(rsrcmgr, device)

    parent_names = []
    prev_level = 0
    prev_name = [""]

    topics = []

    print "Looping through topics in table of contents"
    for topic in toc:
        level = topic[0]
        name = topic[1]
        print "Topic: %s, level: %s"%(name, level)

        if level-prev_level == 1:
            parent_names.append(prev_name)
        else:
            link = {}
            link["name"] = prev_name
            link["parent"] = parent_names[-1]
            link["query"] = get_section_text(document, interpreter, device, \
                prev_name, name)

            topics.append(link)

        prev_level = level
        prev_name = topic[1]

    final_chapter = topics[-1]["name"]

    for i in range(len(parent_names)):
        name = parent_names[i]

        link = {}
        link["name"] = name
        link["parent"] = search_topic

        if i == len(parent_names) - 1:
            link["query"] = get_section_text(document, interpreter, device, \
                name, final_chapter)
        else:
            link["query"] = get_section_text(document, interpreter, device, \
                name, parent_names[i+1])

        topics.append(link)


    # can add in section searching for parents as well
    print "Done looping through TOC topics"
    fp.close()

    return topics