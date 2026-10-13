package com.proyectApp.robosApp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

	private final TerminosInterceptor terminosInterceptor;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(terminosInterceptor)
				// lo necesario para loguearse, leer los términos y aceptarlos tiene que seguir funcionando
				.excludePathPatterns("/auth/**", "/terminos/**", "/error");
	}

}
