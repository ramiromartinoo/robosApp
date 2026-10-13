package com.proyectApp.robosApp.exception;

// Se traduce a un 400 en ManejadorDeErrores
public class PeticionInvalidaException extends RuntimeException {

	public PeticionInvalidaException(String mensaje) {
		super(mensaje);
	}

}
