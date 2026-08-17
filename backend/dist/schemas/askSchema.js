import * as z from "zod";
export const askSchema = z.object({
    query: z
        .string()
        .trim()
        .min(1, "Query cannot be empty"),
    conversationId: z
        .string()
        .uuid("invalid conversation Id")
        .optional(),
});
