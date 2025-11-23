import { createClient } from "@/lib/supabase/client";

export async function uploadImageToStorage(
  base64Image: string,
  prefix: string
): Promise<string> {
  const supabase = createClient();

  // If already a URL, return it
  if (base64Image.startsWith("http")) return base64Image;

  // Extract base64 data
  const base64Data = base64Image.split(",")[1] || base64Image;
  
  // Convert to blob for more efficient upload
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  const fileName = `challenge/${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.png`;

  const { error } = await supabase.storage
    .from("challenge-uploads")
    .upload(fileName, blob, { contentType: "image/png" });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("challenge-uploads").getPublicUrl(fileName);

  return publicUrl;
}
