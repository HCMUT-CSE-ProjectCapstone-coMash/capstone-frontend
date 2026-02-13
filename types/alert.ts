export enum AlertType { 
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",  
}

export interface Alert {
    id: string,
    type: AlertType,
    message: string
};