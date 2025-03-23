# PrepAcademy Manual Testing Plan

This document outlines the process for manually testing key features of the PrepAcademy application. Follow these procedures to verify functionality and identify potential issues.

## Environment Setup

Before testing, ensure:

1. The server is running (`npm run dev` from the server directory)
2. The client is running (`npm start` from the client directory)
3. MongoDB is running and accessible
4. All required environment variables are set in `.env`
5. Log files will be generated in the `/logs` directory

## 1. User Authentication Testing

### 1.1 User Registration

1. **Test Case:** Register a new user
   - Navigate to the registration page
   - Fill in all required fields with valid data
   - Submit the form
   - **Expected Result:** User is registered successfully and redirected to login
   - **Verification:** Check the logs in `application-YYYY-MM-DD.log` for:
     - Registration event with user ID
     - Database operation creating the user

2. **Test Case:** Attempt registration with existing email
   - Navigate to the registration page
   - Enter an email that already exists in the system
   - Fill in other required fields
   - Submit the form
   - **Expected Result:** Error message shown to user
   - **Verification:** Check the logs for error message indicating duplicate email

3. **Test Case:** Attempt registration with invalid data
   - Navigate to the registration page
   - Submit the form with invalid data (e.g., mismatched passwords, invalid email)
   - **Expected Result:** Validation errors displayed to user
   - **Verification:** Check the logs for validation errors

### 1.2 User Login

1. **Test Case:** Login with valid credentials
   - Navigate to the login page
   - Enter valid email and password
   - Submit the form
   - **Expected Result:** User is logged in and redirected to dashboard
   - **Verification:** Check logs for login success event

2. **Test Case:** Login with invalid credentials
   - Navigate to the login page
   - Enter invalid email or password
   - Submit the form
   - **Expected Result:** Error message shown
   - **Verification:** Check logs for login failure event

3. **Test Case:** Password reset functionality
   - Navigate to the login page
   - Click on "Forgot Password"
   - Enter registered email
   - Complete reset process
   - **Expected Result:** User receives reset email and can set new password
   - **Verification:** Check logs for password reset events

## 2. Subscription and Payment Testing

### 2.1 Subscription Purchase

1. **Test Case:** Complete subscription purchase
   - Login as a regular user
   - Navigate to subscription page
   - Select a subscription plan
   - Complete checkout process with test card details
   - **Expected Result:** Subscription is activated for the user
   - **Verification:** 
     - Check logs for subscription creation event
     - Verify user has subscription in database
     - Verify receipt email sent

2. **Test Case:** Failed payment
   - Login as a regular user
   - Attempt to purchase subscription with invalid card (e.g., Stripe test card for decline)
   - **Expected Result:** Payment declined message shown
   - **Verification:** Check logs for payment failure event

3. **Test Case:** Subscription cancellation
   - Login as a user with active subscription
   - Navigate to account settings
   - Cancel subscription
   - **Expected Result:** Cancellation confirmed, subscription marked for non-renewal
   - **Verification:** Check logs for subscription cancellation event

### 2.2 Webhook Processing

1. **Test Case:** Simulate Stripe webhook events
   - Use Stripe CLI or dashboard to send test webhook events
   - **Expected Result:** Events processed correctly
   - **Verification:** Check logs for webhook processing entries

## 3. Content Access and Interaction

### 3.1 Study Plan Creation

1. **Test Case:** Create new study plan
   - Login as a regular user
   - Navigate to study plan section
   - Create a new personalized study plan
   - **Expected Result:** Plan is created and displayed to user
   - **Verification:** Check logs for study plan creation

2. **Test Case:** Update existing study plan
   - Login as a user with existing study plan
   - Modify plan parameters
   - Save changes
   - **Expected Result:** Plan is updated with new settings
   - **Verification:** Check logs for study plan update operation

### 3.2 Practice Questions and Exams

1. **Test Case:** Answer practice questions
   - Login as a regular user
   - Navigate to practice section
   - Complete a set of practice questions
   - **Expected Result:** Answers recorded, scores calculated
   - **Verification:** Check logs for question response events

2. **Test Case:** Take a full practice exam
   - Login as a regular user
   - Start a practice exam
   - Complete all questions
   - Submit exam
   - **Expected Result:** Exam scored correctly, results shown
   - **Verification:** Check logs for exam completion events

### 3.3 Performance Tracking

1. **Test Case:** View performance analytics
   - Login as a user who has completed questions/exams
   - Navigate to performance dashboard
   - **Expected Result:** Accurate statistics and charts displayed
   - **Verification:** Check database for correct score calculations

## 4. Administrative Functions

### 4.1 Content Management

1. **Test Case:** Add new question (admin only)
   - Login as admin user
   - Navigate to content management
   - Create new practice question
   - **Expected Result:** Question created and available in system
   - **Verification:** Check logs for content creation event

2. **Test Case:** Review flagged content
   - Login as admin/expert
   - View flagged content list
   - Review and update content
   - **Expected Result:** Content updated, flag resolved
   - **Verification:** Check logs for content review events

## 5. Error Handling and Edge Cases

1. **Test Case:** Network disconnection
   - Login to the application
   - Disable network connection
   - Attempt to perform actions
   - **Expected Result:** Appropriate error messages, no data loss
   - **Verification:** Check error logs once connection restored

2. **Test Case:** Database unavailability
   - Temporarily stop MongoDB service
   - Attempt to perform database operations
   - **Expected Result:** Graceful handling with appropriate error messages
   - **Verification:** Check error logs for database connection failures

3. **Test Case:** Invalid API requests
   - Use a tool like Postman to send malformed requests
   - **Expected Result:** Proper validation and error responses
   - **Verification:** Check logs for validation errors

## 6. Cross-Device Testing

1. **Test Case:** Mobile responsiveness
   - Access the application from mobile devices or simulators
   - Navigate through key workflows
   - **Expected Result:** UI adapts properly, all functions work
   - **Verification:** Visual inspection and functionality verification

2. **Test Case:** Different browsers
   - Test on Chrome, Firefox, Safari, and Edge
   - **Expected Result:** Consistent experience across browsers
   - **Verification:** Visual inspection and functionality verification

## 7. Performance Testing

1. **Test Case:** Load times
   - Monitor page load times for main sections
   - **Expected Result:** Pages load within acceptable timeframes
   - **Verification:** Browser developer tools network tab

2. **Test Case:** Concurrent users (simulated)
   - Use a tool to simulate multiple concurrent users
   - **Expected Result:** System remains responsive
   - **Verification:** Check server logs for response times

## Test Results Documentation

For each test, document:

1. Test date and time
2. Tester name
3. Environment details (browser, OS)
4. Steps performed
5. Actual results
6. Pass/Fail status
7. Any unexpected behavior
8. Screenshots of issues
9. Log file snippets related to the test

## Issue Reporting Process

When reporting issues:

1. Provide a clear title describing the issue
2. Include reproduction steps
3. Attach relevant log excerpts
4. Note the environment in which the issue occurred
5. Indicate severity (Critical, Major, Minor, Cosmetic)
6. Include screenshots or videos if applicable

## Log Analysis

After testing, analyze logs to:

1. Identify patterns in errors
2. Detect performance bottlenecks
3. Verify security measures are working
4. Ensure all expected log entries are present
5. Check for unexpected warnings or errors 