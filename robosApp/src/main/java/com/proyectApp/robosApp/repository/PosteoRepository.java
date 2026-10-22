package com.proyectApp.robosApp.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.dto.ConteoCategoriaResponse;
import com.proyectApp.robosApp.dto.PuntoHeatmapResponse;
import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.Usuario;

public interface PosteoRepository extends JpaRepository<Posteo, Long> {

	// @EntityGraph trae el usuario en la misma consulta (evita una consulta extra por posteo)
	@EntityGraph(attributePaths = "usuario")
	Page<Posteo> findByEstado(EstadoPosteo estado, Pageable pageable);

	@EntityGraph(attributePaths = "usuario")
	Page<Posteo> findByEstadoAndCategoria(EstadoPosteo estado, Categoria categoria, Pageable pageable);

	// Feed por cercanía. Primero recorta con un rectángulo (usa el índice de latitud/longitud)
	// y después calcula la distancia real en km con la fórmula de haversine.
	// La distancia se mide contra la coordenada redondeada (la pública), no contra la exacta:
	// así no se puede usar el filtro para adivinar la ubicación exacta de un reporte.
	String FILTRO_CERCANIA = """
			from Posteo p
			where p.estado = :estado
			  and (:categoria is null or p.categoria = :categoria)
			  and p.latitud between :latMin and :latMax
			  and p.longitud between :lngMin and :lngMax
			  and 6371 * acos(least(1.0,
			        cos(radians(:lat)) * cos(radians(round(p.latitud, 3)))
			          * cos(radians(round(p.longitud, 3)) - radians(:lng))
			        + sin(radians(:lat)) * sin(radians(round(p.latitud, 3))))) <= :radioKm
			""";

	@Query(value = "select p " + FILTRO_CERCANIA, countQuery = "select count(p) " + FILTRO_CERCANIA)
	@EntityGraph(attributePaths = "usuario")
	Page<Posteo> buscarCercanos(
			@Param("estado") EstadoPosteo estado,
			@Param("categoria") Categoria categoria,
			@Param("lat") double lat,
			@Param("lng") double lng,
			@Param("radioKm") double radioKm,
			@Param("latMin") double latMin,
			@Param("latMax") double latMax,
			@Param("lngMin") double lngMin,
			@Param("lngMax") double lngMax,
			Pageable pageable);

	// "Mis reportes": todos los del usuario salvo los que están en el estado indicado
	Page<Posteo> findByUsuarioIdAndEstadoNot(Long usuarioId, EstadoPosteo estado, Pageable pageable);

	// Otras cuentas que publicaron desde algún teléfono que usó este usuario
	@Query("""
			select distinct suyo.usuario from Posteo mio, Posteo suyo
			where mio.usuario.id = :usuarioId
			  and mio.dispositivoId is not null
			  and suyo.dispositivoId = mio.dispositivoId
			  and suyo.usuario.id <> :usuarioId
			""")
	List<Usuario> cuentasConElMismoTelefono(@Param("usuarioId") Long usuarioId);

	// Otras cuentas que publicaron desde alguna IP que usó este usuario
	@Query("""
			select distinct suyo.usuario from Posteo mio, Posteo suyo
			where mio.usuario.id = :usuarioId
			  and mio.ipPublicacion is not null
			  and suyo.ipPublicacion = mio.ipPublicacion
			  and suyo.usuario.id <> :usuarioId
			""")
	List<Usuario> cuentasConLaMismaConexion(@Param("usuarioId") Long usuarioId);

	// Reputación: cuántos reportes vigentes (no eliminados) tiene cada usuario
	@Query("""
			select new com.proyectApp.robosApp.repository.ConteoPorUsuario(p.usuario.id, count(p))
			from Posteo p
			where p.usuario.id in :usuarioIds and p.estado <> :excluido
			group by p.usuario.id
			""")
	List<ConteoPorUsuario> contarReportesPorUsuario(@Param("usuarioIds") Collection<Long> usuarioIds,
			@Param("excluido") EstadoPosteo excluido);

	// Para el límite de publicaciones por hora
	long countByUsuarioIdAndFechaHoraPublicacionAfter(Long usuarioId, LocalDateTime desde);

	// Listado del panel admin: los dos filtros son opcionales
	@EntityGraph(attributePaths = "usuario")
	@Query("""
			select p from Posteo p
			where (:usuarioId is null or p.usuario.id = :usuarioId)
			  and (:estado is null or p.estado = :estado)
			""")
	Page<Posteo> buscarParaAdmin(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPosteo estado,
			Pageable pageable);

	@Modifying
	@Query("delete from Posteo p where p.usuario.id = :usuarioId")
	void eliminarDeUsuario(@Param("usuarioId") Long usuarioId);

	// Estadísticas: no cuentan los posteos eliminados
	@Query("""
			select new com.proyectApp.robosApp.dto.ConteoCategoriaResponse(p.categoria, count(p))
			from Posteo p
			where p.estado <> :excluido and p.fechaHoraIncidente >= :desde
			group by p.categoria
			order by count(p) desc
			""")
	List<ConteoCategoriaResponse> contarPorCategoria(@Param("excluido") EstadoPosteo excluido,
			@Param("desde") LocalDateTime desde);

	// Zonas de 2 decimales (≈ 1 km), de la más cargada a la menos. El Pageable limita cuántas se devuelven.
	@Query("""
			select new com.proyectApp.robosApp.dto.PuntoHeatmapResponse(
			         round(p.latitud, 2), round(p.longitud, 2), count(p))
			from Posteo p
			where p.estado <> :excluido and p.fechaHoraIncidente >= :desde
			group by round(p.latitud, 2), round(p.longitud, 2)
			order by count(p) desc
			""")
	List<PuntoHeatmapResponse> contarPorZona(@Param("excluido") EstadoPosteo excluido,
			@Param("desde") LocalDateTime desde, Pageable pageable);

	// Mapa de calor: agrupa los reportes por coordenada aproximada (3 decimales ≈ 100 m) y los cuenta
	@Query("""
			select new com.proyectApp.robosApp.dto.PuntoHeatmapResponse(
			         round(p.latitud, 3), round(p.longitud, 3), count(p))
			from Posteo p
			where p.estado = :estado
			  and p.fechaHoraIncidente >= :desde
			  and (:categoria is null or p.categoria = :categoria)
			group by round(p.latitud, 3), round(p.longitud, 3)
			""")
	List<PuntoHeatmapResponse> heatmap(
			@Param("estado") EstadoPosteo estado,
			@Param("desde") LocalDateTime desde,
			@Param("categoria") Categoria categoria);

}
