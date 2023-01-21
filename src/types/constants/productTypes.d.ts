import LanguageKeys from "../languages";
import {ProductTypeId} from "constants/productTypes";

export interface ProductTypeDocument {
    id: ProductTypeId,
    order: number,
    langKey: LanguageKeys
}