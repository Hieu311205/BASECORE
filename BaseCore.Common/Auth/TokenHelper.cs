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
    public static class TokenHelper
    {
        public static bool ValidateToken(string secretKey, string authToken)
        {
            // Dùng cùng bộ TokenValidationParameters với API để kiểm tra chữ ký và hạn token.
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = GetValidationParameters(secretKey);

            try
            {
                SecurityToken validatedToken;
                IPrincipal principal = tokenHandler.ValidateToken(authToken, validationParameters, out validatedToken);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static string HashPassword(string password, out byte[] salt)
        {
            // Salt ngẫu nhiên giúp hai mật khẩu giống nhau vẫn có hash khác nhau.
            salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                // PBKDF2 kéo dài thời gian brute force so với hash một lần.
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hashed;
        }

        public static bool IsValidPassword(string password, byte[] salt, string hashedParam)
        {
            // Hash lại password nhập vào với salt đã lưu rồi so sánh với hash trong database.
            var hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hashed.Equals(hashedParam);
        }

        public static string GenerateToken(string secretKey, int minuteExpireTime, string userId, string userName, string roles)
        {
            // Claim là dữ liệu các service đọc lại từ JWT để phân quyền và xác định user hiện tại.
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userName),
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Role, roles)
                }),
                Expires = DateTime.UtcNow.AddMinutes(minuteExpireTime),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static TokenValidationParameters GetValidationParameters(string secretKey)
        {
            // Demo project không validate issuer/audience, nhưng vẫn validate chữ ký và thời hạn token.
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true
            };
        }
    }
}
