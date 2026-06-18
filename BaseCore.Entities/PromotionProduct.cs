namespace BaseCore.Entities
{
    public class PromotionProduct
    {
        public int PromotionId { get; set; }
        public int ProductId { get; set; }

        public Promotion? Promotion { get; set; }
        public Product? Product { get; set; }
    }
}
