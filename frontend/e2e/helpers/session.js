export const buildFakeJwt = () => {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 2;
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    id: 1,
    role: "admin",
    exp: expSeconds,
  })}.signature`;
};

export const adminUser = {
  id: 1,
  firstName: "Admin",
  lastName: "QA",
  email: "admin@test.com",
  role: "admin",
};
