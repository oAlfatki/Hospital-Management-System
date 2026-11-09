using HSMDataAccess.Data;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.RepositoryServices
{
    public class DoctorRepository : GenericRepository<Doctor>
    {
        public DoctorRepository(AppDBContext context) : base(context)
        {

        }
        public async Task<int> CountNumberOfUserIDIsOne(string UserID)
        {
            var count = _context.Doctors.CountAsync(d => d.UserID == UserID);
            return await count;
        }

        private IQueryable<Doctor> Profiles => _context.Doctors.Include(x => x.Person).Include(x => x.User).ThenInclude(x => x.Person);
        public Task<List<Doctor>> GetProfilesAsync() => Profiles.AsNoTracking().ToListAsync();
        public Task<Doctor?> GetProfileAsync(string id) => Profiles.SingleOrDefaultAsync(x => x.ID == id);
        public Task<bool> IsActiveAsync(string id) => _context.Doctors.AnyAsync(x => x.ID == id && x.Status);
        public Task<bool> HasUserAsync(string id) => _context.Doctors.AnyAsync(x => x.UserID == id);
        public Task<Doctor?> FindUnlinkedByPersonAsync(string id) => _context.Doctors.SingleOrDefaultAsync(x => x.PersonID == id && x.UserID == null);
        public Task<bool> HasAppointmentsAsync(string id) => _context.Appointments.AnyAsync(x => x.DoctorID == id);

    }
}
