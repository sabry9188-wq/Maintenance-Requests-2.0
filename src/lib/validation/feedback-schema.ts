import { z } from "zod";

export const feedbackSchema = z.object({
  request_id: z.string().uuid(),
  problem_solved: z.enum(["YES", "PARTIALLY", "NO"], {
    required_error: "Please select whether the problem was solved",
  }),
  rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const reopenSchema = z.object({
  request_id: z.string().uuid(),
  reopen_reason: z.string().trim().min(5, "Please explain why the request is being reopened"),
});

export type ReopenInput = z.infer<typeof reopenSchema>;
