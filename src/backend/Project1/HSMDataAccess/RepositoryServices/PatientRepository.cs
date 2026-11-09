using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.RepositoryServices
{
    public class PatientRepository : GenericRepository<Patient>
    {
        public PatientRepository(AppDBContext context) : base(context)
        {
        }
        public async Task<int> CountNumberOfPersonIsOne(string PersonID)
        {
            var count = _context.Patients.CountAsync(p => p.PersonID == PersonID);
            return await count;
        }

        public Task<List<Patient>> GetProfilesAsync() => _context.Patients.Include(x => x.Person).AsNoTracking().ToListAsync();
        public Task<Patient?> GetProfileAsync(string id) => _context.Patients.Include(x => x.Person).SingleOrDefaultAsync(x => x.ID == id);
        public Task<bool> IsActiveAsync(string id) => _context.Patients.AnyAsync(x => x.ID == id && x.Status);
        public Task<int> CountActiveAsync() => _context.Patients.CountAsync(x => x.Status);
        public async Task<bool> HasLinkedRecordsAsync(string id) =>
            await _context.Appointments.AnyAsync(x => x.PatientID == id) || await _context.Bills.AnyAsync(x => x.PatientID == id)
            || await _context.MedicalRecords.AnyAsync(x => x.PatientID == id) || await _context.Notifications.AnyAsync(x => x.PatientID == id);

    }
}
