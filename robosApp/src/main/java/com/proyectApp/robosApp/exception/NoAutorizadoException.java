package com.proyectApp.robosApp.exception;

// Se traduce a un 401 en ManejadorDeErrores
public class NoAutorizadoException extends RuntimeException {

	public NoAutorizadoException(String mensaje) {
		super(mensaje);
	}

}
