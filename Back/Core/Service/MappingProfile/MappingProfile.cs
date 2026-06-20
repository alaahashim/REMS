using AutoMapper;
using Core.DomainLayer.Entities;
using Shared.DTOS;

namespace Core.Service.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            #region Property

            CreateMap<Property, PropertyDto>();

            CreateMap<CreatePropertyWithUnitsDto, Property>()
                .ForMember(x => x.Units, opt => opt.Ignore())
                .ForMember(x => x.Assignments, opt => opt.Ignore())
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.CreatedAt, opt => opt.Ignore());
CreateMap<Property, PropertyWithUnitsDto>()
    .ForMember(dest => dest.Units, opt => opt.MapFrom(src => src.Units));
            #endregion

            #region Unit

          CreateMap<Unit, UnitDto>();
          CreateMap<UnitDto, Unit>();

            #endregion

          CreateMap<RoleAssignment, AssignmentDto>()
            .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner!.FullName))
            .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner!.NationalId));

        CreateMap<CreateAssignmentDto, RoleAssignment>()
            .ForMember(d => d.StartDate, o => o.MapFrom(s => s.OwnershipStartDate))
            .ForMember(d => d.EndDate, o => o.MapFrom(s => s.OwnershipEndDate));
         
       
//----------------------
CreateMap<Owner, OwnerDto>();
        CreateMap<CreateOwnerDto, Owner>();

        }
    }
}