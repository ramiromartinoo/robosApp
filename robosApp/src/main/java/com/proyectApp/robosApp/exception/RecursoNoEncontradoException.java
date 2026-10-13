package com.proyectApp.robosApp.exception;

// Se traduce a un 404 en ManejadorDeErrores
public class RecursoNoEncontradoException extends RuntimeException {

	public RecursoNoEncontradoException(String mensaje) {
		super(mensaje);
	}

}
