using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController(NotificationService notificationService) : ControllerBase
    {
        [HttpGet("{Id}", Name = "GetNotificationByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetNotificationByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var notification = await notificationService.GetByID(Id);
            if (notification.notifictionDTO1 == null)
                return NotFound(new { message = "Notification not found" });

            return Ok(notification.notifictionDTO1);
        }

        [HttpGet("", Name = "GetAllNotifications")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notificationsList = await notificationService.GetAll();
            if (notificationsList.listOfNotifications == null)
                return NotFound(new { message = "No notifications found" });

            // FIX: was key 'medicalRecords' — now correctly 'notifications'
            return Ok(notificationsList.listOfNotifications);
        }

        [HttpPost("", Name = "CreateNotification")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateNotification(NotificationDTO notificationDTO)
        {
            if (string.IsNullOrWhiteSpace(notificationDTO.PatientID) || string.IsNullOrWhiteSpace(notificationDTO.UserID) || string.IsNullOrEmpty(notificationDTO.Type) || string.IsNullOrWhiteSpace(notificationDTO.Message) || string.IsNullOrWhiteSpace(notificationDTO.Status))
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
            notificationService._mode = NotificationService.enMode.Add;
            var result = await notificationService.Save(notificationDTO, notificationDTO.ID);

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

        [HttpPut("{ID}", Name = "UpdateNotification")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateNotification(string ID, NotificationDTO notificationDTO)
        {
            if (string.IsNullOrWhiteSpace(notificationDTO.PatientID) || string.IsNullOrWhiteSpace(notificationDTO.UserID) || string.IsNullOrEmpty(notificationDTO.Type) || string.IsNullOrWhiteSpace(notificationDTO.Message) || string.IsNullOrWhiteSpace(notificationDTO.Status))
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
            var CurrNotification = await notificationService.GetByID(ID);
            if (CurrNotification.notifictionDTO1 == null)
            {
                return NotFound(new
                {
                    status = CurrNotification.Status,
                    response = CurrNotification.Response,
                    isSuccess = CurrNotification.IsSuccess
                });
            }

            CurrNotification.notifictionDTO1 = notificationDTO;
            notificationService._mode = NotificationService.enMode.Update;
            var result = await notificationService.Save(notificationDTO, ID);
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

        [HttpDelete("{id}", Name = "DeleteNotification")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "ID is required" });

            var result = await notificationService.Delete(id);

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
