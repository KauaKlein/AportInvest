package com.aportvest.service;


import com.aportvest.dto.AlterarSenhaDTO;
import com.aportvest.dto.UsuarioCadastroDTO;
import com.aportvest.dto.UsuarioLoginDTO;
import com.aportvest.model.Usuario;
import com.aportvest.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario cadastrar(UsuarioCadastroDTO dto) {
        if(repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado!");
        }
        Usuario novoUsuario = new Usuario();

        novoUsuario.setNome(dto.getNome());
        novoUsuario.setEmail(dto.getEmail());
        novoUsuario.setTelefone(dto.getTelefone());
        novoUsuario.setSenha(passwordEncoder.encode(dto.getSenha()));

        return repository.save(novoUsuario);
    }

    public Usuario logar(UsuarioLoginDTO dto) {
        Usuario usuario = repository.findByEmail(dto.getLogin())
                .orElseThrow(() -> new IllegalArgumentException("Email ou senha invalidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Email ou senha invalidos");
        }
        return usuario;
    }

    public Usuario atualizarTema(Long id, String tema) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        usuario.setTema(tema != null && tema.equalsIgnoreCase("dark") ? "dark" : "light");
        return repository.save(usuario);
    }

    public void alterarSenha(Long id, AlterarSenhaDTO dto) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));

        if (!passwordEncoder.matches(dto.getSenhaAtual(), usuario.getSenha())) {
            throw new IllegalArgumentException("A senha atual informada está incorreta.");
        }

        usuario.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
        repository.save(usuario);
    }
}
