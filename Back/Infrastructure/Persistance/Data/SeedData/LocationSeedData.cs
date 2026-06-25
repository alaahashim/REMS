using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Data
{
    public static class LocationSeedData
    {
        public static void Seed(ModelBuilder builder)
        {
            // 1. المحافظات (Governorates)
            builder.Entity<Governorate>().HasData(
                new Governorate { Id = 1, Name = "القاهرة" },
                new Governorate { Id = 2, Name = "الجيزة" },
                new Governorate { Id = 3, Name = "الإسكندرية" },
                new Governorate { Id = 4, Name = "أسيوط" },
                new Governorate { Id = 5, Name = "المنيا" },
                new Governorate { Id = 6, Name = "سوهاج" },
                new Governorate { Id = 7, Name = "قنا" }
            );

            // 2. المراكز والأحياء الرئيسية (Centers / Districts)
            builder.Entity<Center>().HasData(
                // القاهرة (GovernorateId = 1)
                new Center { Id = 1, Name = "مدينة نصر", GovernorateId = 1 },
                new Center { Id = 2, Name = "المعادي", GovernorateId = 1 },
                new Center { Id = 3, Name = "حلوان", GovernorateId = 1 },
                new Center { Id = 15, Name = "مصر الجديدة", GovernorateId = 1 },
                new Center { Id = 16, Name = "التجمع الخامس", GovernorateId = 1 },

                // الجيزة (GovernorateId = 2)
                new Center { Id = 4, Name = "الدقي", GovernorateId = 2 },
                new Center { Id = 5, Name = "الهرم", GovernorateId = 2 },
                new Center { Id = 17, Name = "المهندسين", GovernorateId = 2 },
                new Center { Id = 18, Name = "6 أكتوبر", GovernorateId = 2 },

                // الإسكندرية (GovernorateId = 3)
                new Center { Id = 6, Name = "سيدي جابر", GovernorateId = 3 },
                new Center { Id = 7, Name = "العجمي", GovernorateId = 3 },
                new Center { Id = 19, Name = "سموحة", GovernorateId = 3 },
                new Center { Id = 20, Name = "المنتزة", GovernorateId = 3 },

                // أسيوط (GovernorateId = 4)
                new Center { Id = 8, Name = "أسيوط (المركز)", GovernorateId = 4 },
                new Center { Id = 9, Name = "البداري", GovernorateId = 4 },
                new Center { Id = 10, Name = "ديروط", GovernorateId = 4 },
                new Center { Id = 11, Name = "القوصية", GovernorateId = 4 },
                new Center { Id = 21, Name = "أبو تيج", GovernorateId = 4 },

                // المنيا (GovernorateId = 5)
                new Center { Id = 12, Name = "المنيا (المركز)", GovernorateId = 5 },
                new Center { Id = 22, Name = "ملوي", GovernorateId = 5 },
                new Center { Id = 23, Name = "بني مزار", GovernorateId = 5 },

                // سوهاج (GovernorateId = 6)
                new Center { Id = 13, Name = "سوهاج (المركز)", GovernorateId = 6 },
                new Center { Id = 24, Name = "طهطا", GovernorateId = 6 },
                new Center { Id = 25, Name = "جرجا", GovernorateId = 6 },

                // قنا (GovernorateId = 7)
                new Center { Id = 14, Name = "قنا (المركز)", GovernorateId = 7 },
                new Center { Id = 26, Name = "نجع حمادي", GovernorateId = 7 },
                new Center { Id = 27, Name = "قوص", GovernorateId = 7 }
            );

            // 3. الشوارع (Streets)
            builder.Entity<Street>().HasData(
                // مدينة نصر (CenterId = 1)
                new Street { Id = 1, Name = "شارع النصر", CenterId = 1 },
                new Street { Id = 2, Name = "شارع عباس العقاد", CenterId = 1 },
                new Street { Id = 3, Name = "شارع مكرم عبيد", CenterId = 1 },
                new Street { Id = 7, Name = "شارع الطيران", CenterId = 1 },

                // المعادي (CenterId = 2)
                new Street { Id = 8, Name = "شارع 9", CenterId = 2 },
                new Street { Id = 9, Name = "شارع النصر (المعادي)", CenterId = 2 },

                // المهندسين (CenterId = 17)
                new Street { Id = 10, Name = "شارع جامعة الدول العربية", CenterId = 17 },
                new Street { Id = 11, Name = "شارع البطل أحمد عبد العزيز", CenterId = 17 },

                // الهرم (CenterId = 5)
                new Street { Id = 12, Name = "شارع فيصل الرئيسي", CenterId = 5 },
                new Street { Id = 13, Name = "شارع الهرم الرئيسي", CenterId = 5 },

                // سموحة (CenterId = 19)
                new Street { Id = 14, Name = "شارع فوزي معاذ", CenterId = 19 },
                new Street { Id = 15, Name = "شارع ألبرت الأول", CenterId = 19 },

                // أسيوط (CenterId = 8)
                new Street { Id = 4, Name = "شارع الجمهورية", CenterId = 8 },
                new Street { Id = 5, Name = "شارع الهلالي", CenterId = 8 },
                new Street { Id = 6, Name = "شارع يسري راغب", CenterId = 8 },
                new Street { Id = 16, Name = "شارع النميس", CenterId = 8 },
                new Street { Id = 17, Name = "شارع الكورنيش", CenterId = 8 },

                // المنيا (CenterId = 12)
                new Street { Id = 18, Name = "شارع كورنيش النيل", CenterId = 12 },
                new Street { Id = 19, Name = "شارع طه حسين", CenterId = 12 },
                new Street { Id = 20, Name = "شارع ابن خصيب", CenterId = 12 },

                // سوهاج (CenterId = 13)
                new Street { Id = 21, Name = "شارع الجمهورية (سوهاج)", CenterId = 13 },
                new Street { Id = 22, Name = "شارع المحطة", CenterId = 13 },
                new Street { Id = 23, Name = "شارع الكورنيش الشرقي", CenterId = 13 },

                // قنا (CenterId = 14)
                new Street { Id = 24, Name = "شارع 23 يوليو", CenterId = 14 },
                new Street { Id = 25, Name = "شارع الجميل", CenterId = 14 },
                new Street { Id = 26, Name = "شارع مصطفى كامل", CenterId = 14 }
            );

            // 4. المناطق / الأحياء الفرعية (Neighborhoods)
            builder.Entity<Neighborhood>().HasData(
                // مدينة نصر (CenterId = 1)
                new Neighborhood { Id = 1, Name = "الحي السابع", CenterId = 1, Zone = "A" },
                new Neighborhood { Id = 2, Name = "الحي الثامن", CenterId = 1, Zone = "B" },
                new Neighborhood { Id = 3, Name = "الحي العاشر", CenterId = 1, Zone = "C" },
                new Neighborhood { Id = 7, Name = "المنطقة الأولى", CenterId = 1, Zone = "A" },

                // التجمع الخامس (CenterId = 16)
                new Neighborhood { Id = 8, Name = "النرجس", CenterId = 16, Zone = "A" },
                new Neighborhood { Id = 9, Name = "الياسمين", CenterId = 16, Zone = "B" },
                new Neighborhood { Id = 10, Name = "اللوتس", CenterId = 16, Zone = "C" },

                // 6 أكتوبر (CenterId = 18)
                new Neighborhood { Id = 11, Name = "الحي المتميز", CenterId = 18, Zone = "A" },
                new Neighborhood { Id = 12, Name = "الحي الأول", CenterId = 18, Zone = "B" },

                // المنتزة (CenterId = 20)
                new Neighborhood { Id = 13, Name = "المعمورة", CenterId = 20, Zone = "A" },
                new Neighborhood { Id = 14, Name = "العصافرة", CenterId = 20, Zone = "B" },
                new Neighborhood { Id = 15, Name = "سيدي بشر", CenterId = 20, Zone = "B" },

                // أسيوط (CenterId = 8)
                new Neighborhood { Id = 4, Name = "غرب البلد", CenterId = 8, Zone = "A" },
                new Neighborhood { Id = 5, Name = "شرق البلد", CenterId = 8, Zone = "B" },
                new Neighborhood { Id = 6, Name = "الأربعين", CenterId = 8, Zone = "C" },
                new Neighborhood { Id = 16, Name = "شركة الفريال", CenterId = 8, Zone = "A" },
                new Neighborhood { Id = 17, Name = "السادات", CenterId = 8, Zone = "C" },

                // المنيا (CenterId = 12)
                new Neighborhood { Id = 18, Name = "أبو هلال", CenterId = 12, Zone = "B" },
                new Neighborhood { Id = 19, Name = "شاهين", CenterId = 12, Zone = "B" },
                new Neighborhood { Id = 20, Name = "أرض سلطان", CenterId = 12, Zone = "A" },

                // سوهاج (CenterId = 13)
                new Neighborhood { Id = 21, Name = "حي شرق", CenterId = 13, Zone = "A" },
                new Neighborhood { Id = 22, Name = "حي غرب", CenterId = 13, Zone = "B" },
                new Neighborhood { Id = 23, Name = "حي الكوثر", CenterId = 13, Zone = "C" },

                // قنا (CenterId = 14)
                new Neighborhood { Id = 24, Name = "حي المصالح", CenterId = 14, Zone = "A" },
                new Neighborhood { Id = 25, Name = "حي الشؤون", CenterId = 14, Zone = "B" },
                new Neighborhood { Id = 26, Name = "الحصواية", CenterId = 14, Zone = "C" }
            );
        }
    }
}