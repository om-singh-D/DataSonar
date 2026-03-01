import { RegisterSchema, LoginSchema, ChangePasswordSchema } from '../src/schemas/auth.schema';

describe('RegisterSchema', () => {
  it('should accept valid registration', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'SecurePass1!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = RegisterSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePass1!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password — no uppercase', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'weakpass1!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password — no number', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'WeakPass!!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password — no special char', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'WeakPass11',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password — too short', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'Sh1!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty firstName', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'SecurePass1!',
      firstName: '',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('should accept valid login', () => {
    const result = LoginSchema.safeParse({
      email: 'test@datasonar.io',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing email', () => {
    const result = LoginSchema.safeParse({
      password: 'anypassword',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = LoginSchema.safeParse({
      email: 'test@datasonar.io',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('ChangePasswordSchema', () => {
  it('should accept valid password change', () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: 'OldPass1!',
      newPassword: 'NewSecure1!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject weak new password', () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: 'OldPass1!',
      newPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});