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

            CreateMap<Property, PropertyDto>()
                .ReverseMap();

            CreateMap<CreatePropertyWithUnitsDto, Property>();

            CreateMap<UpdatePropertyDto, Property>();

            #endregion

            #region Unit

          CreateMap<UnitDto, Unit>()
    .ForMember(d => d.UnitNumber, opt => opt.Ignore())
    .ForMember(d => d.FinishingType, opt => opt.Ignore())
    .ForMember(d => d.Status, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Status) ? "New" : src.Status));

            #endregion

            #region Owner

           CreateMap<Owner, OwnerDto>();

           CreateMap<CreateOwnerDto, Owner>();

           CreateMap<UpdateOwnerDto, Owner>();

            #endregion

            #region Assignment

            CreateMap<CreateAssignmentDto, RoleAssignment>()
                .ForMember(
                    dest => dest.StartDate,
                    opt => opt.MapFrom(
                        src => src.OwnershipStartDate))
                .ForMember(
                    dest => dest.EndDate,
                    opt => opt.MapFrom(
                        src => src.OwnershipEndDate))
                .ForMember(
                    dest => dest.Id,
                    opt => opt.Ignore())
                .ForMember(
                    dest => dest.Owner,
                    opt => opt.Ignore())
                .ForMember(
                    dest => dest.Property,
                    opt => opt.Ignore())
                .ForMember(
                    dest => dest.Unit,
                    opt => opt.Ignore());

            CreateMap<RoleAssignment, AssignmentDto>()
                .ForMember(
                    dest => dest.PersonId,
                    opt => opt.MapFrom(
                        src => src.Owner.NationalId))
                .ForMember(
                    dest => dest.Name,
                    opt => opt.MapFrom(
                        src => src.Owner.FullName))
                .ForMember(
                    dest => dest.OwnershipStartDate,
                    opt => opt.MapFrom(
                        src => src.StartDate))
                .ForMember(
                    dest => dest.OwnershipEndDate,
                    opt => opt.MapFrom(
                        src => src.EndDate));

            #endregion
        }
    }
}