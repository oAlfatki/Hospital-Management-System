using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs.Bills
{
    public class BillResponseDTO
    {
        public string BillId { get; set; }
        public string PatientId { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal TaxPercent { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal? PendingDue { get; set; }
        public string Status { get; set; }
        public DateTime? PaymentDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool InvoiceGenerated { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public BillResponseDTO()
        {

        }
        public BillResponseDTO(string billId,string patientId,decimal? subtotal,decimal? discountAmount,decimal paidAmount,string status,DateTime? paymentDate,DateTime? dueDate,bool invoiceGenerated,string createdBy,DateTime? createdOn,DateTime? updatedOn)
        {
            BillId = billId;
            PatientId = patientId;
            Subtotal = subtotal;//partialammount
            TaxPercent = 0.05m;
            DiscountAmount = discountAmount;
            TotalAmount = (Subtotal + Subtotal*TaxPercent)-DiscountAmount;
            PaidAmount = paidAmount;
            PendingDue = TotalAmount - PaidAmount;
            Status = status;
            PaymentDate = paymentDate;
            DueDate = dueDate;
            InvoiceGenerated = invoiceGenerated;
            CreatedBy = createdBy;
            CreatedOn = createdOn;
            UpdatedOn = updatedOn;
        }
    }
}
