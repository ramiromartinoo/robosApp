package com.proyectApp.robosApp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Verifica que la aplicación arranca completa (con las migraciones aplicadas sobre la base de pruebas)
@SpringBootTest
@ActiveProfiles("test")
class RobosAppApplicationTests {

	@Test
	void contextLoads() {
	}

}
