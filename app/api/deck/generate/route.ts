import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SECRET_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const { notes, targetLevel, userId, fileUrl, fileName, fileType } = await req.json();

    // 1. Check Credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 2. Create Generation Record (Pending)
    const { data: generation, error: genError } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: userId,
        notes,
        target_level: targetLevel,
        status: "pending",
        title: "Generating..."
      })
      .select()
      .single();

    if (genError) throw genError;

    // 3. Deduct Credit
    await supabaseAdmin
      .from("users")
      .update({ credits: userData.credits - 1 })
      .eq("id", userId);

    // 4. Trigger Inngest
    await inngest.send({
      name: "app/deck.generate",
      data: {
        generationId: generation.id,
        notes,
        targetLevel,
        userId,
        fileUrl,
        fileName,
        fileType
      }
    });

    return NextResponse.json({ generationId: generation.id });

  } catch (error: any) {
    console.error("GENERATE ROUTE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
