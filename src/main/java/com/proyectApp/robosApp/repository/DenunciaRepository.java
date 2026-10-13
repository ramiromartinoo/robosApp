package com.proyectApp.robosApp.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.EstadoDenuncia;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {

	boolean existsByPosteoIdAndUsuarioDenuncianteId(Long posteoId, Long usuarioDenuncianteId);

	long countByPosteoIdAndEstado(Long posteoId, EstadoDenuncia estado);

	List<Denuncia> findByPosteoIdAndEstado(Long posteoId, EstadoDenuncia estado);

	// Ids de los posteos con denuncias en ese estado, primero los más denunciados.
	// El Pageable tiene que venir sin orden: el orden ya está en la consulta.
	@Query(value = """
			select d.posteo.id from Denuncia d
			where d.estado = :estado
			group by d.posteo.id
			order by count(d) desc, d.posteo.id desc
			""",
			countQuery = "select count(distinct d.posteo.id) from Denuncia d where d.estado = :estado")
	Page<Long> posteosMasDenunciados(@Param("estado") EstadoDenuncia estado, Pageable pageable);

	@Query("""
			select d from Denuncia d
			join fetch d.posteo p
			join fetch p.usuario
			where d.estado = :estado and p.id in :posteoIds
			order by d.fechaDenuncia
			""")
	List<Denuncia> buscarConPosteo(@Param("estado") EstadoDenuncia estado,
			@Param("posteoIds") Collection<Long> posteoIds);

	// Denuncias hechas por el usuario y denuncias sobre sus posteos (para eliminar su cuenta)
	@Modifying
	@Query("""
			delete from Denuncia d
			where d.usuarioDenunciante.id = :usuarioId
			   or d.posteo.id in (select p.id from Posteo p where p.usuario.id = :usuarioId)
			""")
	void eliminarDeUsuarioYDeSusPosteos(@Param("usuarioId") Long usuarioId);

}
