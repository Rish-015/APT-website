export async function sendWelcomeEmail(email: string, name: string, role: string, password: string = "welcome@123") {
    console.log(`
    ================================================
    EMAIL SENT (MOCK)
    To: ${email}
    Subject: Welcome to Agro Puthalvan!
    
    Hi ${name},
    
    Welcome to Agro Puthalvan. Your account has been created by the administrator as an ${role}.
    
    Your login credentials are:
    Username: ${email}
    Password: ${password}
    
    Please log in at: http://localhost:3000/login
    You will be prompted to change your password upon first login.
    
    Happy Farming!
    ================================================
    `);
    
    // In production, integrate with nodemailer, SendGrid, or Resend here.
    return true;
}

export async function sendApprovalEmail(email: string, name: string) {
    console.log(`
    ================================================
    EMAIL SENT (MOCK)
    To: ${email}
    Subject: Your Agro Puthalvan Account is Approved!
    
    Hi ${name},
    
    Great news! Your registration has been approved by our administrator.
    You can now log in to access all features.
    
    Login here: http://localhost:3000/login
    ================================================
    `);
    return true;
}
