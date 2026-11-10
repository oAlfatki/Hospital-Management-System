using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/patients")]
    [ApiController]
    public class PatientController(PatientService patientService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetPatientByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get a patient", Description = "Gets a patient by its identifier.")]
        [ProducesResponseType(typeof(PatientDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPatientByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var patient = await patientService.GetByID(Id);
            if (patient.patientDTO1 == null)
                return NotFound(new { message = "Patient not found" });

            return Ok(patient.patientDTO1);
        }

        [HttpGet("", Name = "GetAllPatients")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get all patients", Description = "Gets all patients.")]
        [ProducesResponseType(typeof(IEnumerable<PatientDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllPatients()
        {
            var PatientRecordsList = await patientService.GetAll();
            if (PatientRecordsList.ListOfPatients == null)
                return NotFound(new { message = "No patients found" });

            return Ok(PatientRecordsList.ListOfPatients);
        }

        [HttpPost("", Name = "CreatePatient")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(Summary = "Create a patient", Description = "Creates a new patient.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreatePatient(PatientDTO patientDTO)
        {
            if (string.IsNullOrWhiteSpace(patientDTO.MedicalHistory) || string.IsNullOrEmpty(patientDTO.PersonID))
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
            patientService._Mode = PatientService.enMode.Add;
            var result = await patientService.Save(patientDTO, patientDTO.ID);

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

        [HttpPut("{ID}", Name = "UpdatePatient")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Update a patient", Description = "Updates an existing patient by its identifier.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdatePatient(string ID, PatientDTO patientDTO)
        {
            if (string.IsNullOrWhiteSpace(patientDTO.MedicalHistory) || string.IsNullOrEmpty(patientDTO.PersonID) || string.IsNullOrWhiteSpace(ID))
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
            var CurrPatient = await patientService.GetByID(ID);
            if (CurrPatient.patientDTO1 == null)
            {
                return NotFound(new
                {
                    status = CurrPatient.Status,
                    response = CurrPatient.Response,
                    isSuccess = CurrPatient.IsSuccess
                });
            }

            CurrPatient.patientDTO1 = patientDTO;
            patientService._Mode = PatientService.enMode.Update;
            var result = await patientService.Save(patientDTO, ID);
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

        [HttpDelete("{id}", Name = "DeletePatient")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Delete a patient", Description = "Deletes a patient by its identifier.")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeletePatient(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await patientService.Delete(id);

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
