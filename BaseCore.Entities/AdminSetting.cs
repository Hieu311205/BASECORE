namespace BaseCore.Entities
{
    public class AdminSetting
    {
        public int Id { get; set; }
        public string Scope { get; set; } = "";
        public string JsonValue { get; set; } = "{}";
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
