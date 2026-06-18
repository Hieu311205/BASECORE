namespace BaseCore.Entities
{
    public class Promotion
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string PromoType { get; set; } = "percent";
        public decimal Value { get; set; }
        public decimal MinOrder { get; set; }
        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
        public ICollection<PromotionCategory> PromotionCategories { get; set; } = new List<PromotionCategory>();
    }
}
