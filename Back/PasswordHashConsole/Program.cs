using Core.Service.Helpers;

var password = "123456";
var hash = PasswordHashHelper.HashPassword(password);

Console.WriteLine(hash);
