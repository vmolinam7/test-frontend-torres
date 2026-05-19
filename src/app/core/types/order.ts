export type OrderStatus = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | string;

export interface OrderDTO {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total?: number;
  estado?: OrderStatus;
  fechaPedido?: string;
  fechaActualizacion?: string;
  customerId: number;
  customerNombre?: string;
}

export interface OrderFilters {
  clienteId?: number;
  estado?: string;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
}

