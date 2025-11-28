import { define } from "../../../utils.ts";
import { z } from "zod";
import { supabaseAdmin } from "../../../lib/supabase.ts";

const RegisterSchema = z.object({
  email: z.string().email(),
});

export const handler = define.handlers({
  async POST(ctx) {
    const contentType = ctx.req.headers.get("content-type") ?? "";
    let payload: unknown;

    if (contentType.includes("application/json")) {
      payload = await ctx.req.json();
    } else {
      const form = await ctx.req.formData();
      payload = { email: form.get("email") };
    }

    const result = RegisterSchema.safeParse(payload);
    if (!result.success) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const email = result.data.email.toLowerCase();
    const redirectTo = new URL("/login", ctx.req.url).toString();

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { mfa_enforced: true },
        redirectTo,
      },
    );

    if (error) {
      console.error("Invite failed", error);
      return Response.json(
        { error: "Unable to send invite. Please try again." },
        { status: 400 },
      );
    }

    return Response.json({ ok: true });
  },
});
