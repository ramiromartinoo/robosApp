package com.proyectApp.robosApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.proyectApp.robosApp.entity.TerminosCondiciones;

public interface TerminosCondicionesRepository extends JpaRepository<TerminosCondiciones, Long> {

	Optional<TerminosCondiciones> findFirstByOrderByFechaPublicacionDescIdDesc();

	// Solo el id: se consulta en cada petición y no hace falta traer el texto completo
	@Query("select t.id from TerminosCondiciones t order by t.fechaPublicacion desc, t.id desc limit 1")
	Optional<Long> findIdVigente();

	boolean existsByVersion(String version);

}
