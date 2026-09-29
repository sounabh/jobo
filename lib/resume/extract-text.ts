import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";


export async function extractResumeText(
  buffer: Buffer, //Buffer = the actual file data stored in memory as bytes.
  mimeType: string // file type
): Promise<string> {
  if (mimeType === "application/pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported resume file type: ${mimeType}`);
}