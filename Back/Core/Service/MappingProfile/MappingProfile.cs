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

            CreateMap<UpdatePropertyDto, Property>();

            CreateMap<Property, PropertyHomeDto>()
                .ForMember(d => d.Units, opt => opt.MapFrom(s => s.Units))
                .ForMember(d => d.Area, opt => opt.MapFrom(s => s.Units.Sum(u => u.Area)))
                .ForMember(d => d.OwnerName,
                    opt => opt.MapFrom(s =>
                        s.Assignments.FirstOrDefault() != null
                            ? s.Assignments.First().Owner.FullName
                            : null));

            #endregion

            #region Unit

            CreateMap<Unit, UnitDto>();
            CreateMap<UnitDto, Unit>();

            #endregion
            #region 
            CreateMap<RoleAssignment, AssignmentDto>()
                .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner!.FullName))
                .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner!.NationalId));

            CreateMap<CreateAssignmentDto, RoleAssignment>()
                .ForMember(d => d.StartDate, o => o.MapFrom(s => s.OwnershipStartDate))
                .ForMember(d => d.EndDate, o => o.MapFrom(s => s.OwnershipEndDate));
#endregion
            #region Owner

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
                .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner.FullName))
                .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner.NationalId))  // ← أضف هذا
                .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.UnitNumber))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.RequestDate, o => o.MapFrom(s => s.ExemptionDate))
                .ForMember(d => d.LegalReference, o => o.MapFrom(s => s.LegalReference))
                .ForMember(d => d.Type, o => o.MapFrom(s => "إعفاء"));

            #endregion

         

            #region Reviewer Tasks

            CreateMap<Unit, ReviewerTaxTaskListItemDto>()
                .ForMember(d => d.UnitId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.UnitNumber ?? string.Empty))
                .ForMember(d => d.UnitType, o => o.MapFrom(s => s.UnitType))
                .ForMember(d => d.Floor, o => o.MapFrom(s => s.Floor))
                .ForMember(d => d.Area, o => o.MapFrom(s => s.Area))
                .ForMember(d => d.Usage, o => o.Ignore())
                .ForMember(d => d.OwnerName, o => o.Ignore())
                .ForMember(d => d.PropertyAddress, o => o.Ignore())
                .ForMember(d => d.TaxStatus, o => o.Ignore());

            CreateMap<Unit, ReviewerTaxTaskDetailsDto>()
                .ForMember(d => d.UnitId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.UnitNumber ?? string.Empty))
                .ForMember(d => d.UnitType, o => o.MapFrom(s => s.UnitType))
                .ForMember(d => d.Floor, o => o.MapFrom(s => s.Floor))
                .ForMember(d => d.Area, o => o.MapFrom(s => s.Area))
                .ForMember(d => d.Usage, o => o.Ignore())
                .ForMember(d => d.PropertyAddress, o => o.Ignore())
                .ForMember(d => d.TaxStatus, o => o.Ignore())
                .ForMember(d => d.Owners, o => o.Ignore())
                .ForMember(d => d.Tenants, o => o.Ignore());

            #endregion



            #region Tax Assessment

            CreateMap<TaxAssessment, TaxAssessmentDto>();

            CreateMap<TaxCalculationResultDto, TaxAssessment>()
                .ForMember(d => d.Id, o => o.Ignore())
                .ForMember(d => d.Unit, o => o.Ignore())
                .ForMember(d => d.Owner, o => o.Ignore())
                .ForMember(d => d.CreatedAt, o => o.Ignore())
                .ForMember(d => d.CreatedBy, o => o.Ignore())
                .ForMember(d => d.UpdatedAt, o => o.Ignore())
                .ForMember(d => d.UpdatedBy, o => o.Ignore())
                .ForMember(d => d.Status, o => o.Ignore())
                .ForMember(d => d.CalculationDate, o => o.Ignore())
                .ForMember(d => d.Notes, o => o.Ignore())
                .ForMember(d => d.UnitId, o => o.MapFrom(s => s.UnitId))
                .ForMember(d => d.OwnerId, o => o.MapFrom(s => s.OwnerId))
                .ForMember(d => d.TaxYear, o => o.MapFrom(s => s.TaxYear))
                .ForMember(d => d.AnnualRent, o => o.MapFrom(s => s.AnnualRent))
                .ForMember(d => d.MaintenanceDiscountRate, o => o.MapFrom(s => s.DiscountRate / 100m))
                .ForMember(d => d.MaintenanceDiscountAmount, o => o.MapFrom(s => s.DiscountAmount))
                .ForMember(d => d.NetAnnualRentalValue, o => o.MapFrom(s => s.NetAnnualRentalValue))
                .ForMember(d => d.TaxRate, o => o.MapFrom(s => s.TaxRate / 100m))
                .ForMember(d => d.AnnualTax, o => o.MapFrom(s => s.AnnualTax))
                .ForMember(d => d.IsExempted, o => o.MapFrom(s => s.IsExempted))
                .ForMember(d => d.ExemptionAmount, o => o.MapFrom(s => s.ExemptionAmount))
                .ForMember(d => d.ExemptionReason, o => o.MapFrom(s => s.ExemptionReason))
                .ForMember(d => d.PayerType, o => o.MapFrom(s => s.PayerType))
                .ForMember(d => d.PaymentPlan, o => o.MapFrom(s => s.PaymentPlan))
                .ForMember(d => d.AppealFee, o => o.MapFrom(s => s.AppealFee))
                .ForMember(d => d.TotalDue, o => o.MapFrom(s => s.TotalDue));

            #endregion
            #region Appeal
        CreateMap<AppealAttachment, AppealAttachmentDto>();

CreateMap<CreateAppealAttachmentDto, AppealAttachment>();

CreateMap<Appeal, AppealListItemDto>()
    .ForMember(d => d.TaxAssessmentId, o => o.MapFrom(s => s.TaxAssessmentId))
    .ForMember(d => d.UnitId, o => o.MapFrom(s => s.TaxAssessment.UnitId))
    .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.TaxAssessment.Unit.UnitNumber))
    .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.TaxAssessment.Owner != null ? s.TaxAssessment.Owner.FullName : "-"))
    .ForMember(d => d.NationalId, o => o.MapFrom(s => s.TaxAssessment.Owner != null ? s.TaxAssessment.Owner.NationalId : null))
    .ForMember(d => d.TaxYear, o => o.MapFrom(s => s.TaxAssessment.TaxYear))
    .ForMember(d => d.AnnualTax, o => o.MapFrom(s => s.TaxAssessment.AnnualTax))
    .ForMember(d => d.AppealFee, o => o.MapFrom(s => s.TaxAssessment.AppealFee))
    .ForMember(d => d.TotalDue, o => o.MapFrom(s => s.TaxAssessment.TotalDue))
    .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
    .ForMember(d => d.PropertyAddress, o => o.MapFrom(s =>
        s.TaxAssessment.Unit.Property == null
            ? "-"
            : string.Join(" - ", new[]
            {
                s.TaxAssessment.Unit.Property.Governorate != null ? s.TaxAssessment.Unit.Property.Governorate.Name : null,
                s.TaxAssessment.Unit.Property.Neighborhood != null ? s.TaxAssessment.Unit.Property.Neighborhood.Name : null,
                !string.IsNullOrWhiteSpace(s.TaxAssessment.Unit.Property.BuildingNo) ? $"مبنى {s.TaxAssessment.Unit.Property.BuildingNo}" : null
            }.Where(x => !string.IsNullOrWhiteSpace(x)))));

CreateMap<Appeal, AppealDetailsDto>()
    .IncludeBase<Appeal, AppealListItemDto>();

CreateMap<TaxAssessment, AppealAssessmentLookupDto>()
    .ForMember(d => d.TaxAssessmentId, o => o.MapFrom(s => s.Id))
    .ForMember(d => d.UnitId, o => o.MapFrom(s => s.UnitId))
    .ForMember(d => d.UnitNumber, o => o.MapFrom(s => s.Unit.UnitNumber))
    .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner != null ? s.Owner.FullName : "-"))
    .ForMember(d => d.NationalId, o => o.MapFrom(s => s.Owner != null ? s.Owner.NationalId : null))
    .ForMember(d => d.HasAppeal, o => o.MapFrom(s => s.Appeal != null))
    .ForMember(d => d.PropertyAddress, o => o.MapFrom(s =>
        s.Unit.Property == null
            ? "-"
            : string.Join(" - ", new[]
            {
                s.Unit.Property.Governorate != null ? s.Unit.Property.Governorate.Name : null,
                s.Unit.Property.Neighborhood != null ? s.Unit.Property.Neighborhood.Name : null,
                !string.IsNullOrWhiteSpace(s.Unit.Property.BuildingNo) ? $"مبنى {s.Unit.Property.BuildingNo}" : null
            }.Where(x => !string.IsNullOrWhiteSpace(x)))));
            #endregion



             #region Committee
      CreateMap<Appeal, CommitteeAppealDto>()

.ForMember(
d => d.UnitNumber,
o => o.MapFrom(s => s.TaxAssessment.Unit.UnitNumber))

.ForMember(
d => d.PersonName,
o => o.MapFrom(s => s.TaxAssessment.Owner.FullName))

.ForMember(
d => d.Status,
o => o.MapFrom(s => s.Status.ToString()))

.ForMember(
d => d.ProposedTax,
o => o.MapFrom(s => s.TaxAssessment.AnnualTax));

              CreateMap<Exemption, CommitteeExemptionDto>()

    .ForMember(
        d => d.UnitNumber,
        o => o.MapFrom(s => s.Unit.UnitNumber))

    .ForMember(
        d => d.PersonName,
        o => o.MapFrom(s => s.Owner.FullName))

    .ForMember(
        d => d.Status,
        o => o.MapFrom(s => s.Status.ToString()))

    .ForMember(
        d => d.FileName,
        o => o.MapFrom(s =>
            s.Attachments.Any()
                ? Path.GetFileName(s.Attachments.First().FilePath)
                : null));




#endregion  
        

             #region Manager
      CreateMap<Appeal, ManagerAppealDto>()

    .ForMember(
        d => d.UnitNumber,
        o => o.MapFrom(s => s.TaxAssessment.Unit.UnitNumber))

    .ForMember(
        d => d.PersonName,
        o => o.MapFrom(s => s.TaxAssessment.Owner.FullName))

    .ForMember(
        d => d.AppealReason,
        o => o.MapFrom(s => s.AppealReason))

    .ForMember(d => d.OriginalTax,
        o => o.MapFrom(s => s.TaxAssessment.AnnualTax))

    .ForMember(d => d.ProposedTax,
        o => o.MapFrom(s => s.TaxAssessment.CommitteeProposedTax))

    .ForMember(
        d => d.CommitteeVerdict,
        o => o.MapFrom(s => s.CommitteeVerdict))

    .ForMember(
        d => d.CommitteeNote,
        o => o.MapFrom(s => s.CommitteeNote))

    .ForMember(
        d => d.Status,
        o => o.MapFrom(s => s.Status.ToString()));


        CreateMap<Exemption, ManagerExemptionDto>()
    .ForMember(d => d.PersonName,
        o => o.MapFrom(s => s.Owner.FullName))

    .ForMember(d => d.UnitNumber,
        o => o.MapFrom(s => s.Unit.UnitNumber))
   .ForMember(
        d => d.FileName,
        o => o.MapFrom(s =>
            s.Attachments.Any()
                ? Path.GetFileName(s.Attachments.First().FilePath)
                : null))
    .ForMember(d => d.Status,
        o => o.MapFrom(s => s.Status.ToString()));
        #endregion
      
      
      #region Finance
      // ============================================================


            // ============================================================
            // Payment -> PaymentHistoryDto
            // ============================================================
            CreateMap<Payment, PaymentHistoryDto>()
                .ForMember(d => d.PaymentId,
                    o => o.MapFrom(s => s.Id))

                .ForMember(d => d.UnitId,
                    o => o.MapFrom(s => s.Installment.TaxAssessment.UnitId))

                .ForMember(d => d.OwnerName,
                    o => o.MapFrom(s =>
                        s.Installment.TaxAssessment.Owner != null
                        ? s.Installment.TaxAssessment.Owner.FullName
                        : string.Empty))

                .ForMember(d => d.PaidAmount,
                    o => o.MapFrom(s => s.PaidAmount))

                .ForMember(d => d.Method,
                    o => o.MapFrom(s => s.Method))
               .ForMember(d => d.AssessmentId,
                    o => o.MapFrom(s =>
                    s.Installment.TaxAssessmentId))

                .ForMember(d => d.ReceiptNo,
                    o => o.MapFrom(s => s.ReceiptNo))

                .ForMember(d => d.PaymentDate,
                    o => o.MapFrom(s => s.PaymentDate))

                .ForMember(d => d.Status,
                    o => o.MapFrom(s => s.Installment.Status));


        
            // ============================================================
            // TaxAssessment -> FinanceSearchResponseDto
            // ============================================================
            CreateMap<TaxAssessment, FinanceSearchResponseDto>()
    .ForMember(d => d.AssessmentId,
        o => o.MapFrom(s => s.Id))
    .ForMember(d => d.UnitId,
        o => o.MapFrom(s => s.UnitId))
    .ForMember(d => d.OwnerName,
        o => o.MapFrom(s =>
            s.Owner != null ? s.Owner.FullName : string.Empty))
    .ForMember(d => d.NationalId,
        o => o.MapFrom(s =>
            s.Owner != null ? s.Owner.NationalId : string.Empty))
    .ForMember(d => d.Address,
        o => o.MapFrom(s =>
            s.Unit != null && s.Unit.Property != null
            ? $"{s.Unit.Property.Governorate.Name} - {s.Unit.Property.Neighborhood.Name} - {s.Unit.Property.Neighborhood.Center.Name}"
            : string.Empty))
    .ForMember(d => d.AnnualTax,
        o => o.MapFrom(s => s.AnnualTax))
    .ForMember(d => d.AppealFee,                          // ← كان ناقصاً
        o => o.MapFrom(s => s.AppealFee))
    .ForMember(d => d.TotalDue,
        o => o.MapFrom(s => s.TotalDue))
    .ForMember(d => d.PaymentPlan,
        o => o.MapFrom(s => s.PaymentPlan.ToString()))    // ← ToString() مهم
    .ForMember(d => d.PaymentStatus,
        o => o.MapFrom(s => s.PaymentStatus.ToString())) // ← ToString() مهم
    .ForMember(d => d.IsAvailableForCollection,           // ← كان ناقصاً
        o => o.MapFrom(s => s.IsAvailableForCollection))
    .ForMember(d => d.Installments,
        o => o.MapFrom(s => s.Installments));

CreateMap<Installment, InstallmentDto>()
    .ForMember(d => d.Status,
        o => o.MapFrom(s => s.Status.ToString()));        // ← ToString() مهم
          
                    #endregion
        }
    
    }}