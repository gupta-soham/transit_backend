import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Transit <noreply@transitco.in>',
      to: email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by clicking the link below:</p>
             <a href="${url}">Verify your email</a>`,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendResetEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_APP_URL}/resetPassword?token=${token}`;
  try {
    await resend.emails.send({
      from: 'Transit <noreply@transitco.in>',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${url}">Reset Password</a>`,
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

interface ContactFormData {
  email: string;
  name: string;
  message: string;
  mobile?: string;
}

export const sendContactEmail = async (formData: ContactFormData) => {
  try {
    // Send confirmation email to the user
    await resend.emails.send({
      from: 'Transit <noreply@transitco.in>',
      to: formData.email,
      subject: 'We received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for contacting us, ${formData.name}!</h2>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Message:</strong> ${formData.message}</p>
          </div>
          <p>If you need immediate assistance, please call us at our support number.</p>
          <p>Best regards,<br>The Transit Team</p>
        </div>
      `,
    });

    // Send notification email to admin
    await resend.emails.send({
      from: 'Transit Contact Form <noreply@transitco.in>',
      to: process.env.ADMIN_EMAIL || 'transitco.team@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Mobile:</strong> ${formData.mobile || 'Not provided'}</p>
            <p><strong>Message:</strong> ${formData.message}</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    throw new Error('Failed to send contact confirmation email');
  }
};
