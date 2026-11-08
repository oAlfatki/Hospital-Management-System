using HSMBusiness.Mappers;
using HSMBusiness.Pattern;
using HSMDataAccess.DTOs.Bills;
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
        public BillService(BillRepository repository,PersonService personService,PatientService patientService,BillServiceService billServiceService,enMode mode = enMode.Add)
        {
            _repository = repository;
            _personService = personService;
            _patientService = patientService;
            _billServiceService = billServiceService;
            Mode = mode;
        }
        public async Task<(int Status,string? Response, bool IsSuccess, List<BillResponseDTO>? billsList)> GetAll()
        {
            var bills = await _repository.GetAllAsync();
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (bills == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response, response.IsSuccess, null);
            }
            var result = new List<BillResponseDTO>();
            foreach (var bill in bills)
            {
                var billResult =await new BillResponseMapper().ToResponseDTO(bill);
                result.Add(billResult);
            }
            return (response.Status, response.Response, response.IsSuccess, result.ToList());
        }
        public async Task<(int Status,string Response,bool IsSuccess, BillResponseDTO billDTO1)>GetByID(string ID)
        {
            var bill = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (bill == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response, response.IsSuccess, new BillResponseDTO());
            }
            var billDTO = await new BillResponseMapper().ToResponseDTO(bill);
            return (response.Status, response.Response, response.IsSuccess, billDTO);
        }
        private async Task<(int Status,bool IsSuccess)>_Add(BillDTO billDTO)
        {
            var bill = new BillMapper().ToEntity(billDTO);
            int Status = 200;
            if(!await _patientService.IsPatientExist(bill.PatientID))
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
    }
}
