import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BotMsg = { role: "user" | "assistant" | "system"; content: string; id?: string; created_at?: string };

export const loadConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // Get or create the single conversation
    let { data: convo } = await supabase
      .from("bot_conversations")
      .select("id, disease_slug")
      .eq("user_id", userId)
      .maybeSingle();
    if (!convo) {
      const { data: created, error } = await supabase
        .from("bot_conversations")
        .insert({ user_id: userId })
        .select("id, disease_slug")
        .single();
      if (error) throw new Error(error.message);
      convo = created;
    }
    const { data: msgs, error: mErr } = await supabase
      .from("bot_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    return { conversationId: convo.id, diseaseSlug: convo.disease_slug, messages: (msgs ?? []) as BotMsg[] };
  });

export const saveTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string; user: string; assistant: string; diseaseSlug?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rows = [
      { conversation_id: data.conversationId, user_id: userId, role: "user", content: data.user },
      { conversation_id: data.conversationId, user_id: userId, role: "assistant", content: data.assistant },
    ];
    const { error } = await supabase.from("bot_messages").insert(rows);
    if (error) throw new Error(error.message);
    if (data.diseaseSlug !== undefined) {
      await supabase
        .from("bot_conversations")
        .update({ disease_slug: data.diseaseSlug })
        .eq("id", data.conversationId);
    }
    return { ok: true };
  });

export const resetConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("bot_conversations").delete().eq("user_id", userId);
    return { ok: true };
  });
