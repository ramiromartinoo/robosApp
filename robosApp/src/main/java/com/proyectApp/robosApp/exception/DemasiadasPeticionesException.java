package com.proyectApp.robosApp.exception;

// Se traduce a un 429 en ManejadorDeErrores
public class DemasiadasPeticionesException extends RuntimeException {

	public DemasiadasPeticionesException(String mensaje) {
		super(mensaje);
	}

}
