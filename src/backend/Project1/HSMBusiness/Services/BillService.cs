using HSMBusiness.dto;
using static HSMBusiness.Pattern.ResultPatern;
using static HSMBusiness.Pattern.BusinessRules;
using HSMBusiness.Mappers;
using HSMBusiness.Pattern;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using HSMDataAccess.RepositoryServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Services
{
    public class BillService
    {
        private readonly BillRepository _repository;
        private readonly NotificationService _notificationService;
        private readonly PersonService _personService;
        private readonly BillServiceService _billServiceService;
        private readonly PatientService _patientService;
        public enum enMode { Add = 0, Update }
        public enMode Mode = enMode.Add;
        ResultPatern resultPattern = new ResultPatern();
        public BillRepository billRepository
        {
            get
            {
                return _repository;
            }
        }
        private async Task<bool> IsBillAtLeastOn(string BillID)
        {
            if(await _billServiceService.IsBillExist(BillID))
            {
                return true;
            }
            return false;
        }
        public BillService(BillRepository repository,PersonService personService,PatientService patientService,BillServiceService billServiceService,NotificationService notificationService,enMode mode = enMode.Add)
        {
            _repository = repository;
            _notificationService = notificationService;
            _personService = personService;
            _patientService = patientService;
            _billServiceService = billServiceService;
            Mode = mode;
        }
        public async Task<(int Status,string? Response, bool IsSuccess, List<BillDTO>? billsList)> GetAll()
        {
            var bills = await _repository.GetAllAsync();
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (bills == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response, response.IsSuccess, null);
            }
            return (response.Status, response.Response, response.IsSuccess, bills.Select(b=>new BillMapper().ToDTO(b)).ToList());
        }
        public async Task<(int Status,string Response,bool IsSuccess,BillDTO billDTO1)>GetByID(string ID)
        {
            var bill = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (bill == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response, response.IsSuccess, new BillDTO());
            }
            return (response.Status, response.Response, response.IsSuccess, new BillMapper().ToDTO(bill));
        }
        private async Task<(int Status,bool IsSuccess)>_Add(BillDTO billDTO)
        {
            var bill = new BillMapper().ToEntity(billDTO);
            int Status = 200;
            if(!await _patientService.IsPatientExist(bill.ID))
            {
                Status = 500;
                return (Status,false);
            }
            var AddNew = await _repository.AddAsync(bill);
            bill.ID = AddNew.ID;
            if (string.IsNullOrEmpty(bill.ID))
            {
                Status = 500;
                return (Status, false);
            }
            return (Status,true);
        }
        private async Task<(int,string?,bool)>_Update(BillDTO billDTO,string ID)
        {
            var bill = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (!await _patientService.IsPatientExist(ID))
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            if(bill.Status!= "Cancelled" || bill.Status!= "Partially Paid" || bill.Status!= "Unpaid" || bill.Status != "Paid")
            {
                response = await resultPattern.GiveResponse(500, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            if (bill == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            bill = new BillMapper().ToEntity(billDTO);
            await _repository.UpdateAsync(bill);
            return (response.Status, response.Response, response.IsSuccess);
        }
        public async Task<(int Status,string? Response,bool IsSuccess)>Delete(string ID)
        {
            var bill = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (bill == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            if(await IsBillAtLeastOn(ID))
            {
                response = await resultPattern.GiveResponse(500, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            bool IsDeleted = await _repository.DeleteAsync(bill);
            if (!IsDeleted)
            {
                response = await resultPattern.GiveResponse(500, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess);
            }
            return (response.Status, response.Response, response.IsSuccess);
        }
        public async Task<(int Status, string?Response, bool IsSuccess)>Save(BillDTO billDTO,string ID = "")
        {
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            switch (Mode)
            {
                case enMode.Add:
                    var NewBill = await _Add(billDTO);
                    if (NewBill.IsSuccess)
                    {
                            Mode = enMode.Update;
                    }
                    else
                    {
                        response = await resultPattern.GiveResponse(NewBill.Status, new Dictionary<string, string>());
                    }
                    return (response.Status, response.Response, response.IsSuccess);
                case enMode.Update:
                    return await _Update( billDTO, ID);
            }
            return (response.Status, response.Response, response.IsSuccess);
        }

        public Task<ResultResponse<IReadOnlyList<BillResponse>>> GetInvoiceProfilesAsync() => ExecuteAsync<IReadOnlyList<BillResponse>>(async () =>
            (await _repository.GetDetailedAsync()).Select(ToInvoiceResponse).ToList());
        public Task<ResultResponse<BillResponse>> GetInvoiceProfileAsync(string id) => ExecuteAsync(async () =>
            ToInvoiceResponse(Found(await _repository.GetDetailedByIdAsync(id), "Invoice not found.")));
        public Task<ResultResponse<BillResponse>> CreateInvoiceAsync(BillRequest request, string actor) => ExecuteAsync(async () =>
        {
            Require(await _patientService.IsActivePatientAsync(request.PatientId), "Active patient not found.", 404);
            Require(request.DueDate >= DateOnly.FromDateTime(DateTime.UtcNow), "Due date cannot be in the past.");
            var (subtotal, discount, taxPercent, total) = CalculateInvoice(request);
            var bill = new Bill { ID = Id(), PatientID = request.PatientId, Status = "Unpaid", Date = DateTime.UtcNow,
                DueDate = request.DueDate.ToDateTime(TimeOnly.MinValue), Invoice = $"INV-{Guid.NewGuid():N}", GrossAmount = subtotal,
                Discount = discount, TaxPercent = taxPercent, PatientResponsibility = total, PartialPaymentAmount = 0, CreatedBy = actor,
                Lines = request.Services.Select(s => new BillLine { ServiceName = s.ServiceName.Trim(), Cost = Money(s.Cost) }).ToList() };
            _repository.StageAdd(bill);
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Billing", "Create", bill.ID));
            return ToInvoiceResponse(bill);
        }, 201);
        public Task<ResultResponse<BillResponse>> UpdateInvoiceAsync(string id, BillRequest request, string actor) => ExecuteAsync(() => _repository.InTransactionAsync(async () =>
        {
            var bill = Found(await _repository.GetDetailedByIdAsync(id), "Invoice not found.");
            Require((bill.PartialPaymentAmount ?? 0) == 0 && bill.Payments.Count == 0 && bill.Status != "Cancelled", "Invoices with payments or cancelled invoices cannot be edited.", 409);
            Require(await _patientService.IsActivePatientAsync(request.PatientId), "Active patient not found.", 404);
            Require(request.DueDate >= DateOnly.FromDateTime(DateTime.UtcNow), "Due date cannot be in the past.");
            var (subtotal, discount, taxPercent, total) = CalculateInvoice(request);
            bill.PatientID = request.PatientId; bill.GrossAmount = subtotal; bill.Discount = discount; bill.TaxPercent = taxPercent;
            bill.PatientResponsibility = total; bill.DueDate = request.DueDate.ToDateTime(TimeOnly.MinValue);
            bill.Lines.Clear();
            foreach (var item in request.Services) bill.Lines.Add(new BillLine { ServiceName = item.ServiceName.Trim(), Cost = Money(item.Cost) });
            bill.Revision++; bill.UpdatedOn = DateTime.UtcNow;
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Billing", "Update", id));
            return ToInvoiceResponse(bill);
        }));
        public Task<ResultResponse<BillResponse>> RecordInvoicePaymentAsync(string id, PaymentRequest request, string actor) => ExecuteAsync(() => _repository.InTransactionAsync(async () =>
        {
            var bill = Found(await _repository.GetDetailedByIdAsync(id), "Invoice not found.");
            var amount = Money(request.AmountToPay); var paid = bill.PartialPaymentAmount ?? 0;
            Require(bill.Status != "Cancelled" && amount > 0 && amount <= Money(bill.PatientResponsibility - paid), "Payment exceeds outstanding balance or invoice is cancelled.", 409);
            bill.PartialPaymentAmount = paid + amount; bill.Status = bill.PartialPaymentAmount == bill.PatientResponsibility ? "Paid" : "Partially Paid";
            bill.Revision++; bill.UpdatedOn = DateTime.UtcNow; bill.Payments.Add(new Payment { Amount = amount });
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Billing", "Update", id));
            return ToInvoiceResponse(bill);
        }));
        public Task<ResultResponse<NotificationResponse>> QueueInvoiceReminderAsync(string id, string actor) => ExecuteAsync(async () =>
        {
            var bill = Found(await _repository.GetByIDAsync(id), "Invoice not found.");
            Require(bill.Status != "Cancelled" && bill.PatientResponsibility > (bill.PartialPaymentAmount ?? 0), "Invoice is already paid.", 409);
            return await _notificationService.QueuePaymentReminderAsync(bill.PatientID, bill.Invoice, actor);
        }, 202);
        public Task<ResultResponse<bool>> DeleteInvoiceAsync(string id, string actor) => ExecuteAsync(async () =>
        {
            var bill = Found(await _repository.GetDetailedByIdAsync(id), "Invoice not found.");
            Require((bill.PartialPaymentAmount ?? 0) == 0, "Invoices with payments cannot be deleted.", 409);
            _repository.StageRemove(bill);
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Billing", "Delete", id));
            return true;
        }, 204);

        private static (decimal Subtotal, decimal Discount, decimal TaxPercent, decimal Total) CalculateInvoice(BillRequest request)
        {
            var subtotal = request.Services.Sum(s => Money(s.Cost));
            var discount = Money(request.DiscountAmount); var taxPercent = Money(request.TaxPercent);
            var total = Money(subtotal + Money(subtotal * taxPercent / 100) - discount);
            Require(subtotal <= 99999999 && total <= 99999999 && total > 0 && discount <= subtotal, "Discount must not exceed subtotal and total must be positive.");
            return (subtotal, discount, taxPercent, total);
        }
        private static BillResponse ToInvoiceResponse(Bill bill)
        {
            var due = Money(bill.PatientResponsibility - (bill.PartialPaymentAmount ?? 0));
            var status = bill.Status == "Cancelled" ? "Cancelled" : bill.Status == "Pending Insurance" ? "Pending Insurance" : due <= 0 ? "Paid"
                : bill.DueDate?.Date < DateTime.UtcNow.Date ? "Overdue" : "Pending";
            return BillMapper.ToResponse(bill, due, status);
        }
    }
}
