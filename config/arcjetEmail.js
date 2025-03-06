import arcjet, { validateEmail } from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";

const ajEmail = arcjet({
  key: ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

export default ajEmail;
