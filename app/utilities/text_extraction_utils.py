import docx
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
from pathlib import Path


# You have to install OCR on your local machine!
# link https://github.com/h/pytesseract?tab=readme-ov-file#installation
def extract_text_from_docx (file_path):
    """Extract text from docx file"""
    print(f"Processing DOCX: {file_path}")
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text)
    except Exception as e:
        print(f"Error reading docx {file_path}: {e}")
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a .pdf file.
    It tries direct text extraction first. If that fails (e.g., scanned PDF),
    it falls back to OCR.
    """
    print(f"Processing PDF: {file_path}")

    # --- Attempt 1: Direct Text Extraction ---
    try:
        doc = fitz.open(file_path)
        full_text = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            full_text.append(page.get_text("text"))

        doc.close()
        combined_text = "\n".join(full_text).strip()

        # If text is very short, it's likely a scanned image.
        # We set a threshold (e.g., 50 characters) to trigger OCR.
        if len(combined_text) > 50:
            print("Successfully extracted text directly (digital PDF).")
            return combined_text
        else:
            print("Direct extraction yielded little text. Attempting OCR...")
            # Fall through to OCR logic below

    except Exception as e:
        print(f"Error during direct text extraction: {e}. Attempting OCR...")
        # Fall through to OCR logic

    # --- Attempt 2: OCR Fallback (for scanned PDFs) ---
    full_text = []
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)

            # Render page to an image (pixmap)
            # Increase zoom for better OCR resolution
            pix = page.get_pixmap(dpi=300)
            img_data = pix.tobytes("png")

            # Open image using PIL
            image = Image.open(io.BytesIO(img_data))

            # Perform OCR using Tesseract for English and Vietnamese
            # 'eng+vie' tells Tesseract to look for both languages
            page_text = pytesseract.image_to_string(image, lang='eng+vie')
            full_text.append(page_text)

        doc.close()
        return "\n".join(full_text)

    except Exception as e:
        print(f"Error during OCR extraction {file_path}: {e}")
        return ""


def parse_cv_or_jd(file_path: str) -> str:
    """
    Main function to parse a file.
    It checks the file extension and routes to the correct parser.
    """
    file_path = Path(file_path)
    extension = file_path.suffix.lower()

    if not file_path.exists():
        return f"Error: File not found at {file_path}"

    if extension == '.docx':
        return extract_text_from_docx(str(file_path))
    elif extension == '.pdf':
        return extract_text_from_pdf(str(file_path))
    else:
        return f"Error: Unsupported file type: {extension}. Only .docx and .pdf are supported."


# --- Example Usage ---
if __name__ == "__main__":
    # Create a dummy folder for our test files
    test_dir = Path("test_files")
    test_dir.mkdir(exist_ok=True)

    # NOTE: You must create these files in the 'test_files' directory
    # to run this example.

    # 1. A .docx file (e.g., 'my_jd.docx') with English and Vietnamese text.
    # 2. A digital .pdf file (e.g., 'digital_cv.pdf')
    # 3. A scanned .pdf file (e.g., 'scanned_cv.pdf')

    files_to_process = [
        test_dir / "CV_Phan_Dang_Truong.pdf",
        #test_dir / "Quy trình tuyển dụng.docx",
    ]

    for file_path in files_to_process:
        print("=" * 70)
        print(f"STARTING PARSE FOR: {file_path.name}")

        extracted_text = parse_cv_or_jd(str(file_path))

        print("-" * 30)
        print(f"EXTRACTED TEXT:\n")
        print(extracted_text)
        print("=" * 70 + "\n")