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
    public class BillRepository:GenericRepository<Bill>
    {

        public BillRepository(AppDBContext context) : base(context)
        {

        }


        public async Task<bool> IsBillExistsAsync(string billID)
        {
            return await _context.Set<Bill>()
                .AnyAsync(e =>
                    e.ID == billID);
        }

        private IQueryable<Bill> DetailedBills => _context.Bills.Include(x => x.Lines).Include(x => x.Payments);
        public Task<List<Bill>> GetDetailedAsync() => DetailedBills.AsNoTracking().ToListAsync();
        public Task<Bill?> GetDetailedByIdAsync(string id) => DetailedBills.SingleOrDefaultAsync(x => x.ID == id);
        public Task<List<Payment>> GetPaymentsSinceAsync(DateTime date) => _context.Payments.AsNoTracking().Where(x => x.PaidOn >= date).ToListAsync();
        public Task<List<Bill>> GetNonCancelledAsync() => _context.Bills.AsNoTracking().Where(x => x.Status != "Cancelled").ToListAsync();

    }
}
