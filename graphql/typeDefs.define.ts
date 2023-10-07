export const typeDefs: string = `
  type Query {
    login(username: String!, password: String!): User 
  }

  type Category {
    name: String!
    url: String!
    products: [Product!]! @relationship(type: "IN_CATEGORY", direction: IN)
  }

  type Product {
    title: String!
    description: String
    price: Int!
    extract_vial_price: Int!
    image_url: String
    category: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
  }

  type JWT @jwt {
    roles: [String!]!
  }

  type User @authentication(operations: [UPDATE, DELETE]) {
    id: ID!
    username: String!
    password: String!
    email: String!
    access_token: String! @customResolver(require: "username password email")
  }

  extend schema @authentication
`;
