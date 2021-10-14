db = db.getSiblingDB("fastify-app");

db.createCollection("users");

db.users.insertMany([
  {
    email: "jojo.theerapat@hotmail.com",
    password: "$2b$10$Ar0ZLiA1iobdr/g9S66nBe5UYVUVwCKNTvojseQw38FPsqddxlz0e",
    firstName: "jojo",
    lastName: "theerapat",
    role: "Admin",
  },
  {
    email: "test@test.com",
    password: "$2b$10$Ar0ZLiA1iobdr/g9S66nBe5UYVUVwCKNTvojseQw38FPsqddxlz0e",
    firstName: "test",
    lastName: "test",
  },
]);
