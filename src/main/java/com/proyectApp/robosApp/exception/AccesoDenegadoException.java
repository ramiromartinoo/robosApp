package com.proyectApp.robosApp.exception;

// Se traduce a un 403 en ManejadorDeErrores
public class AccesoDenegadoException extends RuntimeException {

	public AccesoDenegadoException(String mensaje) {
		super(mensaje);
	}

}
