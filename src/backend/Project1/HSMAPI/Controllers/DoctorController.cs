using HSMBusiness;
using HSMBusiness.Erorrs;
using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs.Doctors;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/doctors")]
    [ApiController]
    public class DoctorController(DoctorService doctorService, DoctorError doctorError) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetDoctorByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDoctorByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var doctor = await doctorService.GetDoctorByID(Id);
            if (doctor.doctorResponse == null)
                return NotFound(new { message = "Doctor not found" });

            return Ok(doctor.doctorResponse);
        }

        [HttpGet("", Name = "GetAllDoctors")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllDoctors()
        {
            var usersList = await doctorService.GetAll();
            if (usersList.Item4 == null)
                return NotFound(new { message = "No doctors found" });

            return Ok(usersList.doctorsList);
        }

        [HttpPost("", Name = "CreateDoctor")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDoctor(DoctorDTO doctor)
        {
            if (string.IsNullOrWhiteSpace(doctor.DepartmentID) || string.IsNullOrWhiteSpace(doctor.Specialization))
            {
                var errors = await doctorError.ValidateDoctor(doctor);
                if (errors.Count > 0)
                {
                    var response = await new ResultPatern().GiveResponse(400, errors);
                    return BadRequest(new
                    {
                        status = response.Status,
                        response = response.Response,
                        isSuccess = response.IsSuccess,
                        errors = response.Errors
                    });
                }
            }

            doctorService.mode = DoctorService.enMode.Add;
            var result = await doctorService.Save(doctor, doctor.ID);

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
                isSuccess = result.IsSuccess,
                errors = result.errors
            });
        }

        [HttpPut("{ID}", Name = "UpdateDoctor")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateDoctor(string ID, DoctorDTO doctor)
        {
            if (string.IsNullOrEmpty(ID))
            {
                var errors = await doctorError.ValidateDoctor(doctor);
                var response = await new ResultPatern().GiveResponse(400, errors);
                return BadRequest(new
                {
                    status = response.Status,
                    response = response.Response,
                    isSuccess = response.IsSuccess,
                    errors = response.Errors
                });
            }
            var CurrDoctor = await doctorService.GetDoctorByID(ID);
            if (CurrDoctor.doctorResponse == null)
            {
                return NotFound(new
                {
                    status = CurrDoctor.Status,
                    response = CurrDoctor.Response,
                    isSuccess = CurrDoctor.IsSuccess,
                    errors = CurrDoctor.errors
                });
            }

            if (string.IsNullOrWhiteSpace(doctor.DepartmentID) || string.IsNullOrWhiteSpace(doctor.Specialization))
            {
                var errors = await doctorError.ValidateDoctor(doctor);
                if (errors.Count > 0)
                {
                    var response = await new ResultPatern().GiveResponse(400, errors);
                    return BadRequest(new
                    {
                        status = response.Status,
                        response = response.Response,
                        isSuccess = response.IsSuccess,
                        errors = response.Errors
                    });
                }
            }
            doctorService.mode = DoctorService.enMode.Update;
            var result = await doctorService.Save(doctor, ID);
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

        [HttpDelete("{id}", Name = "DeleteDoctor")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDoctor(string id)
        {
            if (string.IsNullOrEmpty(id))
                return NotFound(new { message = "ID is not found" });

            var result = await doctorService.Delete(id);

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
