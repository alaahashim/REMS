namespace Core.ServiceAbstraction
{
    public interface IServiceManager
    {
        ILocationService LocationService { get; }

        IPropertyService PropertyService { get; }

      IAssignmentService AssignmentService { get; }
         IOwnerService OwnerService { get; }

    }
}