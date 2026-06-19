using System.Net;
using System.Net.Mail;

namespace BaseCore.AuthService.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config) => _config = config;

        public async Task SendOtpAsync(string toEmail, string otp)
        {
            var host = _config["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.Parse(_config["Smtp:Port"] ?? "587");
            var username = _config["Smtp:Username"] ?? "";
            var password = _config["Smtp:Password"] ?? "";
            var fromName = _config["Smtp:FromName"] ?? "Lumière Perfume";

            using var mail = new MailMessage();
            mail.From = new MailAddress(username, fromName);
            mail.To.Add(toEmail);
            mail.Subject = "[Lumière Perfume] Mã OTP xác nhận thanh toán";
            mail.IsBodyHtml = true;
            mail.Body = $@"
<div style='font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;border:1px solid #d4af37;border-radius:10px;padding:28px;'>
    <h2 style='color:#d4af37;font-family:Georgia,serif;margin:0 0 16px;'>Lumière Perfume</h2>
    <p style='color:#ccc;margin:0 0 12px;'>Mã OTP xác nhận thanh toán Google Pay của bạn:</p>
    <div style='background:#1a1a1a;border:1px solid #d4af37;border-radius:8px;padding:18px 0;text-align:center;margin:20px 0;'>
        <span style='font-size:36px;font-weight:700;letter-spacing:12px;color:#d4af37;'>{otp}</span>
    </div>
    <p style='color:#999;font-size:13px;margin:0 0 8px;'>Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này cho bất kỳ ai.</p>
    <hr style='border:none;border-top:1px solid #333;margin:20px 0;'>
    <p style='color:#666;font-size:12px;margin:0;'>© 2026 Lumière Perfume. Nếu bạn không thực hiện giao dịch này, hãy bỏ qua email này.</p>
</div>";

            using var client = new SmtpClient(host, port);
            client.EnableSsl = true;
            client.Credentials = new NetworkCredential(username, password);
            await client.SendMailAsync(mail);
        }
    }
}
