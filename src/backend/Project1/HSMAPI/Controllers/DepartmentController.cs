using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/departments")]
    [ApiController]
    public class DepartmentController(DepartmentService departmentService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetDepartmentByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get a department", Description = "Gets a department by its identifier.")]
        [ProducesResponseType(typeof(DepartmentDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDepartmentByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var department = await departmentService.GetByID(Id);
            if (department.departmentDTO1 == null)
                return NotFound(new { message = "Department not found" });

            return Ok(department.departmentDTO1);
        }

        [HttpGet("", Name = "GetAllDepartments")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get all departments", Description = "Gets all departments.")]
        [ProducesResponseType(typeof(IEnumerable<DepartmentDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllDepartments()
        {
            var ListDepartments = await departmentService.GetAll();
            if (ListDepartments.ListDepartments == null)
                return NotFound(new { message = "No departments found" });

            // FIX: was key 'people' — now correctly returns departments array
            return Ok(ListDepartments.ListDepartments);
        }

        [HttpPost("", Name = "CreateDepartment")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Create a department", Description = "Creates a new department.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateDepartment(DepartmentDTO department)
        {
            if (department == null)
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
            if (string.IsNullOrWhiteSpace(department.Name))
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

            departmentService._mode = DepartmentService.enMode.Add;
            var result = await departmentService.Save(department, department.ID);

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

        [HttpPut("{ID}", Name = "UpdateDepartment")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Update a department", Description = "Updates an existing department by its identifier.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateDepartment(string ID, DepartmentDTO department)
        {
            if (string.IsNullOrWhiteSpace(department.Name) || string.IsNullOrEmpty(ID))
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

            var CurrDepartment = await departmentService.GetByID(ID);
            if (CurrDepartment.departmentDTO1 == null)
            {
                return NotFound(new
                {
                    status = CurrDepartment.Status,
                    response = CurrDepartment.Response,
                    isSuccess = CurrDepartment.IsSuccess
                });
            }

            // FIX: was enMode.Add — must be enMode.Update
            departmentService._mode = DepartmentService.enMode.Update;
            var result = await departmentService.Save(department, ID);

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

        [HttpDelete("{id}", Name = "DeleteDepartment")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Delete a department", Description = "Deletes a department by its identifier.")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteDepartment(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await departmentService.Delete(id);

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
