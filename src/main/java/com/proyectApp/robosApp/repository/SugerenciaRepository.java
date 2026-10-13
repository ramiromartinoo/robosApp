package com.proyectApp.robosApp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.entity.EstadoSugerencia;
import com.proyectApp.robosApp.entity.Sugerencia;

public interface SugerenciaRepository extends JpaRepository<Sugerencia, Long> {

	@EntityGraph(attributePaths = "usuario")
	Page<Sugerencia> findByUsuarioId(Long usuarioId, Pageable pageable);

	@EntityGraph(attributePaths = "usuario")
	@Query("select s from Sugerencia s where :estado is null or s.estado = :estado")
	Page<Sugerencia> buscar(@Param("estado") EstadoSugerencia estado, Pageable pageable);

	@Modifying
	@Query("delete from Sugerencia s where s.usuario.id = :usuarioId")
	void eliminarDeUsuario(@Param("usuarioId") Long usuarioId);

}
