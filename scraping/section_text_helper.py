from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfdevice import PDFDevice
from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams, LTTextBox, LTTextLine, LTFigure, LTImage


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

def parse_table_of_contents(outlines, toc_stoplist):
    toc = []

    for i in range(len(outlines)):
        item = outlines[i]
        name = item[1].split(' ')
        name = [str(j) for j in name]

        keep = True
        done = False

        for word in name:
            w = word.lower().strip()
            if 'appendix' in w or 'bibliography' in w or 'index' in w:
                done = True
            if w in toc_stoplist:
                keep = False

        if done:
            break

        if keep:
            toc.append((item[0], name))

    return toc

def read_in_toc_stoplist(stoplist_file):
    s = open(stoplist_file, 'rb')
    stoplist = []
    for word in s:
        stoplist.append(word.strip('\n').strip())
    s.close()

    return stoplist

def get_section_text(document, interpreter, device, start_term, \
                        end_term):
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

def generate_queries(pdf_file, toc_stoplist_file):
    # Open a PDF document.
    fp = open(pdf_file, 'rb')
    parser = PDFParser(fp)
    document = PDFDocument(parser, '')

    # Get the outlines of the document.
    outlines = document.get_outlines()
    toc = []

    for (level,title,dest,a,se) in outlines:
        toc.append((level, title))

    toc_stoplist = read_in_toc_stoplist(toc_stoplist_file)

    toc = parse_table_of_contents(toc, toc_stoplist)

    # toc = toc[:9]

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

    for topic in toc:
        level = topic[0]
        name = topic[1]

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

    # can add in section searching for parents as well

    fp.close()

    return topics