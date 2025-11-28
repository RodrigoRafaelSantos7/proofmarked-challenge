import { define } from "../../../utils.ts";
import { clearSessionCookies } from "../../../lib/session.ts";

export const handler = define.handlers({
  POST() {
    const headers = new Headers({
      "location": "/",
    });
    clearSessionCookies(headers);
    return new Response(null, { status: 302, headers });
  },
});
