package com.proyectApp.robosApp.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.proyectApp.robosApp.dto.ErrorResponse;
import com.proyectApp.robosApp.exception.AccesoDenegadoException;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.DemasiadasPeticionesException;
import com.proyectApp.robosApp.exception.NoAutorizadoException;
import com.proyectApp.robosApp.exception.PeticionInvalidaException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.exception.TerminosPendientesException;

@RestControllerAdvice
public class ManejadorDeErrores {

	// Falló alguna validación de Bean Validation (@NotNull, @Size, etc.)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse validacion(MethodArgumentNotValidException ex) {
		Map<String, String> errores = new LinkedHashMap<>();
		ex.getBindingResult().getFieldErrors()
				.forEach(error -> errores.putIfAbsent(error.getField(), error.getDefaultMessage()));
		return new ErrorResponse("Hay datos inválidos", errores);
	}

	@ExceptionHandler(PeticionInvalidaException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse peticionInvalida(PeticionInvalidaException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	@ExceptionHandler(AccesoDenegadoException.class)
	@ResponseStatus(HttpStatus.FORBIDDEN)
	public ErrorResponse accesoDenegado(AccesoDenegadoException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	@ExceptionHandler(DemasiadasPeticionesException.class)
	@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
	public ErrorResponse demasiadasPeticiones(DemasiadasPeticionesException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	@ExceptionHandler(NoAutorizadoException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public ErrorResponse noAutorizado(NoAutorizadoException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	// 428 = "falta cumplir una condición previa": la app lo usa para mostrar la pantalla de términos
	@ExceptionHandler(TerminosPendientesException.class)
	@ResponseStatus(HttpStatus.PRECONDITION_REQUIRED)
	public ErrorResponse terminosPendientes(TerminosPendientesException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	@ExceptionHandler(RecursoNoEncontradoException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorResponse noEncontrado(RecursoNoEncontradoException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	@ExceptionHandler(ConflictoException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	public ErrorResponse conflicto(ConflictoException ex) {
		return new ErrorResponse(ex.getMessage());
	}

	// JSON mal formado o con un valor imposible (ej. una categoría que no existe)
	@ExceptionHandler(HttpMessageNotReadableException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse cuerpoIlegible(HttpMessageNotReadableException ex) {
		return new ErrorResponse("El cuerpo de la petición no es válido");
	}

	// Parámetro de la URL con un valor imposible (ej. ?categoria=XXX o ?page=abc)
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse parametroInvalido(MethodArgumentTypeMismatchException ex) {
		return new ErrorResponse("Valor inválido para el parámetro '" + ex.getName() + "'");
	}

}
