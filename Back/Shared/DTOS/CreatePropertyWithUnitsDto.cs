namespace Shared.DTOS
{
    public class CreatePropertyWithUnitsDto
    {
        public PropertyDto Property { get; set; }

        public List<UnitDto> Units { get; set; }
    }
}