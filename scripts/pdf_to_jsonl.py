import os
import json
from PyPDF2 import PdfReader
from tqdm import tqdm
import random

PDF_DIR = 'ncert_pdfs/class10 science ncert pdf'
TRAIN_OUT = 'train.jsonl'
VAL_OUT = 'validation.jsonl'
CHUNK_SIZE = 800  # characters per chunk
VAL_RATIO = 0.2

# Helper: chunk text into reasonable pieces for Q&A or instruction
def chunk_text(text, chunk_size=CHUNK_SIZE):
    paragraphs = [p.strip() for p in text.split('\n') if len(p.strip()) > 30]
    chunks = []
    buf = ''
    for para in paragraphs:
        if len(buf) + len(para) < chunk_size:
            buf += (' ' if buf else '') + para
        else:
            if buf:
                chunks.append(buf)
            buf = para
    if buf:
        chunks.append(buf)
    return chunks

# Extract all text from a PDF file
def extract_pdf_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        try:
            text += page.extract_text() + '\n'
        except Exception:
            continue
    return text

# Main: process all PDFs
all_chunks = []
for fname in tqdm(os.listdir(PDF_DIR)):
    if fname.endswith('.pdf'):
        pdf_path = os.path.join(PDF_DIR, fname)
        print(f'Extracting {fname}...')
        text = extract_pdf_text(pdf_path)
        chunks = chunk_text(text)
        for chunk in chunks:
            # Format as a simple instruction (user asks for explanation, assistant gives chunk)
            item = {
                "messages": [
                    {"role": "system", "content": "You are a helpful science tutor for class 10 students."},
                    {"role": "user", "content": "Explain the following in detail:"},
                    {"role": "assistant", "content": chunk}
                ]
            }
            all_chunks.append(item)

# Shuffle and split
random.shuffle(all_chunks)
split_idx = int(len(all_chunks) * (1 - VAL_RATIO))
train_data = all_chunks[:split_idx]
val_data = all_chunks[split_idx:]

# Write to jsonl
with open(TRAIN_OUT, 'w', encoding='utf-8') as f:
    for item in train_data:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')
with open(VAL_OUT, 'w', encoding='utf-8') as f:
    for item in val_data:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"Wrote {len(train_data)} training and {len(val_data)} validation samples.") 