import neo4j from "neo4j-driver";

export const authenticate = async (
  { username, password }: any,
  driver: { session: (arg0: { defaultAccessMode: any }) => any }
) => {
  var session = driver.session({ defaultAccessMode: neo4j.session.READ });
  const user = await session
    .run(`MATCH (u:User {username : $username}) RETURN u`, {
      username,
    })
    .then((result: { records: any[] }) => {
      return result.records.map((record) => {
        return record.get("u").properties;
      })[0];
    })
    .catch((error: any) => {
      console.log(error);
      return 0;
    });

  return user;
};
