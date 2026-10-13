package com.proyectApp.robosApp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

	@Transactional(readOnly = true)
	public PaginaResponse<UsuarioResponse> listar(int pagina, int tamanio) {
		return PaginaResponse.desde(usuarioRepository
				.findAll(Paginacion.masRecientesPrimero(pagina, tamanio, "fechaRegistro"))
				.map(UsuarioResponse::desde));
	}

	// Suspender, banear o reactivar. Un usuario que no está ACTIVO no puede usar la API.
	@Transactional
	public UsuarioResponse cambiarEstado(Long id, EstadoUsuario estado) {
		Usuario usuario = buscarCliente(id);
		usuario.setEstado(estado);
		return UsuarioResponse.desde(usuario);
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

	private Usuario buscarCliente(Long id) {
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe"));
		if (usuario.getRol() == Rol.ADMIN) {
			throw new ConflictoException("No se puede modificar ni eliminar a un administrador");
		}
		return usuario;
	}

}
