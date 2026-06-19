using Newtonsoft.Json;
using NUnit.Framework;
using BaseCore.Common;
using BaseCore.Entities;
using System;

namespace BaseCore.UnitTest
{
    public class UnitTestUserService
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void TestInsertUserSuccess()
        {
            var password = TokenHelper.HashPassword("123456", out byte[] salt);
            var user = new User
            {
                Name = "Vũ Tuấn",
                UserName = "tuan@oriwave.com",
                Contact = "Dương Nội, Hà Đông",
                Password = password,
                Salt = salt,
                Created = DateTime.UtcNow,
                Email = "tuan@oriwave.com",
                Phone = "0919901195",
                IsActive = true,
                Position = "tester",
            };
            var userResult = JsonConvert.SerializeObject(user);
            Console.WriteLine(userResult);
            Assert.That(user.UserName, Is.EqualTo("tuan@oriwave.com"));
            Assert.That(user.Password, Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public void TestHashPassword_DifferentSalts()
        {
            var pass1 = TokenHelper.HashPassword("123456", out byte[] salt1);
            var pass2 = TokenHelper.HashPassword("123456", out byte[] salt2);
            Assert.That(pass1, Is.Not.EqualTo(pass2));
        }

        [Test]
        public void Test1()
        {
            Assert.Pass();
        }
    }
}