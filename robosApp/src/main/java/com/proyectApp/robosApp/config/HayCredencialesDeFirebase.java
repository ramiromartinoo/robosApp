package com.proyectApp.robosApp.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

// La clave de servicio de Firebase se puede dar de dos formas:
// - robosapp.firebase.credenciales: ruta al archivo .json (en la PC de desarrollo o en un servidor propio)
// - robosapp.firebase.credenciales-json: el contenido del .json (en los hostings que solo aceptan
//   variables de entorno y no dejan subir archivos)
// Firebase se activa si está configurada cualquiera de las dos.
public class HayCredencialesDeFirebase implements Condition {

	public static final String RUTA = "robosapp.firebase.credenciales";
	public static final String CONTENIDO = "robosapp.firebase.credenciales-json";

	@Override
	public boolean matches(ConditionContext contexto, AnnotatedTypeMetadata metadatos) {
		var entorno = contexto.getEnvironment();
		return StringUtils.hasText(entorno.getProperty(RUTA)) || StringUtils.hasText(entorno.getProperty(CONTENIDO));
	}

}
