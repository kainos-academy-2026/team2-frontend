import { z } from "zod";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export const registrationSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Full name is required."),
        email: z.email(),
        password: z
            .string()
            .regex(
                PASSWORD_POLICY_REGEX,
                "Password must be at least 9 characters and include uppercase, lowercase, and a special character",
            ),
        confirmPassword: z
            .string()
            .regex(
                PASSWORD_POLICY_REGEX,
                "Password must be at least 9 characters and include uppercase, lowercase, and a special character",
            ),
    })
    .refine((input) => input.password === input.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export type RegistrationRequestDto = z.infer<typeof registrationSchema>;
