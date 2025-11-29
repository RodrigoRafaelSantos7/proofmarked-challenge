import type { Session } from "@supabase/supabase-js";
import { createDefine } from "fresh";

export interface State {
  session: Session | null;
}

export const define = createDefine<State>();
