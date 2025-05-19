import bcrypt from "bcryptjs";

const users = [
  {
    id: "1",
    username: "admin",
    passwordHash: bcrypt.hashSync("adminpass", 10), // you can replace password
    role: "admin",
  },
  {
    id: "2",
    username: "viewer",
    passwordHash: bcrypt.hashSync("viewerpass", 10),
    role: "viewer",
  },
];

export function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}
