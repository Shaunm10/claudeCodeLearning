import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
});
