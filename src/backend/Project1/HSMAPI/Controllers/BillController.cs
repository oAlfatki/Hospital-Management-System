using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs.Bills;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/billing")]
    [ApiController]
    public class BillController(BillService billService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetBillByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBillByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var bill = await billService.GetByID(Id);
            if (bill.billDTO1 == null)
                return NotFound(new { message = "Bill not found" });

            return Ok(bill.billDTO1);
        }

        [HttpGet("", Name = "GetAllBills")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllBills()
        {
            var peopleList = await billService.GetAll();
            if (peopleList.billsList == null)
                return NotFound(new { message = "No bills found" });

            return Ok(peopleList.billsList);
        }

        [HttpPost("", Name = "CreateBill")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateBill(BillDTO bill)
        {
            if (bill == null)
            {
                var response = await new ResultPatern().GiveResponse(404, null);
                return NotFound(new
                {
                    status = response.Status,
                    response = response.Response,
                    isSuccess = response.IsSuccess,
                    errors = response.Errors
                });
            }
            if (string.IsNullOrWhiteSpace(bill.PatientID) || string.IsNullOrWhiteSpace(bill.Status) || string.IsNullOrWhiteSpace(bill.Invoice) ||
                bill.GrossAmount < 0 || bill.PatientResponsibility < 0)
            {
                var response = await new ResultPatern().GiveResponse(400, null);
                return BadRequest(new
                {
                    status = response.Status,
                    response = response.Response,
                    isSuccess = response.IsSuccess,
                    errors = response.Errors
                });
            }

            billService.Mode = BillService.enMode.Add;
            var result = await billService.Save(bill, bill.ID);

            if (!result.IsSuccess)
            {
                return StatusCode(result.Status, new
                {
                    status = result.Status,
                    response = result.Response,
                    isSuccess = result.IsSuccess
                });
            }
            return Ok(new
            {
                status = result.Status,
                response = result.Response,
                isSuccess = result.IsSuccess
            });
        }

        [HttpPut("{ID}", Name = "UpdateBill")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateBill(string ID, BillDTO bill)
        {
            if (string.IsNullOrWhiteSpace(bill.PatientID) || string.IsNullOrWhiteSpace(bill.Status) || string.IsNullOrWhiteSpace(bill.Invoice) ||
                bill.GrossAmount < 0 || bill.PatientResponsibility < 0 || string.IsNullOrEmpty(ID))
            {
                var response = await new ResultPatern().GiveResponse(400, null);
                return BadRequest(new
                {
                    status = response.Status,
                    response = response.Response,
                    isSuccess = response.IsSuccess,
                    errors = response.Errors
                });
            }

            var CurrBill = await billService.GetByID(ID);
            if (CurrBill.billDTO1 == null)
            {
                return NotFound(new
                {
                    status = CurrBill.Status,
                    response = CurrBill.Response,
                    isSuccess = CurrBill.IsSuccess
                });
            }

            // FIX: was enMode.Add — must be enMode.Update
            billService.Mode = BillService.enMode.Update;
            var result = await billService.Save(bill, ID);

            if (!result.IsSuccess)
                return StatusCode(result.Status, new
                {
                    status = result.Status,
                    response = result.Response,
                    isSuccess = result.IsSuccess
                });
            return Ok(new
            {
                status = result.Status,
                response = result.Response,
                isSuccess = result.IsSuccess
            });
        }

        [HttpDelete("{id}", Name = "DeleteBill")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteBill(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await billService.Delete(id);

            if (!result.IsSuccess)
                return StatusCode(result.Status, new
                {
                    status = result.Status,
                    response = result.Response,
                    isSuccess = result.IsSuccess
                });

            return Ok(new
            {
                status = result.Status,
                response = result.Response,
                isSuccess = result.IsSuccess
            });
        }
    }
}
