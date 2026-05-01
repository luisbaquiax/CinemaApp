export interface BalanceUpdateRequest {
    monto: number;
    operacion?: string;
}

export interface CarteraResponse {
    id: number;
    idUsuario: number;
    saldo: number;
    transacciones: TransaccionCarteraDTO[];
}

export interface ReduceAmount {
    idUsuario: number;
    monto: number;
}

export interface TransaccionCarteraDTO {
    idTransaccion: number;
    idCartera: number;
    tipo: string;
    monto: number;
    descripcion: string;
    fechaTransaccion: string;
}