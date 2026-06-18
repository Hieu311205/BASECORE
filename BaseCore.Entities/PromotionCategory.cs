namespace BaseCore.Entities
{
    public class PromotionCategory
    {
        public int PromotionId { get; set; }
        public int CategoryId { get; set; }

        public Promotion? Promotion { get; set; }
        public Category? Category { get; set; }
    }
}
