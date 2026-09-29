import { GoogleGenAI } from "@google/genai";
import type { ParsedResume } from "./types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });  // gemini api key


// prompt

const SYSTEM_PROMPT = `You extract structured data from resumes.

Return JSON matching exactly this shape:

{
  "full_name": string,
  "email": string,
  "phone": string,
  "location": string,
  "professional_summary": string,
  "skills": string[],
  "work_experience": [
    { "company": string, "title": string, "location": string, "start_date": string, "end_date": string, "is_current": boolean, "responsibilities": string[] }
  ],
  "education": [
    { "institution": string, "degree": string, "field_of_study": string, "start_date": string, "end_date": string, "description": string }
  ],
  "projects": [
    { "name": string, "description": string, "technologies": string[], "url": string }
  ],
  "certifications": [
    { "name": string, "issuer": string, "issue_date": string, "url": string }
  ],
  "links": [ { "label": string, "url": string } ]
}

Omit fields that aren't present in the resume rather than guessing. Never invent information not in the text. Dates can stay as written (e.g. "Jan 2022", "2019 - Present").`;

export async function parseResumeWithAI(
  resumeText: string
): Promise<ParsedResume> {
  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: resumeText.slice(0, 15000),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No structured data returned from resume parser.");
  }

  try {
    return JSON.parse(text) as ParsedResume;
  } catch {
    throw new Error("Could not parse the resume parser's response as JSON.");
  }
}