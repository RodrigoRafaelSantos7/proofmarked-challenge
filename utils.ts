import type { Session } from "@supabase/supabase-js";
import { createDefine } from "fresh";

export interface State {
  session: Session | null;
}

const baseDefine = createDefine<State>();

export const define = baseDefine as typeof baseDefine & {
  route: any;
};
