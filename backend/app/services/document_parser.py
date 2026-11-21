import re
import os
from typing import List, Dict, Any, Tuple
import pypdf
import docx


class DocumentParser:
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> Tuple[List[Dict[str, Any]], int]:
        """
        Extracts text from PDF, DOCX, or TXT file.
        Returns a tuple of (pages_data, total_pages)
        pages_data is a list of dicts: {"page_number": int, "text": str}
        """
        file_type = file_type.lower().strip(".")
        pages_data = []

        if file_type == "pdf":
            try:
                reader = pypdf.PdfReader(file_path)
                total_pages = len(reader.pages)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    clean = DocumentParser.clean_text(text)
                    if clean:
                        pages_data.append({"page_number": idx + 1, "text": clean})
                return pages_data, max(total_pages, 1)
            except Exception as e:
                raise ValueError(f"Failed to parse PDF file: {str(e)}")

        elif file_type == "docx":
            try:
                doc = docx.Document(file_path)
                full_text = []
                for para in doc.paragraphs:
                    if para.text.strip():
                        full_text.append(para.text.strip())
                joined_text = "\n\n".join(full_text)
                clean = DocumentParser.clean_text(joined_text)
                # Approximate 1 page per 2000 characters
                pages_data.append({"page_number": 1, "text": clean})
                page_count = max(1, len(clean) // 2000)
                return pages_data, page_count
            except Exception as e:
                raise ValueError(f"Failed to parse DOCX file: {str(e)}")

        elif file_type == "txt":
            try:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                except UnicodeDecodeError:
                    with open(file_path, "r", encoding="latin-1") as f:
                        text = f.read()
                clean = DocumentParser.clean_text(text)
                pages_data.append({"page_number": 1, "text": clean})
                page_count = max(1, len(clean) // 2000)
                return pages_data, page_count
            except Exception as e:
                raise ValueError(f"Failed to parse TXT file: {str(e)}")

        else:
            raise ValueError(f"Unsupported file format: .{file_type}. Supported formats: PDF, DOCX, TXT")

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Remove null bytes and non-printable control characters
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        # Normalize multiple spaces, tabs and carriage returns
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Replace 3 or more newlines with two newlines
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @staticmethod
    def chunk_document(
        pages_data: List[Dict[str, Any]],
        chunk_size: int = 700,
        chunk_overlap: int = 120
    ) -> List[Dict[str, Any]]:
        """
        Divides text into structured chunks while preserving page numbers and section headings.
        Handles both paragraph breaks and numbered/titled section headers.
        """
        chunks = []
        chunk_index = 0

        # Pattern to detect section headings (e.g. '1. Purpose', '5. Safety Precautions', '### Heading')
        heading_pattern = re.compile(
            r"^(?:[0-9]{1,2}\.\s+[A-Z][^\n]{2,75}|#{1,4}\s+[A-Z][^\n]{2,75}|Phase\s+\d+:[^\n]{2,75}|Step\s+\d+:[^\n]{2,75})"
        )

        current_section = "Overview"
        current_page = 1
        section_lines = []

        def flush_section(lines_to_flush, section_name, page_num):
            nonlocal chunk_index
            if not lines_to_flush:
                return
            full_sec_text = "\n".join(lines_to_flush).strip()
            if not full_sec_text:
                return

            if len(full_sec_text) <= chunk_size:
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "section_title": section_name,
                    "content": full_sec_text
                })
                chunk_index += 1
            else:
                start = 0
                part = 1
                while start < len(full_sec_text):
                    end = min(start + chunk_size, len(full_sec_text))
                    if end < len(full_sec_text):
                        space_idx = full_sec_text.rfind(" ", start + chunk_size - 120, end)
                        if space_idx > start:
                            end = space_idx
                    sub_content = full_sec_text[start:end].strip()
                    if sub_content:
                        title_label = section_name if part == 1 and end >= len(full_sec_text) else f"{section_name} (Part {part})"
                        chunks.append({
                            "chunk_index": chunk_index,
                            "page_number": page_num,
                            "section_title": title_label,
                            "content": sub_content
                        })
                        chunk_index += 1
                        part += 1
                    if end >= len(full_sec_text):
                        break
                    start = max(start + 1, end - chunk_overlap)

        for page in pages_data:
            p_num = page.get("page_number", 1)
            raw_text = page.get("text", "")
            if not raw_text:
                continue

            for raw_line in raw_text.split("\n"):
                line = raw_line.strip()
                if not line:
                    continue

                if heading_pattern.match(line) and len(line) < 80:
                    flush_section(section_lines, current_section, current_page)
                    section_lines = []
                    current_section = line
                    current_page = p_num

                section_lines.append(line)

        flush_section(section_lines, current_section, current_page)
        return chunks
