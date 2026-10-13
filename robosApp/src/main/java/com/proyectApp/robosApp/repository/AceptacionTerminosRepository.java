package com.proyectApp.robosApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.entity.AceptacionTerminos;

public interface AceptacionTerminosRepository extends JpaRepository<AceptacionTerminos, Long> {

	boolean existsByUsuarioIdAndTerminosId(Long usuarioId, Long terminosId);

	Optional<AceptacionTerminos> findByUsuarioIdAndTerminosId(Long usuarioId, Long terminosId);

	@Modifying
	@Query("delete from AceptacionTerminos a where a.usuario.id = :usuarioId")
	void eliminarDeUsuario(@Param("usuarioId") Long usuarioId);

}
