using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;

namespace BaseCore.Common
{
    // Helper class chứa các phương thức xử lý bảo mật: JWT token và mã hóa mật khẩu.
    // static class: không cần tạo instance, gọi trực tiếp: TokenHelper.GenerateToken(...)
    public static class TokenHelper
    {
        // Kiểm tra JWT token có hợp lệ không (chưa hết hạn, chữ ký đúng)
        // Trả về true nếu hợp lệ, false nếu không (hết hạn, bị giả mạo, sai key...)
        public static bool ValidateToken(string secretKey, string authToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = GetValidationParameters(secretKey);

            try
            {
                SecurityToken validatedToken;
                // ValidateToken sẽ throw exception nếu token không hợp lệ
                IPrincipal principal = tokenHandler.ValidateToken(authToken, validationParameters, out validatedToken);
                return true;
            }
            catch (Exception ex)
            {
                return false; // Token không hợp lệ
            }
        }

        // Mã hóa mật khẩu bằng PBKDF2 (Password-Based Key Derivation Function 2)
        // PBKDF2 là thuật toán mã hóa một chiều: không thể giải mã ngược lại
        // Quy trình: password + salt → hash (lưu hash vào database)
        // out byte[] salt: hàm tự tạo salt ngẫu nhiên và trả về qua tham số này
        public static string HashPassword(string password, out byte[] salt)
        {
            // Tạo salt ngẫu nhiên 128-bit (16 bytes) bằng RandomNumberGenerator (cryptographically secure)
            salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt); // Điền bytes ngẫu nhiên vào salt
            }

            // Mã hóa mật khẩu với thuật toán PBKDF2-HMAC-SHA1
            // iterationCount: 10000 lần lặp → chậm hơn có chủ đích để chống brute force
            // numBytesRequested: 256/8 = 32 bytes output
            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hashed; // Trả về chuỗi base64 của hash
        }

        // Kiểm tra mật khẩu nhập vào có khớp với mật khẩu đã lưu không
        // Quy trình: hash lại (password + salt cũ) → so sánh với hash đã lưu
        // salt và hashedParam lấy từ database của user đó
        public static bool IsValidPassword(string password, byte[] salt, string hashedParam)
        {
            // Hash lại mật khẩu với đúng salt đã dùng lúc tạo
            var hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000, // Phải khớp với iterationCount khi hash lần đầu
                numBytesRequested: 256 / 8));

            // So sánh hash vừa tạo với hash đã lưu trong database
            return hashed.Equals(hashedParam);
        }

        // Tạo JWT token chứa thông tin user
        // JWT token gồm 3 phần: Header.Payload.Signature (cách nhau bởi dấu .)
        // Payload chứa các "claim" (thông tin) về user: tên, id, role...
        public static string GenerateToken(string secretKey, int minuteExpireTime, string userId, string userName, string roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            // Chuyển secret key thành bytes để dùng làm khóa ký
            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // Subject chứa các claim (thông tin được nhúng vào token)
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userName),             // Tên đăng nhập
                    new Claim(ClaimTypes.NameIdentifier, userId),     // Id của user
                    new Claim(ClaimTypes.Role, roles)                 // Role: "Admin" hoặc "User"
                }),

                // Token hết hạn sau minuteExpireTime phút (tính từ thời điểm tạo)
                Expires = DateTime.UtcNow.AddMinutes(minuteExpireTime),

                // Ký token bằng HMAC-SHA256 với secret key
                // Ai có secret key mới xác thực được token này
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token); // Trả về chuỗi JWT dạng string
        }

        // Tạo tham số để validate token (dùng nội bộ)
        private static TokenValidationParameters GetValidationParameters(string secretKey)
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,                                          // Bắt buộc kiểm tra chữ ký
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)), // Key để xác thực
                ValidateIssuer = false,    // Không kiểm tra issuer (ai phát hành token)
                ValidateAudience = false,  // Không kiểm tra audience (token dùng cho ai)
                ValidateLifetime = true    // Kiểm tra token có hết hạn chưa
            };
        }
    }
}
