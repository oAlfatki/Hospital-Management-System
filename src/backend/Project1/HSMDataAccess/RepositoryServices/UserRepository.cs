using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.RepositoryServices
{
    public class UserRepository : GenericRepository<User>
    {


        public UserRepository(AppDBContext context) : base(context)
        {

        }
        public async Task<int>CountNumberOfPerson(string PersonID)
        {
            var count = _context.Users.CountAsync(u => u.PersonID == PersonID);
            return await count;
        }

        public Task<List<User>> GetProfilesAsync() => _context.Users.Include(x => x.Person).AsNoTracking().ToListAsync();
        public Task<User?> GetProfileAsync(string id) => _context.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.ID == id);
        public Task<User?> FindByEmailAsync(string email) => _context.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.Person.Email == email);
        public async Task<bool> HasLinkedActivityAsync(string id) =>
            await _context.Doctors.AnyAsync(x => x.UserID == id) || await _context.AuditLogs.AnyAsync(x => x.UserID == id)
            || await _context.Notifications.AnyAsync(x => x.UserID == id) || await _context.Reports.AnyAsync(x => x.GeneratedBy == id);
        public Task<bool> HasAnyAsync() => _context.Users.AnyAsync();

    }
}
