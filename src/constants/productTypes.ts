import {ProductTypeDocument} from "types/constants/productTypes";

export enum ProductTypeId {
    SimpleProduct = 1,
    VariableProduct,
    ExternalProduct
}

export const ProductTypes: Array<ProductTypeDocument> = [
    {id: ProductTypeId.SimpleProduct, order: 1, langKey: "simpleProduct"},
    {id: ProductTypeId.VariableProduct, order: 2, langKey: "variableProduct"}
]
