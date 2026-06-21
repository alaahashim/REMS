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
      #region  Owner
CreateMap<Owner, OwnerDto>();
        CreateMap<CreateOwnerDto, Owner>();

#endregion

           #region Exemption

CreateMap<Exemption, ExemptionDto>()
    .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner.FullName))
    .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner.NationalId))
    .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

CreateMap<Exemption, ExemptionDetailsDto>()
    .IncludeBase<Exemption, ExemptionDto>()
    .ForMember(d => d.Attachments, o => o.MapFrom(s => s.Attachments));

CreateMap<ExemptionAttachment, ExemptionAttachmentDto>();

CreateMap<CreateExemptionDto, Exemption>();

CreateMap<UpdateExemptionDto, Exemption>()
    .ForMember(dest => dest.Id, opt => opt.Ignore())
    .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
    .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
    .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
    .ForMember(dest => dest.Attachments, opt => opt.Ignore())
    .ForMember(dest => dest.Status, opt => opt.Ignore())
    .ForMember(dest => dest.DecisionResult, opt => opt.Ignore());

CreateMap<Exemption, RequestHomeDto>()
    .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner.NationalId))
    .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner.FullName))
    .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.UnitNumber))
    .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
    .ForMember(d => d.RequestDate, o => o.MapFrom(s => s.ExemptionDate))
    .ForMember(d => d.LegalReference, o => o.MapFrom(s => s.LegalReference))
    .ForMember(d => d.Type, o => o.MapFrom(s => "إعفاء"));

#endregion
        }
    }
}