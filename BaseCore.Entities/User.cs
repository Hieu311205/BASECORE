using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace BaseCore.Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public int Id { get; set; }
        public string Name { get; set; } = "";
        //public string Guid { get; set; }
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
        public byte[] Salt { get; set; } = Array.Empty<byte>();
        public string Contact { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Position { get; set; } = "";
        public string Image { get; set; } = "";
        public bool IsActive { get; set; } = true;
        public int UserType { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
    }
}
