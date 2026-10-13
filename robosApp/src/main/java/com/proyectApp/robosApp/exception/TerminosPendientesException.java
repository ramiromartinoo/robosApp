package com.proyectApp.robosApp.exception;

// Se traduce a un 428 en ManejadorDeErrores: la app debe mostrar los términos antes de seguir
public class TerminosPendientesException extends RuntimeException {

	public TerminosPendientesException() {
		super("Tenés que aceptar los términos y condiciones para seguir usando la app");
	}

}
