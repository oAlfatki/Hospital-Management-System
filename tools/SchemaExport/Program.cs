using HSMDataAccess.Data;
using Microsoft.EntityFrameworkCore;

// Generates SQL from EF metadata only; this never connects to a database.
using var db = new AppDBContext(new DbContextOptionsBuilder<AppDBContext>()
    .UseSqlServer("Server=unused;Database=unused;Integrated Security=true").Options);
var script = db.Database.GenerateCreateScript();
if (args.Length == 1) File.WriteAllText(args[0], script);
else Console.Write(script);
