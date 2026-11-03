using HSMBusiness;
using HSMBusiness.Erorrs;
using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/records")]
    [ApiController]
    public class MedicalRecordController(MedicalRecordService medicalRecordService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetMedicalRecordByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMedicalRecordByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var medicalRecord = await medicalRecordService.GetByID(Id);
            if (medicalRecord.medicalRecordDTO == null)
                return NotFound(new { message = "Medical record not found" });

            return Ok(medicalRecord.medicalRecordDTO);
        }

        [HttpGet("", Name = "GetAllMedicalRecords")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllMedicalRecords()
        {
            var MedicalRecordsList = await medicalRecordService.GetAll();
            if (MedicalRecordsList.Item4 == null)
                return NotFound(new { message = "No records found" });

            return Ok(MedicalRecordsList.ListOfMedicalRecords);
        }

        [HttpPost("", Name = "CreateMedicalRecord")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateMedicalRecord(MedicalRecordDTO medicalRecord)
        {
            if (string.IsNullOrWhiteSpace(medicalRecord.PatientID) || string.IsNullOrWhiteSpace(medicalRecord.AccessLevel))
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
            medicalRecordService._mode = MedicalRecordService.enMode.Add;
            var result = await medicalRecordService.Save(medicalRecord, medicalRecord.ID);

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

        [HttpPut("{ID}", Name = "UpdateMedicalRecord")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateMedicalRecord(string ID, MedicalRecordDTO medicalRecord)
        {
            if (string.IsNullOrWhiteSpace(medicalRecord.PatientID) || string.IsNullOrWhiteSpace(medicalRecord.AccessLevel))
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
            var CurrMedicalRecord = await medicalRecordService.GetByID(ID);
            if (CurrMedicalRecord.medicalRecordDTO == null)
            {
                return NotFound(new
                {
                    status = CurrMedicalRecord.Status,
                    response = CurrMedicalRecord.Response,
                    isSuccess = CurrMedicalRecord.IsSuccess
                });
            }

            medicalRecordService._mode = MedicalRecordService.enMode.Update;
            var result = await medicalRecordService.Save(medicalRecord, ID);
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

        [HttpDelete("{id}", Name = "DeleteMedicalRecord")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMedicalRecord(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await medicalRecordService.Delete(id);

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
