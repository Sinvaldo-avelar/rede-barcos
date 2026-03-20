import { supabase } from "@/lib/supabaseClient";

const DEFAULT_BUCKET = "imagens-noticias";

type UploadParams = {
  file: File;
  bucket?: string;
  prefix?: string;
};

type UploadResult = {
  publicUrl: string;
  fileName: string;
};

function getFileExtension(fileName: string) {
  const ext = fileName.split(".").pop()?.trim().toLowerCase();
  return ext || "jpg";
}

export async function uploadImageToSupabase({
  file,
  bucket = DEFAULT_BUCKET,
  prefix = "capa",
}: UploadParams): Promise<UploadResult> {
  const fileExt = getFileExtension(file.name);
  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(uniqueName);

  return {
    publicUrl: data.publicUrl,
    fileName: uniqueName,
  };
}
