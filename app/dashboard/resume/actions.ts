"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractResumeText } from "@/lib/resume/extract-text";
import { parseResumeWithAI } from "@/lib/resume/parse-with-ai";
import type { ParsedResume } from "@/lib/resume/types";


//// Result returned by the upload action type
export type UploadResumeState = { error?: string; message?: string };

//file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

//max size of the resume
const MAX_SIZE = 8 * 1024 * 1024;



export async function uploadResume(
  _prev: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in to upload a resume." }; // not logged in

  const file = formData.get("resume"); // get the resume

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a resume file to upload." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Upload a PDF, DOCX, or plain text resume." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "That file is too large. Max size is 8MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer()); // create buffer

  // Parse FIRST — nothing touches storage or the database until this

  let parsed: ParsedResume;
  try {
    //extract plain text
    const text = await extractResumeText(buffer, file.type);

    // make sure text had enough content to use
    if (!text || text.trim().length < 20) {
      throw new Error(
        `Extracted text too short (${text?.length ?? 0} chars) — file may be scanned/image-based.`
      );
    }
    parsed = await parseResumeWithAI(text);  // Send extracted text to AI and convert it into structured data 
  } catch (err) {
    console.error("[uploadResume] parsing failed:", err);
    return {
      error:
        "Couldn't read that resume automatically. Try a different file, or fill in your profile manually.",
    };
  }

// create unique path name for supabase storage
  const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;

  // upload the file in supabase storage
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadResume] storage upload error:", uploadError);
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: resumeRow, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      file_path: path, // supabase storage
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: "parsed", // status mentioned
    })
    .select("id")
    .single();

  if (insertError || !resumeRow) {
    console.error("[uploadResume] resumes insert error:", insertError);
    // Roll back the file so storage never has an orphan with no row.
    await supabase.storage.from("resumes").remove([path]).catch(() => {});
    return { error: `Couldn't save the resume record: ${insertError?.message ?? "unknown error"}` };
  }

  try {
    await saveParsedResume(userId, parsed); // save to db 
  } catch (err) {
    console.error("[uploadResume] saving parsed data failed:", err);
    // Roll back the row AND the file — only fully-saved resumes should
    // exist anywhere.
    await Promise.allSettled([
      supabase.from("resumes").delete().eq("id", resumeRow.id),
      supabase.storage.from("resumes").remove([path]),
    ]);
    return { error: "Parsed your resume but couldn't save the details. Try again." };
  }

  // Tell Next.js these pages have new data
  revalidatePath("/dashboard/resume");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { message: "Resume uploaded and your profile has been filled in." };
}

async function saveParsedResume(userId: string, parsed: ParsedResume) {
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.full_name ?? undefined,
      professional_summary: parsed.professional_summary ?? null,
      skills: parsed.skills ?? [],
      phone: parsed.phone ?? null,
      location: parsed.location ?? null,
    })
    .eq("id", userId);
  if (profileError) throw profileError;

  //remove old data
  await Promise.all([
    supabase.from("work_experience").delete().eq("user_id", userId),
    supabase.from("education").delete().eq("user_id", userId),
    supabase.from("projects").delete().eq("user_id", userId),
    supabase.from("certifications").delete().eq("user_id", userId),
    supabase.from("resume_links").delete().eq("user_id", userId),
  ]);

  if (parsed.work_experience?.length) {
    const { error } = await supabase.from("work_experience").insert(
      parsed.work_experience.map((item, index) => ({
        user_id: userId,
        company: item.company,
        title: item.title,
        location: item.location ?? null,
        start_date: item.start_date ?? null,
        end_date: item.end_date ?? null,
        is_current: item.is_current ?? false,
        responsibilities: item.responsibilities ?? [],
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (parsed.education?.length) {
    const { error } = await supabase.from("education").insert(
      parsed.education.map((item, index) => ({
        user_id: userId,
        institution: item.institution,
        degree: item.degree ?? null,
        field_of_study: item.field_of_study ?? null,
        start_date: item.start_date ?? null,
        end_date: item.end_date ?? null,
        description: item.description ?? null,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (parsed.projects?.length) {
    const { error } = await supabase.from("projects").insert(
      parsed.projects.map((item, index) => ({
        user_id: userId,
        name: item.name,
        description: item.description ?? null,
        technologies: item.technologies ?? [],
        url: item.url ?? null,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (parsed.certifications?.length) {
    const { error } = await supabase.from("certifications").insert(
      parsed.certifications.map((item, index) => ({
        user_id: userId,
        name: item.name,
        issuer: item.issuer ?? null,
        issue_date: item.issue_date ?? null,
        url: item.url ?? null,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (parsed.links?.length) {
    const { error } = await supabase.from("resume_links").insert(
      parsed.links.map((item) => ({
        user_id: userId,
        label: item.label,
        url: item.url,
      }))
    );
    if (error) throw error;
  }
}


export async function getSignedResumeUrl(path: string) {

//Your resume is probably in a private Supabase Storage bucket. The signed URL temporarily gives access to that private file.

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 10); // generate temp url 
  if (error) {
    console.error("[getSignedResumeUrl] error:", error);
    return null;
  }
  return data.signedUrl;
}

export async function deleteResume(resumeId: string, filePath: string) {

  
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  // Run both in parallel; a failure on one side doesn't block the other,
  // and we surface an error only if the DB row (the source of truth) fails.
  const [storageResult, dbResult] = await Promise.allSettled([
    supabase.storage.from("resumes").remove([filePath]),
    supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", userId),
  ]);

  if (dbResult.status === "rejected" || dbResult.value.error) {
    const err = dbResult.status === "rejected" ? dbResult.reason : dbResult.value.error;
    console.error("[deleteResume] db delete error:", err);
    return { error: "Couldn't delete that resume. Try again." };
  }

  if (storageResult.status === "rejected" || storageResult.value.error) {
    const err = storageResult.status === "rejected" ? storageResult.reason : storageResult.value.error;
    console.error("[deleteResume] storage remove error (file may remain in storage):", err);
  }

  revalidatePath("/dashboard/resume");
  return { message: "Resume deleted." };
}