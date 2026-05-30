using AutoMapper;
using Core.DomainLayer.Entities;
using Shared.DTOS;

namespace Service.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Property
            CreateMap<Property, PropertyDto>().ReverseMap();

            // Unit
            CreateMap<Unit, UnitDto>().ReverseMap();
        }
    }
}