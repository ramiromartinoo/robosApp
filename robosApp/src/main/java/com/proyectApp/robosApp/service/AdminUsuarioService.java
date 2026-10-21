package com.proyectApp.robosApp.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.CuentasRelacionadasResponse;
import com.proyectApp.robosApp.dto.CuentasRelacionadasResponse.CuentaRelacionada;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.UsuarioResponse;
import com.proyectApp.robosApp.entity.EstadoUsuario;
import com.proyectApp.robosApp.entity.Rol;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.AceptacionTerminosRepository;
import com.proyectApp.robosApp.repository.ConfirmacionRepository;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;
import com.proyectApp.robosApp.repository.SugerenciaRepository;
import com.proyectApp.robosApp.repository.UsuarioRepository;
import com.proyectApp.robosApp.service.ReputacionService.Reputacion;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final PosteoRepository posteoRepository;
	private final DenunciaRepository denunciaRepository;
	private final ConfirmacionRepository confirmacionRepository;
	private final AceptacionTerminosRepository aceptacionRepository;
	private final SugerenciaRepository sugerenciaRepository;
	private final ReputacionService reputacionService;

	@Transactional(readOnly = true)
	public PaginaResponse<UsuarioResponse> listar(int pagina, int tamanio) {
		Page<Usuario> usuarios = usuarioRepository
				.findAll(Paginacion.masRecientesPrimero(pagina, tamanio, "fechaRegistro"));
		Map<Long, Reputacion> reputaciones = reputacionService
				.deUsuarios(usuarios.getContent().stream().map(Usuario::getId).toList());
		return PaginaResponse.desde(usuarios.map(usuario -> conReputacion(usuario, reputaciones)));
	}

	// Otras cuentas que publicaron desde el mismo teléfono o la misma conexión (vale también para administradores)
	@Transactional(readOnly = true)
	public CuentasRelacionadasResponse cuentasRelacionadas(Long id) {
		if (!usuarioRepository.existsById(id)) {
			throw new RecursoNoEncontradoException("El usuario no existe");
		}
		List<CuentaRelacionada> mismoTelefono = posteoRepository.cuentasConElMismoTelefono(id).stream()
				.map(CuentaRelacionada::desde)
				.toList();
		// si ya aparece por el teléfono, no se repite como "misma conexión"
		Set<Long> yaListadas = mismoTelefono.stream().map(CuentaRelacionada::id).collect(Collectors.toSet());
		List<CuentaRelacionada> mismaConexion = posteoRepository.cuentasConLaMismaConexion(id).stream()
				.filter(usuario -> !yaListadas.contains(usuario.getId()))
				.map(CuentaRelacionada::desde)
				.toList();
		return new CuentasRelacionadasResponse(mismoTelefono, mismaConexion);
	}

	// Suspender, banear o reactivar. Un usuario que no está ACTIVO no puede usar la API.
	@Transactional
	public UsuarioResponse cambiarEstado(Long id, EstadoUsuario estado) {
		Usuario usuario = buscarCliente(id);
		usuario.setEstado(estado);
		return conReputacion(usuario, reputacionService.deUsuarios(List.of(id)));
	}

	// Borrado definitivo del usuario y de todo lo suyo. No se puede deshacer.
	// Para impedir que vuelva a entrar hay que banearlo: si se lo elimina, puede registrarse de nuevo.
	@Transactional
	public void eliminar(Long id) {
		Usuario usuario = buscarCliente(id);
		// el orden importa: primero lo que apunta a sus posteos, después los posteos, al final el usuario
		confirmacionRepository.eliminarDeUsuarioYDeSusPosteos(id);
		denunciaRepository.eliminarDeUsuarioYDeSusPosteos(id);
		posteoRepository.eliminarDeUsuario(id);
		aceptacionRepository.eliminarDeUsuario(id);
		sugerenciaRepository.eliminarDeUsuario(id);
		usuarioRepository.delete(usuario);
	}

	private UsuarioResponse conReputacion(Usuario usuario, Map<Long, Reputacion> reputaciones) {
		Reputacion reputacion = reputaciones.get(usuario.getId());
		return UsuarioResponse.desde(usuario, reputacion.nivel(), reputacion.puntos());
	}

	private Usuario buscarCliente(Long id) {
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe"));
		if (usuario.getRol() == Rol.ADMIN) {
			throw new ConflictoException("No se puede modificar ni eliminar a un administrador");
		}
		return usuario;
	}

}
