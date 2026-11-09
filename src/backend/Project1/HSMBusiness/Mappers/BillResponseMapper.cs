using HSMDataAccess.DTOs.Bills;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class BillResponseMapper
    {
        public async Task <BillResponseDTO> ToResponseDTO(Bill bill)
        {

            return new BillResponseDTO(bill.ID, bill.PatientID, bill.PartialPaymentAmount,bill.Discount, bill.GrossAmount, bill.Status, bill.Date, bill.DueDate, false, "", DateTime.Now,DateTime.Now);
        }
    }
}
