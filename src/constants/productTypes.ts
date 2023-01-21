import {ProductTypeDocument} from "types/constants/productTypes";

export enum ProductTypeId {
    SimpleProduct = 1,
    VariableProduct,
    ExternalProduct
}

export const ProductTypes: Array<ProductTypeDocument> = [
    {id: ProductTypeId.SimpleProduct, order: 1, langKey: "product"},
    {id: ProductTypeId.VariableProduct, order: 2, langKey: "product"},
    {id: ProductTypeId.ExternalProduct, order: 3, langKey: "product"},
]
