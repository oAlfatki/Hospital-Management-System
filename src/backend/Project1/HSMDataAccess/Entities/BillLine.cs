namespace HSMDataAccess.Entities;

public class BillLine
{
    public string ID { get; set; } = Guid.NewGuid().ToString("N")[..10];
    public string BillID { get; set; } = "";
    public string ServiceName { get; set; } = "";
    public decimal Cost { get; set; }
    public Bill Bill { get; set; } = null!;
}

public class Payment
{
    public string ID { get; set; } = Guid.NewGuid().ToString("N")[..10];
    public string BillID { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime PaidOn { get; set; } = DateTime.UtcNow;
    public Bill Bill { get; set; } = null!;
}
