import string
from reportlab.pdfgen import canvas
import random
import os

def create_sample_pdf(filename):
    c = canvas.Canvas(filename)
    text_content = ""
    # Generate random text
    for i in range(100):
        sentence = ''.join(random.choices(string.ascii_letters + string.digits, k=50))
        text_content += f"{i}. This is a sentence of dummy text about AI workflows for {sentence}. \n"
    
    # Needs to fit on screen
    y = 800
    for line in text_content.split('\n')[:50]:
        c.drawString(100, y, line)
        y -= 15
    c.save()
    print(f"Created dummy PDF: {filename}")

if __name__ == "__main__":
    if not os.path.exists("test.pdf"):
        create_sample_pdf("test.pdf")
