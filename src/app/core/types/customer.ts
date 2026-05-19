export interface CustomerDTO {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  totalPedidos?: number;
}

