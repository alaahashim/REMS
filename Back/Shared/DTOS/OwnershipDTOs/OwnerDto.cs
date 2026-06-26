namespace Shared.DTOS;

public class OwnerDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string NationalId { get; set; }
    public string Phone { get; set; }
    public string Address { get; set; }
    public string OwnerType { get; set; }
    public List<UnitDto>? Units { get; set; }=[];

}


public class CreateOwnerDto
{
    public string NationalId { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string OwnerType { get; set; } = "Natural";
}
public class OwnerQueryDto
{
    public string? Search { get; set; }
}

public class OwnerUnitDto
{    public int AssignmentId { get; set; }   // مهم جدًا

    public int      UnitId     { get; set; }
    public string   UnitNumber { get; set; } = "";
    public double   Area       { get; set; }
    public DateTime StartDate  { get; set; }
    public string   Address    { get; set; } = "";
}
// تعديل بيانات المالك
public class UpdateOwnerDto
{
    public string Phone   { get; set; } = null!;
    public string Address { get; set; } = null!;
}

// تعديل بيانات الربط (Assignment)


// DTO الوحدة لصفحة التعديل (يرجع assignmentId عشان نعدله)
public class OwnerUnitEditDto
{
    public int      AssignmentId { get; set; }
    public int      UnitId       { get; set; }
    public string   UnitNumber   { get; set; } = "";
    public double   Area         { get; set; }
    public string   Address      { get; set; } = "";
    public string   UsageType    { get; set; } = "";
    public DateTime StartDate    { get; set; }
    public DateTime? EndDate     { get; set; }
}