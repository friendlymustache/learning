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


# Open a PDF document.
fp = open('algo.pdf', 'rb')
parser = PDFParser(fp)
document = PDFDocument(parser, '')

# Get the outlines of the document.
outlines = document.get_outlines()

# for (level,title,dest,a,se) in outlines:
#     print (level, title, a)

rsrcmgr = PDFResourceManager()

# Set parameters for analysis.
laparams = LAParams()
# Create a PDF page aggregator object.
device = PDFPageAggregator(rsrcmgr, laparams=laparams)

interpreter = PDFPageInterpreter(rsrcmgr, device)

# print document.catalog

start_keywords = ['Chapter', '15', 'Dynamic', 'Programming']
end_keywords = ['Chapter', '16', 'Greedy', 'Algorithms']

# start_keywords = ['Resume', 'Advice']
# end_keywords = ['Behavioral', 'Preparation']

found_start = False
start_page = -1

text_content = []

for num, page in enumerate(PDFPage.create_pages(document)):
    interpreter.process_page(page)
    layout = device.get_result()
    text = parse_lt_objs(layout._objs, (num+1))

    if not found_start and all([keyword in text for keyword in start_keywords]):
        print 'Found start keywords on page ' + str(num+1)

        if start_page == -1:
            start_page = num
            text_content.append(text)
        elif num - start_page < 5:
            found_start = True
        else:
            start_page = num
            text_content = [text]

    if found_start and all([keyword in text for keyword in end_keywords]):
        print 'Found end keywords on page ' + str(num+1)
        break

    if found_start:
        print 'Adding page ' + str(num+1)
        text_content.append(text)

text_content = ''.join(text_content)

print text_content

fp.close()