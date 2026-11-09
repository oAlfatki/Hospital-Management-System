using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using HSMDataAccess.RepositoryServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.dto
{

    public class PersonMapper
    {
        public enum enMode { Add ,Update}

        public  PersonDTO ToDTO(HSMDataAccess.Entities.Person person)
        {
            return new PersonDTO(person.ID, person.Name,
                person.ContactNumber, person.Email,
                person.Gender, person.Address, person.DateOfBirth);
        }
        public  Person ToEntity(PersonDTO personDTO,enMode mode=enMode.Add,Person person=null)
        {
            if (mode == enMode.Add)
            {
                return new Person
                {
                    ID = Guid.NewGuid().ToString("N").Substring(0, 10),
                    Name = personDTO.Name,
                    ContactNumber = personDTO.ContactNumber,
                    Email = personDTO.Email,
                    Gender = personDTO.Gender,
                    Address = personDTO.Address,
                    DateOfBirth = personDTO.DateOfBirth
                };
            }
            else
            {
                person.Name = personDTO.Name;
                person.ContactNumber = personDTO.ContactNumber;
                person.Email = personDTO.Email;
                person.Gender = personDTO.Gender;
                person.Address = personDTO.Address;
                person.DateOfBirth = personDTO.DateOfBirth;
                return person;
            }
        }


        public static Person CreateProfile(string name, string email, string? phone) => new()
        {
            ID = HSMBusiness.Pattern.BusinessRules.Id(), Name = name.Trim(), Email = email.Trim().ToLowerInvariant(),
            ContactNumber = string.IsNullOrWhiteSpace(phone) ? null! : phone, Gender = "Other", Address = "", DateOfBirth = new DateOnly(2000, 1, 1)
        };
        public static void ApplyProfile(Person p, string name, string email, string? phone)
        {
            p.Name = name.Trim(); p.Email = email.Trim().ToLowerInvariant(); p.ContactNumber = string.IsNullOrWhiteSpace(phone) ? null! : phone;
        }

    }
}
