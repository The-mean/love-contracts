const nodemailer = require('nodemailer');
require('dotenv').config();

// Email gönderici yapılandırması
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email şablonları
const emailTemplates = {
    invitation: (invitedEmail, contractTitle, inviterEmail) => ({
        subject: 'Love Contracts - Sözleşme Daveti',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7C3AED;">Sözleşme Davetiniz Var!</h2>
                <p>Merhaba,</p>
                <p><strong>${inviterEmail}</strong> sizi <strong>${contractTitle}</strong> başlıklı sözleşmeye ortak olmaya davet etti.</p>
                <p>Daveti görüntülemek ve yanıtlamak için aşağıdaki butona tıklayın:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Daveti Görüntüle
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Bu email Love Contracts uygulaması tarafından gönderilmiştir.
                </p>
            </div>
        `
    }),

    contractUpdate: (email, contractTitle, updaterEmail) => ({
        subject: 'Love Contracts - Sözleşme Güncellendi',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7C3AED;">Sözleşmeniz Güncellendi</h2>
                <p>Merhaba,</p>
                <p>Ortak olduğunuz <strong>${contractTitle}</strong> başlıklı sözleşme, <strong>${updaterEmail}</strong> tarafından güncellendi.</p>
                <p>Değişiklikleri görüntülemek için aşağıdaki butona tıklayın:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Sözleşmeyi Görüntüle
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Bu email Love Contracts uygulaması tarafından gönderilmiştir.
                </p>
            </div>
        `
    }),

    externalShare: (email, contractTitle, ownerEmail, shareToken) => ({
        subject: 'Love Contracts - Sizinle Bir Sözleşme Paylaşıldı',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7C3AED;">Sizinle Bir Sözleşme Paylaşıldı!</h2>
                <p>Merhaba,</p>
                <p><strong>${ownerEmail}</strong> sizinle <strong>${contractTitle}</strong> başlıklı bir sözleşme paylaştı.</p>
                <p>Sözleşmeyi görüntülemek ve yanıtlamak için aşağıdaki butona tıklayın:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/external-share/${shareToken}" 
                       style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Sözleşmeyi Görüntüle
                    </a>
                </div>
                <p>Bu link 7 gün boyunca geçerlidir. Sözleşmeyi inceledikten sonra onaylayabilir veya reddedebilirsiniz.</p>
                <p style="color: #666; font-size: 14px;">
                    Bu email Love Contracts uygulaması tarafından gönderilmiştir.<br>
                    Eğer bu e-postayı yanlışlıkla aldıysanız lütfen dikkate almayın.
                </p>
            </div>
        `
    })
};

// Email gönderme fonksiyonu
const sendEmail = async (to, template) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email gönderildi:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email gönderme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Davet emaili gönder
const sendInvitationEmail = async (invitedEmail, contractTitle, inviterEmail) => {
    const template = emailTemplates.invitation(invitedEmail, contractTitle, inviterEmail);
    return await sendEmail(invitedEmail, template);
};

// Güncelleme bildirimi gönder
const sendUpdateNotification = async (email, contractTitle, updaterEmail) => {
    const template = emailTemplates.contractUpdate(email, contractTitle, updaterEmail);
    return await sendEmail(email, template);
};

// Harici paylaşım emaili gönder
const sendExternalShareEmail = async (email, contractTitle, ownerEmail, shareToken) => {
    const template = emailTemplates.externalShare(email, contractTitle, ownerEmail, shareToken);
    return await sendEmail(email, template);
};

module.exports = {
    sendInvitationEmail,
    sendUpdateNotification,
    sendExternalShareEmail
}; 