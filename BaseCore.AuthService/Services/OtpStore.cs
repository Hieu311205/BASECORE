using System.Collections.Concurrent;

namespace BaseCore.AuthService.Services
{
    // Singleton: lưu OTP tạm thời trong bộ nhớ, tự hết hạn sau 5 phút.
    public class OtpStore
    {
        private readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _store = new();

        public string GenerateAndStore(string email)
        {
            var code = Random.Shared.Next(100000, 999999).ToString();
            _store[email.ToLower()] = (code, DateTime.UtcNow.AddMinutes(5));
            return code;
        }

        // Trả true nếu đúng mã và còn hạn; xóa luôn để OTP chỉ dùng được 1 lần.
        public bool Verify(string email, string code)
        {
            var key = email.ToLower();
            if (!_store.TryGetValue(key, out var entry)) return false;
            if (DateTime.UtcNow > entry.Expiry) { _store.TryRemove(key, out _); return false; }
            if (entry.Code != code) return false;
            _store.TryRemove(key, out _);
            return true;
        }
    }
}
