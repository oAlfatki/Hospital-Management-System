using HSMBusiness.dto;
using static HSMBusiness.Pattern.ResultPatern;
using static HSMBusiness.Pattern.BusinessRules;
using Azure;
using HSMBusiness.Erorrs;
using HSMBusiness.Mappers;
using HSMBusiness.Pattern;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using HSMDataAccess.RepositoryServices;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HSMBusiness.Services
{
    public class UserService
    {
        private readonly UserRepository _repository;
        private readonly DoctorRepository _doctorRepository;
        private readonly UserError _userError;
        private readonly PersonService _personService;
        ResultPatern resultPattern = new ResultPatern();
        public enum enMode { Add = 0, Update }
        public enMode Mode = enMode.Add;

        public UserService(UserRepository repository,
    UserError userError,PersonService personService, DoctorRepository doctorRepository, enMode Mode = enMode.Add)
        {

            _repository = repository;
            _doctorRepository = doctorRepository;
            _userError = userError;
            _personService = personService;
            this.Mode = Mode;
        }
        public UserRepository userRepository
        {
            get
            {
                return _repository;
            }
        }
        private async Task<bool> _AddNew(UserDTO userDTO)
        {
            var user = new UserMapper().ToEntity(userDTO);
            if(!await _personService.IsPersonExist(userDTO.PersonID))
            {
                return false;
            }
            if(await _repository.CountNumberOfPerson(user.PersonID) == 1)
            {
                return false;
            }
           var NewUser = await _repository.AddAsync(user);

            user.ID = NewUser.ID;
            return user.ID != "";
        }
        public async Task<(int Status, string? Response, bool IsSuccess, Dictionary<string, string>? errors)> NumberOfPerson(string ID)
        {
            User user = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (await _repository.CountNumberOfPerson(ID) == 1)
            {
                response =
                await resultPattern.GiveResponse(500,null);
                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
            }
            return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
        }
        private async Task<(int Status, string? Response, bool IsSuccess, Dictionary<string, string>? errors)> _Update(string ID,UserDTO userDTO)
        {

            User user = await _repository.GetByIDAsync(ID);

            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            var errors = await _userError.ValidateUser(userDTO);

            if (!await _personService.IsPersonExist(userDTO.PersonID))
            {
                response =
                await resultPattern.GiveResponse(400, errors);
                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
            }
                if (errors.Count > 0)
            {
                response =
                await resultPattern.GiveResponse(400, errors);
                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
            }
            if (user == null)
            {
                 response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status, response.Response, response.IsSuccess,response.Errors);
            }

            if (await _repository.CountNumberOfPerson(user.PersonID) > 1)
            {
                response =
                await resultPattern.GiveResponse(500, errors);
                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
            }
            user = new UserMapper().ToEntity(userDTO, UserMapper.enMode.Update, user);
            await _repository.UpdateAsync(user);

            return  (response.Status, response.Response, response.IsSuccess, response.Errors);
        }

        public async Task<(int Status, string? Response, bool IsSucess, UserDTO? userDTO ,Dictionary<string, string>?errors)> GetByID(string ID)
        {
            UserDTO? CurrentUser = null;
            var user1 = await _repository.GetByIDAsync(ID);
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (user1 == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
                return (response.Status,response.Response,response.IsSuccess,CurrentUser,response.Errors);
            }
            CurrentUser = new UserMapper().ToDTO(user1);
            return  (response.Status, response.Response, response.IsSuccess, CurrentUser,response.Errors);
        }
        public async Task<(int Status, string? Response, bool IsSucess, List<UserDTO>? userList, Dictionary<string, string>? errors)> GetAll()
        {
            var users = await _repository.GetAllAsync();
            var response = await resultPattern.GiveResponse(200, new Dictionary<string, string>());
            if (users == null)
            {
                response = await resultPattern.GiveResponse(404, new Dictionary<string, string>());
               return (response.Status, response.Response, response.IsSuccess, null,response.Errors);
            }
            return (response.Status, response.Response, response.IsSuccess, users.Select(
                u =>
                new UserMapper().ToDTO(u)
                ).ToList(),response.Errors);
        }
        public async Task<(int Status, string? Response, bool IsSuccess)> Delete(string ID)
        {
            var report =
                await _repository.GetByIDAsync(ID);

            var response =
                await resultPattern.GiveResponse(200, new Dictionary<string, string>());

            if (report == null)
            {
                response =
                    await resultPattern.GiveResponse(404, new Dictionary<string, string>());

                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess
                );
            }

            bool IsDeleted =await _repository.DeleteAsync(report);

            if (!IsDeleted)
            {
                response =
                    await resultPattern.GiveResponse(400, new Dictionary<string, string>());

                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess
                );
            }

            return (
                response.Status,
                response.Response,
                response.IsSuccess
            );
        }
        public async Task<bool> IsUserExist(Doctor doctorEntity, DoctorDTO doctorDTO)
        {

            var user = await GetByID(doctorEntity.UserID);
            if (user.userDTO == null)
            {
                return false;
            }

            return true;
        }
        public async Task<bool> IsUserExist(string ID)
        {

            var user = await GetByID(ID);
            if (user.userDTO == null)
            {
                return false;
            }

            return true;
        }
        public async Task<(int Status, string? Response, bool IsSuccess, Dictionary<string, string>? errors)> Save(UserDTO userDTO,string ID="")
        {
            var response =
                await resultPattern.GiveResponse(200, new Dictionary<string, string>());

            var errors =await _userError.ValidateUser(userDTO);

            if (errors.Count > 0)
            {
                response =
                await resultPattern.GiveResponse(400, errors);
                return (
                    response.Status,
                    response.Response,
                    response.IsSuccess,
                    response.Errors
                );
            }
            switch (Mode)
            {

                case enMode.Update:
                    return await _Update(ID,userDTO);
                case enMode.Add:
                    if (await _AddNew(userDTO))
                    {
                        Mode = enMode.Update;
                    }
                    else
                    {
                        response =
                            await resultPattern.GiveResponse(400, new Dictionary<string, string>());
                    }

                    return (
                        response.Status,
                        response.Response,
                        response.IsSuccess,
                        response.Errors
                    );
            }
            response =
               await resultPattern.GiveResponse(500, new Dictionary<string, string>());

            return (
                response.Status,
                response.Response,
                response.IsSuccess,
                        response.Errors
            );
        }

        private readonly Microsoft.AspNetCore.Identity.PasswordHasher<User> _passwordHasher = new();
        public Task CheckContactAvailabilityAsync(string email, string? phone, string? exceptId = null) =>
            _personService.CheckContactAvailabilityAsync(email, phone, exceptId);
        public Task<ResultResponse<UserResponse>> AuthenticateAsync(LoginRequest request) => ExecuteAsync(async () =>
        {
            var user = await _repository.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
            var valid = false;
            if (user is not null && user.Status)
            {
                try { valid = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) != Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed; }
                catch (FormatException) { /* Legacy plaintext passwords require an explicit reset. */ }
            }
            Require(valid && user is not null, "Invalid email or password.", 401);
            return UserMapper.ToResponse(user!);
        });
        public async Task<UserResponse?> GetActiveSessionAsync(string id)
        {
            var user = await _repository.GetProfileAsync(id);
            return user is not null && user.Status ? UserMapper.ToResponse(user) : null;
        }
        public Task<ResultResponse<IReadOnlyList<UserResponse>>> GetStaffProfilesAsync() => ExecuteAsync<IReadOnlyList<UserResponse>>(async () =>
            (await _repository.GetProfilesAsync()).Select(UserMapper.ToResponse).ToList());
        public Task<ResultResponse<UserResponse>> RegisterStaffAsync(StaffRequest request, string actor) => ExecuteAsync(async () =>
        {
            Require(!string.IsNullOrWhiteSpace(request.Password) && request.Password.Length >= 12, "An initial password of at least 12 characters is required.");
            var person = await _personService.FindProfileByEmailAsync(request.Email);
            Doctor? doctor = null;
            if (person is not null)
            {
                doctor = await _doctorRepository.FindUnlinkedByPersonAsync(person.ID);
                Require(request.Role == "Doctor" && doctor is not null, "Email is already registered.", 409);
            }
            await _personService.CheckContactAvailabilityAsync(request.Email, request.ContactNumber, person?.ID);
            var user = new User { ID = Id(), Person = person ?? PersonMapper.CreateProfile(request.Name, request.Email, request.ContactNumber),
                Name = request.Name.Trim(), Role = request.Role, Status = request.Status == "Active", DepartmentName = request.Department, CreatedBy = actor };
            user.Person.Name = user.Name;
            if (!string.IsNullOrWhiteSpace(request.ContactNumber)) user.Person.ContactNumber = request.ContactNumber;
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password!); _repository.StageAdd(user);
            if (doctor is not null) doctor.User = user;
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "User", "Create", user.ID));
            return UserMapper.ToResponse(user);
        }, 201);
        public Task<ResultResponse<UserResponse>> UpdateStaffProfileAsync(string id, StaffRequest request, string actor) => ExecuteAsync(async () =>
        {
            var user = Found(await _repository.GetProfileAsync(id), "User not found.");
            Require(id != actor || (request.Role == "Admin" && request.Status == "Active"), "You cannot remove your own administrator access.", 409);
            await _personService.CheckContactAvailabilityAsync(request.Email, request.ContactNumber, user.PersonID);
            PersonMapper.ApplyProfile(user.Person, request.Name, request.Email, request.ContactNumber);
            user.Name = request.Name.Trim(); user.Role = request.Role; user.Status = request.Status == "Active";
            user.DepartmentName = request.Department; user.UpdatedOn = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Password)) user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "User", "Update", id));
            return UserMapper.ToResponse(user);
        });
        public Task<ResultResponse<bool>> DeleteStaffProfileAsync(string id, string actor) => ExecuteAsync(async () =>
        {
            var user = Found(await _repository.GetProfileAsync(id), "User not found.");
            Require(id != actor, "You cannot delete your own administrator account.", 409);
            Require(!await _repository.HasLinkedActivityAsync(id), "This account has linked activity. Deactivate it instead.", 409);
            _repository.StageRemove(user);
            await _repository.SaveChangesWithAuditAsync(AuditLogMapper.CreateEntry(actor, "User", "Delete", id));
            return true;
        }, 204);
        public async Task EnsureDevelopmentAdministratorAsync(string? email, string? password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || await _repository.HasAnyAsync()) return;
            Require(password.Length >= 12, "Bootstrap password must have at least 12 characters.");
            var admin = new User { ID = Id(), Name = "Administrator", Role = "Admin", Status = true,
                Person = PersonMapper.CreateProfile("Administrator", email, "0000000000") };
            admin.PasswordHash = _passwordHasher.HashPassword(admin, password);
            _repository.StageAdd(admin); await _repository.SaveChangesWithAuditAsync();
        }
        public Task<ResultResponse<bool>> ProvisionAdministratorAsync(string email, string password) => ExecuteAsync(async () =>
        {
            Require(System.Net.Mail.MailAddress.TryCreate(email, out _) && !string.IsNullOrWhiteSpace(password) && password.Length >= 12,
                "A valid administrator email and a password of at least 12 characters are required.");
            var user = await _repository.FindByEmailAsync(email.Trim().ToLowerInvariant());
            if (user is null)
            {
                await _personService.CheckContactAvailabilityAsync(email, null);
                user = new User { ID = Id(), Name = "Administrator", Role = "Admin", Status = true, Person = PersonMapper.CreateProfile("Administrator", email, null) };
                _repository.StageAdd(user);
            }
            Require(user.Role.Trim() == "Admin", "The selected user is not an administrator.", 409);
            user.PasswordHash = _passwordHasher.HashPassword(user, password); user.Status = true; user.UpdatedOn = DateTime.UtcNow;
            await _repository.SaveChangesWithAuditAsync(new AuditLog { ID = Id(), UserID = user.ID, Action = "Update", Entity = "User",
                Timestamp = DateTime.UtcNow, Details = "Administrator password provisioned by explicit maintenance command." });
            return true;
        });

    }
}
