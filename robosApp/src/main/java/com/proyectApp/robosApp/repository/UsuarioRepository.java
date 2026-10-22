package com.proyectApp.robosApp.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByFirebaseUid(String firebaseUid);

	// SOLO para los datos de ejemplo: la fecha de registro no se cambia nunca desde la app
	@Modifying
	@Query("update Usuario u set u.fechaRegistro = :fecha where u.id = :id")
	void cambiarFechaDeRegistro(@Param("id") Long id, @Param("fecha") LocalDateTime fecha);

}
