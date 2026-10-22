package com.proyectApp.robosApp.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.entity.Confirmacion;
import com.proyectApp.robosApp.entity.EstadoPosteo;

public interface ConfirmacionRepository extends JpaRepository<Confirmacion, Long> {

	Optional<Confirmacion> findByPosteoIdAndUsuarioId(Long posteoId, Long usuarioId);

	// Una sola consulta para todos los posteos de una página del feed
	@Query("""
			select new com.proyectApp.robosApp.repository.ConteoConfirmaciones(c.posteo.id, c.tipo, count(c))
			from Confirmacion c
			where c.posteo.id in :posteoIds
			group by c.posteo.id, c.tipo
			""")
	List<ConteoConfirmaciones> contarPorPosteo(@Param("posteoIds") Collection<Long> posteoIds);

	// Reputación: votos que recibieron los reportes vigentes de cada usuario
	@Query("""
			select new com.proyectApp.robosApp.repository.VotosPorUsuario(c.posteo.usuario.id, c.tipo, count(c))
			from Confirmacion c
			where c.posteo.usuario.id in :usuarioIds and c.posteo.estado <> :excluido
			group by c.posteo.usuario.id, c.tipo
			""")
	List<VotosPorUsuario> votosRecibidosPorUsuario(@Param("usuarioIds") Collection<Long> usuarioIds,
			@Param("excluido") EstadoPosteo excluido);

	// Qué votó el usuario en cada posteo de una página del feed
	@Query("select c from Confirmacion c where c.usuario.id = :usuarioId and c.posteo.id in :posteoIds")
	List<Confirmacion> votosDelUsuario(@Param("usuarioId") Long usuarioId,
			@Param("posteoIds") Collection<Long> posteoIds);

	// Votos del usuario y votos sobre los posteos del usuario (para eliminar su cuenta)
	@Modifying
	@Query("""
			delete from Confirmacion c
			where c.usuario.id = :usuarioId
			   or c.posteo.id in (select p.id from Posteo p where p.usuario.id = :usuarioId)
			""")
	void eliminarDeUsuarioYDeSusPosteos(@Param("usuarioId") Long usuarioId);

}
