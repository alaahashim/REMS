using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Data
{
    public static class LocationSeedData
    {
        public static void Seed(ModelBuilder builder)
        {
            builder.Entity<Governorate>().HasData(

                new Governorate { Id = 1, Name = "القاهرة" },
                new Governorate { Id = 2, Name = "الجيزة" },
                new Governorate { Id = 3, Name = "الإسكندرية" },
                new Governorate { Id = 4, Name = "أسيوط" },
                new Governorate { Id = 5, Name = "المنيا" },
                new Governorate { Id = 6, Name = "سوهاج" },
                new Governorate { Id = 7, Name = "قنا" }

            );

            builder.Entity<Center>().HasData(

    // القاهرة
    new Center { Id = 1, Name = "مدينة نصر", GovernorateId = 1 },
    new Center { Id = 2, Name = "المعادي", GovernorateId = 1 },
    new Center { Id = 3, Name = "حلوان", GovernorateId = 1 },

    // الجيزة
    new Center { Id = 4, Name = "الدقي", GovernorateId = 2 },
    new Center { Id = 5, Name = "الهرم", GovernorateId = 2 },

    // الإسكندرية
    new Center { Id = 6, Name = "سيدي جابر", GovernorateId = 3 },
    new Center { Id = 7, Name = "العجمي", GovernorateId = 3 },

    // أسيوط
        new Center { Id = 8, Name = "أسيوط", GovernorateId = 4 },

    new Center { Id = 9, Name = "البداري", GovernorateId = 4 },
    new Center { Id = 10, Name = "ديروط", GovernorateId = 4 },
    new Center { Id = 11, Name = "القوصية", GovernorateId = 4 },

    // المنيا
    new Center { Id = 12, Name = "المنيا", GovernorateId = 5 },

    // سوهاج
    new Center { Id = 13, Name = "سوهاج", GovernorateId = 6 },

    // قنا
    new Center { Id = 14, Name = "قنا", GovernorateId = 7 }

);
builder.Entity<Street>().HasData(

    new Street
    {
        Id = 1,
        Name = "شارع النصر",
        CenterId = 1
    },

    new Street
    {
        Id = 2,
        Name = "شارع عباس العقاد",
        CenterId = 1
    },

    new Street
    {
        Id = 3,
        Name = "شارع مكرم عبيد",
        CenterId = 1
    },

    new Street
    {
        Id = 4,
        Name = "شارع الجمهورية",
        CenterId = 8
    },

    new Street
    {
        Id = 5,
        Name = "شارع الهلالي",
        CenterId = 8
    },

    new Street
    {
        Id = 6,
        Name = "شارع يسري راغب",
        CenterId = 8
    }
);
builder.Entity<Neighborhood>().HasData(

    new Neighborhood
    {
        Id = 1,
        Name = "الحي السابع",
        CenterId = 1,
        Zone = "A"
    },

    new Neighborhood
    {
        Id = 2,
        Name = "الحي الثامن",
        CenterId = 1,
        Zone = "B"
    },

    new Neighborhood
    {
        Id = 3,
        Name = "الحي العاشر",
        CenterId = 1,
        Zone = "C"
    },

    new Neighborhood
    {
        Id = 4,
        Name = "غرب البلد",
        CenterId = 8,
        Zone = "A"
    },

    new Neighborhood
    {
        Id = 5,
        Name = "شرق البلد",
        CenterId = 8,
        Zone = "B"
    },

    new Neighborhood
    {
        Id = 6,
        Name = "الأربعين",
        CenterId = 8,
        Zone = "C"
    }

);

        }
    }
}