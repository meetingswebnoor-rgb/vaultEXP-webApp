const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  // Login accepts any non-empty password — the hash comparison handles security
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
});

const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

/**
 * validate(schema) → Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({
        success:   false,
        message:   'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        errors,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
