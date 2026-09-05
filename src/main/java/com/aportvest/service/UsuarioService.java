package com.aportvest.service;


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

    @Autowired
    private PasswordEncoder passwordEncoder;

}
