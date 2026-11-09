using HSMBusiness.Mappers;
using static HSMBusiness.Pattern.ResultPatern;
using static HSMBusiness.Pattern.BusinessRules;
using Azure;
using HSMBusiness.dto;
using HSMBusiness.Pattern;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using HSMDataAccess.RepositoryServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness
{
    public class DoctorService
    {
        ResultPatern resultPattern = new ResultPatern();
        public enum enMode { Add = 0, Update }
        public enMode mode = enMode.Add;
        private readonly DoctorRepository _doctor;
        private readonly UserService _userService;
        private readonly DepartmentService _departmentService;
        public DoctorRepository doctorRepository { get { return _doctor; } }
        private readonly UserRepository _userRepository;
        public DoctorService(DepartmentService departmentService, DoctorRepository doctor,UserService userService,UserRepository userRepository, enMode mode = enMode.Add)
        {
            _doctor = doctor;
            _departmentService = departmentService;
            _userService = userService;
            _userRepository = userRepository;
            this.mode = mode;
        }

        public async Task<(int Status,string? Response,bool IsSuccess,DoctorDTO? doctorDTO1, Dictionary<string, string>? errors)> GetDoctorByID(string DoctorID)
        {
            Doctor doctor = await _doctor.GetByIDAsync(DoctorID);
            var response =await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (doctor == null)
            {
                response =await resultPattern.GiveResponse(404, new Dictionary<string, string>(),"Doctor");
                return (response.Status,response.Response,response.IsSuccess,null,response.Errors);
            }
            return (response.Status,response.Response, response.IsSuccess, new DoctorDTO(DoctorID, doctor.DepartmentID, doctor.Specialization, doctor.Status,
                 doctor.UserID), response.Errors);
        }
        public async Task<(int Status,string?Response,bool IsSuccess, Dictionary<string, string>? errors)> Delete(string DoctorID)
        {
            Doctor doctor = await _doctor.GetByIDAsync(DoctorID);
            var response =await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (doctor == null)
            {
                response =await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }
            bool IsDeleted = await _doctor.DeleteAsync(doctor);
            if (!IsDeleted)
            {
                var error =await resultPattern.GiveResponse(500, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }
            return (response.Status, response.Response, response.IsSuccess, response.Errors);
        }
        public async Task<(int Status,string?Response,bool IsSuccess,List<DoctorDTO>?doctorsList)> GetAll()
        {
            var doctors = await _doctor.GetAllAsync();
            var response =await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (doctors == null)
            {
                response =await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response,response.IsSuccess,null);
            }

            return (response.Status,response.Response,response.IsSuccess, doctors.Select(d => new DoctorMapper().ToDTO(d))
        .ToList());
        }
        private async Task<(int Status,bool IsSuccess)> Add(DoctorDTO doctorDTO)
        {

            var doctorEntity = new DoctorMapper().ToEntity(doctorDTO);
            if (!await _departmentService.IsDepartmentExist(doctorEntity, doctorDTO)  && !await  _userService.IsUserExist(doctorEntity, doctorDTO))
            {
                return (500,false);
            }
            doctorEntity.User = await _userRepository.GetByIDAsync(doctorEntity.UserID);
            if (doctorEntity.User == null)
            {
                return (404, false);
            }
            if(await _doctor.CountNumberOfUserIDIsOne(doctorDTO.UserID) == 1)
            {
                return (500, false);
            }
            if(doctorEntity.User.Role != "Doctor")
            {
                return (500, false);
            }

            if(doctorEntity.ID == "")
            {
                return (500, false);
            }
            var AddNew = await _doctor.AddAsync(doctorEntity);
            doctorEntity.ID = AddNew.ID;
            return (200, true);
        }
        public async Task<bool> IsDoctorExist(Appointment appointmentEntity, AppointmentDTO appointmentDTO)
        {

            var doctor = await GetDoctorByID(appointmentEntity.DoctorID);
            if (doctor.doctorDTO1 == null)
            {
                return false;
            }

            return true;
        }
        private async Task<(int, string?, bool, Dictionary<string, string>? errors)> Update(string ID, DoctorDTO doctorDTO)
        {
            Doctor? doctorEntity = await _doctor.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (doctorEntity == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }
            if( !await _departmentService.IsDepartmentExist(doctorEntity,doctorDTO)  && await _userService.IsUserExist(doctorEntity, doctorDTO))
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }
            doctorEntity.User = await _userRepository.GetByIDAsync(doctorEntity.UserID);
            if (doctorEntity.User == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }

            if (doctorEntity.User.Role != "Doctor")
            {
                response = await resultPattern.GiveResponse(500, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess, response.Errors);
            }
            var AddNew = await _doctor.AddAsync(doctorEntity);
            doctorEntity.ID = AddNew.ID;
            doctorEntity = new DoctorMapper().ToEntity(doctorDTO,DoctorMapper.enMode.Update,doctorEntity);
            await _doctor.UpdateAsync(doctorEntity);
            return (response.Status, response.Response, response.IsSuccess, response.Errors);
        }
        public async Task<(int Status, string?Response, bool IsSuccess, Dictionary<string, string>? errors)> Save(DoctorDTO doctorDTO,string ID)
        {
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            switch (mode)
            {
                case enMode.Add:
                    var AddNew = await Add(doctorDTO);
                    if (AddNew.IsSuccess)
                    {
                        mode = enMode.Update;
                    }
                    else
                    {
                        response =await  resultPattern.GiveResponse(AddNew.Status, new Dictionary<string, string>());

                    }
                    return (response.Status, response.Response, response.IsSuccess, response.Errors);
                case enMode.Update:
                    return await Update(ID, doctorDTO);
            }
            response = await resultPattern.GiveResponse(500, new Dictionary<string, string>());
            return (response.Status, response.Response, response.IsSuccess, response.Errors);
        }

        public Task<bool> IsActiveDoctorAsync(string id) => _doctor.IsActiveAsync(id);
        public Task<ResultResponse<IReadOnlyList<DoctorResponse>>> GetDoctorProfilesAsync() => ExecuteAsync<IReadOnlyList<DoctorResponse>>(async () =>
            (await _doctor.GetProfilesAsync()).Select(DoctorMapper.ToResponse).ToList());
        public Task<ResultResponse<DoctorResponse>> GetDoctorProfileAsync(string id) => ExecuteAsync(async () =>
            DoctorMapper.ToResponse(Found(await _doctor.GetProfileAsync(id), "Doctor not found.")));
        public Task<ResultResponse<DoctorResponse>> RegisterDoctorAsync(DoctorRequest request, string actor) => ExecuteAsync(async () =>
        {
            Require(await _departmentService.DepartmentExistsAsync(request.DepartmentId), "Department not found.", 404);
            var user = await _userRepository.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
            Person person;
            if (user is not null)
            {
                Require(user.Role.Trim() == "Doctor" && !await _doctor.HasUserAsync(user.ID), "Email belongs to another staff account or registered doctor.", 409);
                await _userService.CheckContactAvailabilityAsync(request.Email, request.ContactNumber, user.PersonID);
                person = user.Person;
            }
            else
            {
                await _userService.CheckContactAvailabilityAsync(request.Email, request.ContactNumber);
                person = PersonMapper.CreateProfile(request.Name, request.Email, request.ContactNumber);
            }
            var doctor = new Doctor { ID = Id(), Person = person, UserID = user?.ID, CreatedBy = actor };
            DoctorMapper.ApplyProfile(doctor, request); _doctor.StageAdd(doctor);
            await _doctor.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Doctor", "Create", doctor.ID));
            return DoctorMapper.ToResponse(doctor);
        }, 201);
        public Task<ResultResponse<DoctorResponse>> UpdateDoctorProfileAsync(string id, DoctorRequest request, string actor) => ExecuteAsync(async () =>
        {
            var doctor = Found(await _doctor.GetProfileAsync(id), "Doctor not found.");
            Require(await _departmentService.DepartmentExistsAsync(request.DepartmentId), "Department not found.", 404);
            doctor.Person ??= doctor.User?.Person ?? PersonMapper.CreateProfile(request.Name, request.Email, request.ContactNumber);
            await _userService.CheckContactAvailabilityAsync(request.Email, request.ContactNumber, doctor.Person.ID);
            await _departmentService.ValidateDoctorTransferAsync(id, request.DepartmentId, request.Status);
            DoctorMapper.ApplyProfile(doctor, request);
            await _doctor.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Doctor", "Update", id));
            return DoctorMapper.ToResponse(doctor);
        });
        public Task<ResultResponse<bool>> DeleteDoctorProfileAsync(string id, string actor) => ExecuteAsync(async () =>
        {
            var doctor = Found(await _doctor.GetProfileAsync(id), "Doctor not found.");
            Require(!await _doctor.HasAppointmentsAsync(id) && !await _departmentService.IsDepartmentHeadAsync(id), "Doctor is linked to appointments or heads a department.", 409);
            _doctor.StageRemove(doctor);
            await _doctor.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "Doctor", "Delete", id));
            return true;
        }, 204);

    }
}
