using Microsoft.EntityFrameworkCore;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.RepositoryServices
{
    public class AuditLogRepository : GenericRepository<AuditLog>
    {
        public AuditLogRepository(AppDBContext context) : base(context)
        {
        }

        public Task<List<AuditLog>> GetWithUsersAsync() => _context.AuditLogs.Include(x => x.user).ThenInclude(x => x.Person)
            .AsNoTracking().OrderByDescending(x => x.Timestamp).ToListAsync();

    }
}
