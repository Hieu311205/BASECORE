namespace BaseCore.Entities
{
    public class OrderLog
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int? ChangedBy { get; set; }
        public string? OldStatus { get; set; }
        public string NewStatus { get; set; } = "";
        public string? Note { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.Now;

        public Order? Order { get; set; }
        public User? ChangedByUser { get; set; }
    }
}
