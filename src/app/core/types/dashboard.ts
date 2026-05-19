export interface DashboardDTO {
  totalPedidos?: number;
  pedidosCompletados?: number;
  pedidosPendientes?: number;
  pedidosCancelados?: number;
  clientesActivos?: number;
  totalClientes?: number;
  actividadPorDia?: Record<string, unknown>[];
  actividadPorMes?: Record<string, unknown>[];
}

