import nodemailer from 'nodemailer';

export const sendOrganizationApprovalEmail = async (organization) => {

    console.log("Organization:", organization);
    
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "solutions@camet.in",
      to: `${organization.email}`,
      subject: "Welcome to Camet IT Solutions - Registration Success",
      text: `Dear ${organization.owner.userName},\n\nGreetings from Camet IT Solutions!\n\nWe are delighted to inform you that your registration with Camet IT Solutions has been successfully completed, and your approval for the company ${organization.name} is now confirmed.\n\nHere are your account details:\n\n- User ID: ${organization.owner._id}\n- Company ID: ${organization._id}\n\nWith these credentials, you now have access to the resources and services provided by Camet IT Solutions. We trust that you will find our offerings beneficial for your professional needs.\n\nShould you have any questions or require assistance, please feel free to reach out to our support team at solutions@camet.in or contact us directly at  9072632602.\n\nThank you for choosing Camet IT Solutions. We look forward to serving you and supporting your success in the future.\n\nBest regards,\n\nCAMET IT SOLUTIONS LLP\n2nd Floor, 5/215 A9, Puliyana Building\nFactory Road, North Kalamassery\nErnakulam Pincode : 683104\nContact No. 9072632602\nEmail ID : solutions@camet.in`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent:" + info.response);
    return { success: true, info };
  } catch (emailError) {
    console.log("Email error:", emailError);
    return { success: false, error: emailError.message };
  }
};