package com.proyectApp.robosApp.config;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

// Con el perfil "prod" se niega a arrancar si la configuración es la de desarrollo.
// Es preferible que el servidor no levante a que quede abierto o sin forma de iniciar sesión.
@Component
@Profile("prod")
public class ChequeoDeProduccion {

	public ChequeoDeProduccion(Environment entorno) {
		if (entorno.getProperty("robosapp.seguridad.tokens-de-prueba", Boolean.class, false)) {
			throw new IllegalStateException("En producción robosapp.seguridad.tokens-de-prueba tiene que ser false: "
					+ "con los tokens de prueba cualquiera puede entrar como administrador");
		}
		if (!StringUtils.hasText(entorno.getProperty(HayCredencialesDeFirebase.RUTA))
				&& !StringUtils.hasText(entorno.getProperty(HayCredencialesDeFirebase.CONTENIDO))) {
			throw new IllegalStateException("En producción hay que configurar la clave de Firebase, con la variable "
					+ "ROBOSAPP_FIREBASE_CREDENCIALES_JSON (el contenido del .json) o ROBOSAPP_FIREBASE_CREDENCIALES "
					+ "(la ruta al archivo): sin Firebase nadie puede iniciar sesión");
		}
	}

}
