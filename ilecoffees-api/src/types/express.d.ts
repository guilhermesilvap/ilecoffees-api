declare namespace Express {
  export interface Request {
    user: {
      id: string
      type: "USER" | "SUPPLIER" | "ADMIN" | "EMPLOYEE"
      accountType?: "CUSTOMER" | "COFFEESHOP"
      supplierType?: "PRODUCER" | "ROASTER"
      coffeeshopId?: string
    }
  }
}
