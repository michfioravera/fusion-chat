import { createClient } from "@supabase/supabase-js";

export interface Message {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
  deleted: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials not configured. Real-time features will be disabled."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchMessages(): Promise<Message[]> {
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("deleted", false)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export async function insertMessage(
  userId: string,
  text: string
): Promise<Message | null> {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      userId,
      text,
      createdAt: Date.now(),
      deleted: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting message:", error);
    return null;
  }

  return data;
}

export async function deleteUserMessages(userId: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  const { error } = await supabase
    .from("messages")
    .update({ deleted: true })
    .eq("userId", userId);

  if (error) {
    console.error("Error deleting user messages:", error);
    return false;
  }

  return true;
}

export function subscribeToMessages(
  callback: (message: Message) => void
): (() => void) | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const subscription = supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: "deleted=eq.false",
      },
      (payload: any) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
