using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/audit")]
    [ApiController]
    public class AuditLogController(AuditLogService auditLogService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetAuditLogByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get an audit log", Description = "Gets an audit log by its identifier.")]
        [ProducesResponseType(typeof(AuditLogDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAuditLogByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var auditlog = await auditLogService.GetByID(Id);
            if (auditlog.auditLogDTO1 == null)
                return NotFound(new { message = "Audit log not found" });

            return Ok(auditlog.auditLogDTO1);
        }

        [HttpGet("", Name = "GetAllAuditLogs")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get all audit logs", Description = "Gets all audit logs.")]
        [ProducesResponseType(typeof(IEnumerable<AuditLogDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllAuditLogs()
        {
            var ListAuditLogs = await auditLogService.GetAll();
            if (ListAuditLogs.listOfAuditLogs == null)
                return NotFound(new { message = "No audit logs found" });

            return Ok(ListAuditLogs.listOfAuditLogs);
        }

        [HttpPost("", Name = "CreateAuditLog")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Create an audit log", Description = "Creates a new audit log.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateAuditLog(AuditLogDTO auditLog)
        {
            if (auditLog == null)
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
            if (string.IsNullOrWhiteSpace(auditLog.UserID) || auditLog.ID == "" || string.IsNullOrWhiteSpace(auditLog.Entity) || string.IsNullOrWhiteSpace(auditLog.Action))
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

            auditLogService._mode = AuditLogService.enMode.Add;
            var result = await auditLogService.Save(auditLog, auditLog.ID);

            if (!result.IsSuccess)
            {
                return BadRequest(new
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

        [HttpPut("{ID}", Name = "UpdateAuditLog")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Update an audit log", Description = "Updates an existing audit log by its identifier.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateAuditLog(string ID, AuditLogDTO auditLog)
        {
            if (string.IsNullOrWhiteSpace(auditLog.UserID) || auditLog.ID == "" || string.IsNullOrWhiteSpace(auditLog.Entity) || string.IsNullOrWhiteSpace(auditLog.Action))
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

            var CurrAuditLog = await auditLogService.GetByID(ID);
            if (CurrAuditLog.auditLogDTO1 == null)
            {
                return NotFound(new
                {
                    status = CurrAuditLog.Status,
                    response = CurrAuditLog.Response,
                    isSuccess = CurrAuditLog.IsSuccess
                });
            }

            // FIX: was enMode.Add — must be enMode.Update
            auditLogService._mode = AuditLogService.enMode.Update;
            var result = await auditLogService.Save(auditLog, ID);

            if (!result.IsSuccess)
                return BadRequest(new
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

        [HttpDelete("{id}", Name = "DeleteAuditLog")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Delete an audit log", Description = "Deletes an audit log by its identifier.")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteAuditLog(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await auditLogService.Delete(id);

            if (!result.IsSuccess)
                return BadRequest(new
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
