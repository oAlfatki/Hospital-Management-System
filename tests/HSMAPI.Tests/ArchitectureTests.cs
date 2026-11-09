using System.Reflection;
using HSMAPI;
using HSMBusiness.Services;
using HSMDataAccess.Data;
using HSMDataAccess.RepositoryServices;
using Xunit;

namespace HSMAPI.Tests;

public class ArchitectureTests
{
    private static string ProjectRoot()
    {
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
            if (File.Exists(Path.Combine(dir.FullName, "HospitalManagement.sln"))) return dir.FullName;
        throw new InvalidOperationException("Repository root was not found.");
    }

    [Fact]
    public void ControllersDependOnBusinessServicesAndNeverOnPersistence()
    {
        var controllers = typeof(Program).Assembly.GetTypes()
            .Where(t => t.IsPublic && t.Namespace == "HSMAPI.Controllers" && t.Name.EndsWith("Controller")).ToArray();
        Assert.NotEmpty(controllers);
        foreach (var controller in controllers)
        foreach (var dependency in controller.GetConstructors().SelectMany(c => c.GetParameters()))
            Assert.True(dependency.ParameterType.Assembly == typeof(UserService).Assembly,
                $"{controller.Name} injects {dependency.ParameterType.FullName}; controllers must call the business tier.");

        var source = Path.Combine(ProjectRoot(), "src/backend/Project1/HSMAPI/Controllers");
        foreach (var file in Directory.GetFiles(source, "*.cs"))
        {
            var code = File.ReadAllText(file);
            foreach (var forbidden in new[] { "HSMDataAccess.Data", "HSMDataAccess.Entities", "HSMDataAccess.RepositoryServices", "Microsoft.EntityFrameworkCore", "AppDBContext", "IQueryable<", "DbSet<" })
                Assert.False(code.Contains(forbidden, StringComparison.Ordinal), $"{Path.GetFileName(file)} bypasses the business tier with {forbidden}.");
        }
    }

    [Fact]
    public void BusinessTierDoesNotDependOnHttpOrEntityFramework()
    {
        var root = Path.Combine(ProjectRoot(), "src/backend/Project1/HSMBusiness");
        var files = Directory.GetFiles(root, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains(Path.DirectorySeparatorChar + "obj" + Path.DirectorySeparatorChar)
                && !p.Contains(Path.DirectorySeparatorChar + "bin" + Path.DirectorySeparatorChar));
        foreach (var file in files)
        foreach (var forbidden in new[] { "using HSMAPI", "Microsoft.EntityFrameworkCore", "AppDBContext", "HttpContext", "ControllerBase", "Microsoft.AspNetCore.Mvc", "IQueryable<" })
            Assert.False(File.ReadAllText(file).Contains(forbidden, StringComparison.Ordinal),
                $"{Path.GetFileName(file)} crosses a tier boundary with {forbidden}.");
    }

    [Fact]
    public void DataTierHasNoUpwardDependenciesAndDoesNotExposeItsContext()
    {
        var references = typeof(AppDBContext).Assembly.GetReferencedAssemblies().Select(a => a.Name).ToArray();
        Assert.DoesNotContain("HSMBusiness", references);
        Assert.DoesNotContain("HSMAPI", references);
        var repositories = typeof(GenericRepository<>).Assembly.GetTypes()
            .Where(t => t.Namespace == "HSMDataAccess.RepositoryServices");
        foreach (var repository in repositories)
            Assert.DoesNotContain(repository.GetFields(BindingFlags.Public | BindingFlags.Instance),
                field => typeof(Microsoft.EntityFrameworkCore.DbContext).IsAssignableFrom(field.FieldType));
    }
}
