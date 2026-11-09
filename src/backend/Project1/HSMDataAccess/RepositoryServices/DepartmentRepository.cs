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
    public class DepartmentRepository : GenericRepository<Department>
    {
        public DepartmentRepository(AppDBContext context) : base(context)
        {

        }

        public Task<List<Department>> GetHeadedByDoctorAsync(string id) => _context.Departments.Where(x => x.HeadOf == id).AsNoTracking().ToListAsync();
        public Task<bool> HasDoctorsAsync(string id) => _context.Doctors.AnyAsync(x => x.DepartmentID == id);
        public Task<Doctor?> FindDoctorAsync(string id) => _context.Doctors.AsNoTracking().SingleOrDefaultAsync(x => x.ID == id);

    }
}
