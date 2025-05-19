import bcrypt from "bcryptjs";

const admins = [
  {
    id: "1",
    username: "admin1",
    passwordHash: bcrypt.hashSync("adminpass1", 10),
  },
  {
    id: "2",
    username: "admin2",
    passwordHash: bcrypt.hashSync("adminpass2", 10),
  },
];

export function findAdminByUsername(username) {
  return admins.find((admin) => admin.username === username);
}
