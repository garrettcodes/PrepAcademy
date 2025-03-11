import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Setup mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Template cache
const templates: { [key: string]: HandlebarsTemplateDelegate } = {};

// Load template from file system
const loadTemplate = (templateName: string): HandlebarsTemplateDelegate => {
  if (templates[templateName]) {
    return templates[templateName];
  }

  try {
    // In production, this should point to actual template files
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    templates[templateName] = template;
    return template;
  } catch (error) {
    console.error(`Error loading template: ${templateName}`, error);
    // Fallback to a simple template if file not found
    const template = Handlebars.compile('{{message}}');
    templates[templateName] = template;
    return template;
  }
};

// Format date for email display
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Send subscription created email
export const sendSubscriptionCreatedEmail = async (
  email: string,
  name: string,
  planName: string,
  startDate: Date,
  endDate: Date
): Promise<void> => {
  try {
    // In a real app, load this from a file
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Your PrepAcademy Subscription is Active!</h1>
        <p>Hello {{name}},</p>
        <p>Thank you for subscribing to PrepAcademy! Your {{planName}} subscription is now active.</p>
        <div style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Subscription Plan:</strong> {{planName}}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> {{startDate}}</p>
          <p style="margin: 5px 0;"><strong>Next Billing Date:</strong> {{endDate}}</p>
        </div>
        <p>You now have full access to all of PrepAcademy's premium features, including:</p>
        <ul>
          <li>Unlimited practice questions</li>
          <li>Full-length practice exams</li>
          <li>Performance analytics</li>
          <li>Study groups</li>
          <li>Shared notes</li>
        </ul>
        <p>If you have any questions about your subscription, please visit our <a href="{{supportUrl}}" style="color: #4F46E5;">support page</a> or reply to this email.</p>
        <p>Happy studying!</p>
        <p>The PrepAcademy Team</p>
      </div>
    `;

    const template = Handlebars.compile(htmlTemplate);
    const htmlContent = template({
      name,
      planName,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      supportUrl: `${process.env.CLIENT_URL}/support`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@prepacademy.com',
      to: email,
      subject: 'Your PrepAcademy Subscription is Active!',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Subscription created email sent to ${email}`);
  } catch (error) {
    console.error('Error sending subscription created email:', error);
  }
};

// Send subscription canceled email
export const sendSubscriptionCanceledEmail = async (
  email: string,
  name: string,
  planName: string,
  endDate: Date
): Promise<void> => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Your PrepAcademy Subscription has been Canceled</h1>
        <p>Hello {{name}},</p>
        <p>We're sorry to see you go. Your {{planName}} subscription has been canceled as requested.</p>
        <div style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Access Until:</strong> {{endDate}}</p>
        </div>
        <p>You will continue to have access to all premium features until {{endDate}}. After this date, your account will revert to the free plan with limited access.</p>
        <p>We'd love to hear why you decided to cancel. Your feedback helps us improve our service. Please take a moment to <a href="{{feedbackUrl}}" style="color: #4F46E5;">share your thoughts</a>.</p>
        <p>If you change your mind, you can reactivate your subscription anytime by visiting your <a href="{{subscriptionUrl}}" style="color: #4F46E5;">account settings</a>.</p>
        <p>Thank you for being a PrepAcademy member!</p>
        <p>The PrepAcademy Team</p>
      </div>
    `;

    const template = Handlebars.compile(htmlTemplate);
    const htmlContent = template({
      name,
      planName,
      endDate: formatDate(endDate),
      feedbackUrl: `${process.env.CLIENT_URL}/feedback`,
      subscriptionUrl: `${process.env.CLIENT_URL}/subscription/manage`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@prepacademy.com',
      to: email,
      subject: 'Your PrepAcademy Subscription has been Canceled',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Subscription canceled email sent to ${email}`);
  } catch (error) {
    console.error('Error sending subscription canceled email:', error);
  }
};

// Send payment failed email
export const sendPaymentFailedEmail = async (
  email: string,
  name: string,
  planName: string,
  nextAttemptDate: Date
): Promise<void> => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #DC2626;">Action Required: Payment Failed</h1>
        <p>Hello {{name}},</p>
        <p>We were unable to process your payment for your PrepAcademy {{planName}} subscription.</p>
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p style="margin: 5px 0;"><strong>Subscription Plan:</strong> {{planName}}</p>
          <p style="margin: 5px 0;"><strong>Next Payment Attempt:</strong> {{nextAttemptDate}}</p>
        </div>
        <p>To keep your subscription active and maintain access to all premium features, please update your payment information by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{updatePaymentUrl}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Update Payment Method</a>
        </div>
        <p>If you need any assistance, please don't hesitate to contact our support team at <a href="mailto:support@prepacademy.com" style="color: #4F46E5;">support@prepacademy.com</a>.</p>
        <p>Thank you for being a valued PrepAcademy member!</p>
        <p>The PrepAcademy Team</p>
      </div>
    `;

    const template = Handlebars.compile(htmlTemplate);
    const htmlContent = template({
      name,
      planName,
      nextAttemptDate: formatDate(nextAttemptDate),
      updatePaymentUrl: `${process.env.CLIENT_URL}/subscription/update-payment`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@prepacademy.com',
      to: email,
      subject: 'Action Required: Payment Failed for Your PrepAcademy Subscription',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment failed email sent to ${email}`);
  } catch (error) {
    console.error('Error sending payment failed email:', error);
  }
};

// Send renewal reminder email
export const sendRenewalReminderEmail = async (
  email: string,
  name: string,
  planName: string,
  renewalDate: Date,
  amount: number
): Promise<void> => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Your PrepAcademy Subscription Renewal Reminder</h1>
        <p>Hello {{name}},</p>
        <p>This is a friendly reminder that your PrepAcademy {{planName}} subscription will renew automatically on {{renewalDate}}.</p>
        <div style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Subscription Plan:</strong> {{planName}}</p>
          <p style="margin: 5px 0;"><strong>Renewal Date:</strong> {{renewalDate}}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${{amount}}</p>
        </div>
        <p>No action is required from you. Your subscription will automatically renew to ensure uninterrupted access to all premium features.</p>
        <p>If you wish to make any changes to your subscription, please visit your <a href="{{subscriptionUrl}}" style="color: #4F46E5;">account settings</a>.</p>
        <p>Thank you for being a valued PrepAcademy member!</p>
        <p>The PrepAcademy Team</p>
      </div>
    `;

    const template = Handlebars.compile(htmlTemplate);
    const htmlContent = template({
      name,
      planName,
      renewalDate: formatDate(renewalDate),
      amount: amount.toFixed(2),
      subscriptionUrl: `${process.env.CLIENT_URL}/subscription/manage`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@prepacademy.com',
      to: email,
      subject: 'Your PrepAcademy Subscription Renewal Reminder',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Renewal reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending renewal reminder email:', error);
  }
};

export default {
  sendSubscriptionCreatedEmail,
  sendSubscriptionCanceledEmail,
  sendPaymentFailedEmail,
  sendRenewalReminderEmail
}; 