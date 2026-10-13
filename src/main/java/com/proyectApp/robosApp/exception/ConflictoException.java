package com.proyectApp.robosApp.exception;

// Se traduce a un 409 en ManejadorDeErrores
public class ConflictoException extends RuntimeException {

	public ConflictoException(String mensaje) {
		super(mensaje);
	}

}
