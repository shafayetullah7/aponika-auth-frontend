import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;
