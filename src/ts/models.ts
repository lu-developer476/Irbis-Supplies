export type CurrencyARS = number;

export interface Product {
  id: number;
  nombre: string;
  precio: CurrencyARS;
  img: string;
  categoria?: string;
  stock?: number;
  descripcion?: string;
}

export interface CartItem extends Product {
  cantidad: number;
}

export type InvoiceType = "A" | "B" | "C";

export type ShippingMethod = "retiro" | "correo" | "mensajeria";

 
export interface ProductColor {
  nombre: string;
  hex: string;
}

export interface CatalogProductData {
  id: number;
  nombre: string;
  descripcion: string;
  nombreEn?: string;
  descripcionEn?: string;
  precioBase: number;
  imagen: string;
  colores: ProductColor[];
}

export interface CatalogProduct extends CatalogProductData {
  precio: CurrencyARS;
}

export interface CartEntry {
  id: number;
  nombre: string;
  precio: CurrencyARS;
  cantidad: number;
  color: string;
  imagen?: string;
}
